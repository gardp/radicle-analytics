"""
Notion -> Supabase migration for "music tools"
===============================================

What this script does
---------------------
1) Reads rows from your Notion data source (music tools)
2) Transforms each row into your SQLAlchemy schema
3) Inserts rows into:
   - platforms
   - instructions

Transformation strategy (current default)
----------------------------------------
Notion columns:
  - To do (title)
  - Source (rich_text)
  - Details (rich_text)
  - Platform (multi_select)
  - tag (multi_select)
  - Files & media (files)

Mapped to SQLAlchemy models:
  - Platform.name                <- each value in Notion Platform multi_select
  - Platform.type                <- PlatformType.TOOL (configurable)
  - Instruction.name             <- Details (fallback to To do)
  - Instruction.instructions     <- To do
  - Instruction.source           <- URL(s) extracted from Source rich_text
  - Instruction.platform_id      <- linked platform row
  - Instruction.notes            <- JSON string with tags, files, source_text, notion_page_id

Why duplicate instructions?
---------------------------
Your schema has 1 platform per instruction (instructions.platform_id is scalar).
If one Notion row has multiple platforms, this script creates one instruction per
platform so no information is lost.

Usage examples
--------------
Dry-run first (recommended):
  python scripts/migrate_music_tools_from_notion.py --dry-run --limit 20

Full migration:
  python scripts/migrate_music_tools_from_notion.py

Custom data source and options:
  python scripts/migrate_music_tools_from_notion.py \
    --data-source-id d7677cf6-2514-44ca-93eb-cbf30b3a05be \
    --platform-type tool
"""

from __future__ import annotations

import argparse
import json
import os
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from notion_client import Client
from sqlalchemy import MetaData, Table, create_engine, select
from sqlalchemy.exc import OperationalError


DEFAULT_DATA_SOURCE_ID = "d7677cf6-2514-44ca-93eb-cbf30b3a05be"


@dataclass
class MigrationStats:
    pages_seen: int = 0
    platforms_created: int = 0
    platforms_reused: int = 0
    instructions_created: int = 0
    instructions_updated: int = 0
    instructions_skipped: int = 0


# Parse CLI arguments to control source ID, platform type, and execution mode.
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate Notion 'music tools' data source to Supabase schema"
    )
    parser.add_argument(
        "--data-source-id",
        default=DEFAULT_DATA_SOURCE_ID,
        help="Notion data source ID (music tools by default)",
    )
    parser.add_argument(
        "--platform-type",
        default="tool",
        choices=["distribution", "admin", "tool", "promotion", "analytics"],
        help="Value for platforms.type when creating new platform rows",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run transform logic but rollback all DB writes",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only first N Notion rows (for testing)",
    )
    return parser.parse_args()


# Normalize enum-like input values so comparisons/inserts are consistent.
def normalize_platform_type(value: str) -> str:
    return value.strip().upper()


# Load required runtime secrets/config from .env.prod and validate presence.
def load_environment() -> tuple[str, str]:
    env_path = Path(__file__).resolve().parent.parent / ".env.prod"
    load_dotenv(env_path)

    notion_token = os.getenv("NOTION_TOKEN")
    database_url = os.getenv("SUPABASE_PROD_DB_URL")

    if not notion_token:
        raise ValueError("NOTION_TOKEN missing in backend/.env.prod")
    if not database_url:
        raise ValueError("SUPABASE_PROD_DB_URL missing in backend/.env.prod")

    return notion_token, database_url


# Convert a Notion rich text/title list into a single plain string value.
def text_from_property(prop: dict[str, Any], key: str) -> str:
    items = prop.get(key, [])
    return "".join(part.get("plain_text", "") for part in items).strip()


# Extract multi-select option names from a Notion property as a list of strings.
def multi_select_names(prop: dict[str, Any]) -> list[str]:
    return [x.get("name", "").strip() for x in prop.get("multi_select", []) if x.get("name")]


# Extract and deduplicate URLs from Notion rich_text (explicit href and inline URL text).
def extract_urls_from_source_rich_text(prop: dict[str, Any]) -> list[str]:
    urls: list[str] = []
    for part in prop.get("rich_text", []):
        href = part.get("href")
        if href:
            urls.append(href)

        text_content = part.get("plain_text", "") or ""
        for match in re.findall(r"https?://[^\s)\]>\"']+", text_content):
            urls.append(match)

    deduped: list[str] = []
    for value in urls:
        if value not in deduped:
            deduped.append(value)
    return deduped


# Normalize Notion file objects into a minimal {name, url} structure for notes metadata.
def files_list(prop: dict[str, Any]) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for file_item in prop.get("files", []):
        name = file_item.get("name", "")
        url = ""
        if file_item.get("type") == "external":
            url = file_item.get("external", {}).get("url", "")
        elif file_item.get("type") == "file":
            url = file_item.get("file", {}).get("url", "")
        out.append({"name": name, "url": url})
    return out


# Build a stable UUID for one Notion row + one platform, so reruns update the same instruction.
def instruction_id_for_row_platform(notion_page_id: str, platform_id: uuid.UUID) -> uuid.UUID:
    stable_key = f"{notion_page_id}:{platform_id}"
    return uuid.uuid5(uuid.NAMESPACE_URL, stable_key)


# Retrieve all pages from the Notion data source, handling pagination and optional limits.
def fetch_pages(notion: Client, data_source_id: str, limit: int | None) -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    cursor: str | None = None

    while True:
        payload: dict[str, Any] = {"data_source_id": data_source_id, "page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor

        response = notion.data_sources.query(**payload)
        batch = response.get("results", [])
        pages.extend(batch)

        if limit is not None and len(pages) >= limit:
            return pages[:limit]

        if not response.get("has_more"):
            return pages

        cursor = response.get("next_cursor")


# Reuse an existing platform by name or create a new one when missing.
def get_or_create_platform(
    conn,
    platforms_table: Table,
    platform_name: str,
    platform_type: str,
    stats: MigrationStats,
) -> uuid.UUID:
    existing = conn.execute(
        select(platforms_table.c.platform_id).where(platforms_table.c.name == platform_name)
    ).scalar_one_or_none()

    if existing:
        stats.platforms_reused += 1
        return existing

    now = datetime.now(timezone.utc)
    new_platform_id = uuid.uuid4()
    conn.execute(
        platforms_table.insert().values(
            platform_id=new_platform_id,
            name=platform_name,
            type=platform_type,
            description="Imported from Notion music tools",
            notes="Created by scripts/migrate_music_tools_from_notion.py",
            is_active=True,
            account_data="platform_base",
            created_at=now,
            updated_at=now,
        )
    )
    stats.platforms_created += 1
    return new_platform_id


# Transform one Notion row into an instruction record and upsert it by stable identity.
def create_instruction(
    conn,
    instructions_table: Table,
    page: dict[str, Any],
    platform_id: uuid.UUID | None,
    stats: MigrationStats,
) -> None:
    props = page.get("properties", {})
    notion_page_id = page.get("id")

    if not notion_page_id:
        stats.instructions_skipped += 1
        return

    todo = text_from_property(props.get("To do", {}), "title")
    source_text = text_from_property(props.get("Source", {}), "rich_text")
    source_urls = extract_urls_from_source_rich_text(props.get("Source", {}))
    details = text_from_property(props.get("Details", {}), "rich_text")
    tag_values = multi_select_names(props.get("tag", {}))
    files = files_list(props.get("Files & media", {}))

    if not todo and not source_text and not details:
        stats.instructions_skipped += 1
        return

    notes_payload = {
        "notion_page_id": notion_page_id,
        "source_text": source_text,
        "source_urls": source_urls,
        "tags": tag_values,
        "files": files,
        "migration_source": "notion_music_tools",
    }

    instruction_name = ", ".join(tag_values) if tag_values else "Notion imported instruction"
    description_value = "\n\n".join(part for part in [todo, details] if part) or None

    deterministic_instruction_id = instruction_id_for_row_platform(notion_page_id, platform_id)

    existing_id = conn.execute(
        select(instructions_table.c.instruction_id).where(
            instructions_table.c.instruction_id == deterministic_instruction_id
        )
    ).scalar_one_or_none()

    # Backward-compatible lookup for rows inserted before deterministic IDs were introduced.
    if not existing_id:
        legacy_match = conn.execute(
            select(instructions_table.c.instruction_id).where(
                instructions_table.c.platform_id == platform_id,
                instructions_table.c.notes.like(f'%"notion_page_id": "{notion_page_id}"%'),
            )
        ).scalar_one_or_none()
        if legacy_match:
            existing_id = legacy_match

    source_value = ", ".join(source_urls) if source_urls else None

    now = datetime.now(timezone.utc)
    values: dict[str, Any] = {
        "instruction_id": deterministic_instruction_id,
        "name": instruction_name,
        "description": description_value,
        "instructions": description_value,
        "is_active": True,
        "notes": json.dumps(notes_payload, ensure_ascii=True),
        "platform_id": platform_id,
        "created_at": now,
        "updated_at": now,
        "goals": None,
    }
    if "source" in instructions_table.c:
        values["source"] = source_value
    if "sources" in instructions_table.c:
        values["sources"] = source_urls or None
  
    if existing_id:
        update_values = dict(values)
        update_values.pop("instruction_id", None)
        update_values.pop("created_at", None)
        conn.execute(
            instructions_table.update()
            .where(instructions_table.c.instruction_id == existing_id)
            .values(**update_values)
        )
        stats.instructions_updated += 1
    else:
        conn.execute(instructions_table.insert().values(**values))
        stats.instructions_created += 1


# Orchestrate the full ETL flow: load env, fetch Notion rows, transform, and write transactionally.
def migrate(args: argparse.Namespace) -> MigrationStats:
    notion_token, database_url = load_environment()
    notion = Client(auth=notion_token)

    engine = create_engine(database_url)

    platform_type = normalize_platform_type(args.platform_type)
    stats = MigrationStats()

    pages = fetch_pages(notion, args.data_source_id, args.limit)
    print(f"Fetched {len(pages)} Notion rows from data source {args.data_source_id}")

    metadata = MetaData()
    platforms_table = Table("platforms", metadata, autoload_with=engine)
    instructions_table = Table("instructions", metadata, autoload_with=engine)

    with engine.connect() as conn:
        transaction = conn.begin()
        for page in pages:
            stats.pages_seen += 1
            props = page.get("properties", {})
            platform_names = multi_select_names(props.get("Platform", {}))

            if not platform_names:
                stats.instructions_skipped += 1
                continue

            for platform_name in platform_names:
                platform_id = get_or_create_platform(
                    conn=conn,
                    platforms_table=platforms_table,
                    platform_name=platform_name,
                    platform_type=platform_type,
                    stats=stats,
                )
                create_instruction(
                    conn=conn,
                    instructions_table=instructions_table,
                    page=page,
                    platform_id=platform_id,
                    stats=stats,
                )

        if args.dry_run:
            transaction.rollback()
            print("Dry run complete: transaction rolled back")
        else:
            transaction.commit()
            print("Migration complete: transaction committed")

    return stats


# Entry point: parse arguments, run migration, and print a readable summary/error output.
def main() -> None:
    args = parse_args()
    try:
        stats = migrate(args)
    except OperationalError:
        print("Database connection failed.")
        print("Check SUPABASE_PROD_DB_URL in backend/.env.prod")
        print("If host is 'db', start Docker compose first, or switch to your Supabase URL.")
        raise SystemExit(1)

    print("\nMigration summary")
    print("-----------------")
    print(f"Rows processed:         {stats.pages_seen}")
    print(f"Platforms created:      {stats.platforms_created}")
    print(f"Platforms reused:       {stats.platforms_reused}")
    print(f"Instructions created:   {stats.instructions_created}")
    print(f"Instructions updated:   {stats.instructions_updated}")
    print(f"Instructions skipped:   {stats.instructions_skipped}")


if __name__ == "__main__":
    main()
