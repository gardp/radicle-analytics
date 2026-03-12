FROM python:3.11
# Install uv directly in container
RUN pip install uv
# Copy pyproject.toml (and uv.lock if using Poetry)
COPY pyproject.toml uv.lock ./
# Install dependencies using uv
RUN uv pip install --system .