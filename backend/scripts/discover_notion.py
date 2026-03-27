"""
NOTION DATABASE DISCOVERY SCRIPT
=================================
Purpose: Connects to your Notion database and prints out:
  1. The database title
  2. Every property (column) name and its type
  3. A sample of the first 3 rows so you can see real data

Usage:
  cd backend
  source .venv/bin/activate
  python scripts/discover_notion.py

Requirements:
  - NOTION_TOKEN in your .env file
  - The Notion database must be shared with your integration

How it works:
  - Uses the official notion-client Python SDK
  - Calls data_sources.retrieve() to get schema (column definitions)
  - Calls data_sources.query() to get sample rows
  - Prints everything in a human-readable format
"""

import os
import json
from dotenv import load_dotenv
from notion_client import Client

# ─── CONFIGURATION ───────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))  # loads backend/.env

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATA_SOURCE_ID = "d7677cf6-2514-44ca-93eb-cbf30b3a05be"

if not NOTION_TOKEN:
    raise ValueError("NOTION_TOKEN not found in .env file")

# ─── INITIALIZE CLIENT ──────────────────────────────────────────
# The Client handles authentication and all API calls.
# auth= is your integration token (starts with ntn_ or secret_)
notion = Client(auth=NOTION_TOKEN)


def discover_schema():
    """
    Retrieves the database metadata (schema).
    
    data_sources.retrieve() returns:
      - title: the database name
      - properties: dict of {property_name: {type, ...config}}
    
    Each property has a 'type' field like:
      title, rich_text, number, select, multi_select, date,
      url, checkbox, relation, rollup, formula, etc.
    """
    print("=" * 60)
    print("DISCOVERING NOTION DATABASE SCHEMA")
    print("=" * 60)
    
    db = notion.data_sources.retrieve(data_source_id=DATA_SOURCE_ID)
    
    # Print database title
    title_parts = db.get("title", [])
    db_title = "".join([t.get("plain_text", "") for t in title_parts])
    print(f"\nDatabase: {db_title}")
    print(f"Data source ID: {DATA_SOURCE_ID}")
    print("-" * 60)
    
    # Print each property (column) and its type
    properties = db.get("properties", {})
    print(f"\nFound {len(properties)} properties (columns):\n")
    
    for prop_name, prop_config in properties.items():
        prop_type = prop_config.get("type", "unknown")
        extra = ""
        
        # Show extra detail for select/multi_select (the allowed options)
        if prop_type == "select":
            options = prop_config.get("select", {}).get("options", [])
            option_names = [o["name"] for o in options]
            extra = f"  Options: {option_names}"
        elif prop_type == "multi_select":
            options = prop_config.get("multi_select", {}).get("options", [])
            option_names = [o["name"] for o in options]
            extra = f"  Options: {option_names}"
        elif prop_type == "relation":
            relation_config = prop_config.get("relation", {})
            extra = f"  Related DB: {relation_config.get('database_id', 'N/A')}"
        
        print(f"  [{prop_type:15s}] {prop_name}")
        if extra:
            print(f"                    {extra}")
    
    return properties


def discover_sample_rows(max_rows=3):
    """
    Queries the first few rows from the database.
    
    data_sources.query() returns pages. Each page has a 'properties' dict
    where each key is a property name and the value contains the actual data.
    
    The data format varies by type:
      - title:        properties[name]["title"][0]["plain_text"]
      - rich_text:    properties[name]["rich_text"][0]["plain_text"]
      - number:       properties[name]["number"]
      - select:       properties[name]["select"]["name"]
      - multi_select: [item["name"] for item in properties[name]["multi_select"]]
      - url:          properties[name]["url"]
      - date:         properties[name]["date"]["start"]
      - checkbox:     properties[name]["checkbox"]
      - relation:     [item["id"] for item in properties[name]["relation"]]
    """
    print("\n" + "=" * 60)
    print(f"SAMPLE DATA (first {max_rows} rows)")
    print("=" * 60)
    
    results = notion.data_sources.query(
        data_source_id=DATA_SOURCE_ID,
        page_size=max_rows  # limit to first N rows
    )
    
    pages = results.get("results", [])
    print(f"\nTotal rows returned: {len(pages)}")
    
    for i, page in enumerate(pages):
        print(f"\n--- Row {i + 1} ---")
        props = page.get("properties", {})
        
        for prop_name, prop_value in props.items():
            readable = extract_value(prop_name, prop_value)
            print(f"  {prop_name}: {readable}")
    
    # Also dump the raw JSON of the first row for full inspection
    if pages:
        print("\n" + "=" * 60)
        print("RAW JSON OF FIRST ROW (for debugging)")
        print("=" * 60)
        print(json.dumps(pages[0]["properties"], indent=2, default=str))


def extract_value(name, prop):
    """
    Extracts a human-readable value from a Notion property object.
    
    Notion stores values in nested structures that vary by type.
    This function normalizes them into simple Python values.
    """
    ptype = prop.get("type", "")
    
    if ptype == "title":
        parts = prop.get("title", [])
        return "".join([p.get("plain_text", "") for p in parts]) or "(empty)"
    
    elif ptype == "rich_text":
        parts = prop.get("rich_text", [])
        return "".join([p.get("plain_text", "") for p in parts]) or "(empty)"
    
    elif ptype == "number":
        return prop.get("number")
    
    elif ptype == "select":
        sel = prop.get("select")
        return sel["name"] if sel else "(empty)"
    
    elif ptype == "multi_select":
        items = prop.get("multi_select", [])
        return [item["name"] for item in items] or "(empty)"
    
    elif ptype == "url":
        return prop.get("url") or "(empty)"
    
    elif ptype == "date":
        date_obj = prop.get("date")
        if date_obj:
            return f"{date_obj.get('start', '')} → {date_obj.get('end', '')}"
        return "(empty)"
    
    elif ptype == "checkbox":
        return prop.get("checkbox", False)
    
    elif ptype == "relation":
        items = prop.get("relation", [])
        return [item["id"] for item in items] or "(no relations)"
    
    elif ptype == "rollup":
        return prop.get("rollup", {})
    
    elif ptype == "formula":
        formula = prop.get("formula", {})
        return formula.get(formula.get("type", ""), "")
    
    elif ptype == "files":
        files = prop.get("files", [])
        return [f.get("name", "") for f in files] or "(no files)"
    
    elif ptype == "people":
        people = prop.get("people", [])
        return [p.get("name", "") for p in people] or "(no people)"
    
    elif ptype == "created_time":
        return prop.get("created_time", "")
    
    elif ptype == "last_edited_time":
        return prop.get("last_edited_time", "")
    
    else:
        return f"({ptype}: {json.dumps(prop, default=str)[:100]})"


if __name__ == "__main__":
    discover_schema()
    discover_sample_rows()
