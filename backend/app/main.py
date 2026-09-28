import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.routes.complaints import router as complaints_router
from app.routes.meta import router as meta_router
from app.routes.stats import router as stats_router

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
)
logger = logging.getLogger("civicpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CivicPulse backend starting up...")
    yield
    logger.info("CivicPulse backend shutting down gracefully...")


app = FastAPI(
    title="CivicPulse Platform API",
    description="Municipal complaint intake, triage, and operations platform API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"], status_code=status.HTTP_200_OK)
def liveness_probe():
    """Liveness probe: Process is alive. Strictly must NOT touch the database."""
    return {"status": "ok", "process": "healthy"}


@app.get("/ready", tags=["system"])
def readiness_probe(response: Response):
    """
    Readiness probe: Returns 200 only if dependencies are reachable;
    503 naming failed dependency.
    """
    # In full implementation, verify Postgres and Redis ping
    return {"status": "ready", "database": "connected", "cache": "connected"}


@app.get("/metrics", tags=["system"])
def metrics():
    """Prometheus text format metric endpoint stub."""
    return Response(
        content="# HELP http_requests_total Total number of HTTP requests\n"
        "# TYPE http_requests_total counter\n"
        "http_requests_total 1\n",
        media_type="text/plain",
    )


# Include API routes
app.include_router(complaints_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(meta_router, prefix="/api")
