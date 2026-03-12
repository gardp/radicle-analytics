from fastapi import FastAPI

app = FastAPI(
    title="Radicle Analytics API",
    description="API for tracking and analyzing Radicle project metrics",
    version="0.1.0"
)

@app.get("/")
def read_root():
    return {"Hello": "World"}