import json
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from sqlalchemy import text

from app.db import engine
from app.providers.cache.redis_client import get_redis_client
from app.routes.complaints import router as complaints_router
from app.routes.meta import router as meta_router
from app.routes.stats import router as stats_router

# Configure Structured JSON Logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("civicpulse")

# Prometheus Metrics
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests processed",
    ["method", "endpoint", "status"],
)
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
)
TRIAGE_DURATION_SECONDS = Histogram(
    "triage_duration_seconds",
    "Triage latency in seconds",
    ["provider"],
)
TRIAGE_FALLBACK_TOTAL = Counter(
    "triage_fallback_total",
    "Total count of triage fallbacks to rules",
    ["provider"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(
        json.dumps(
            {
                "event": "startup",
                "message": "CivicPulse backend starting up...",
            }
        )
    )
    yield
    # Graceful Shutdown: close pool connections
    logger.info(
        json.dumps(
            {
                "event": "shutdown",
                "message": "CivicPulse backend shutting down gracefully. Draining connection pools...",
            }
        )
    )
    engine.dispose()
    redis_client = get_redis_client()
    redis_client.close()


app = FastAPI(
    title="CivicPulse Platform API",
    description="Municipal complaint intake, triage, and operations platform API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured Logging and Metrics Middleware
@app.middleware("http")
async def structured_logging_and_metrics_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response: Response
    try:
        response = await call_next(request)
    except Exception as exc:
        duration = time.time() - start_time
        logger.error(
            json.dumps(
                {
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "level": "ERROR",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": round(duration * 1000, 2),
                    "error": str(exc),
                }
            )
        )
        raise exc

    duration = time.time() - start_time
    response.headers["X-Request-ID"] = request_id

    # Record Prometheus metrics
    endpoint = request.url.path
    status_str = str(response.status_code)
    HTTP_REQUESTS_TOTAL.labels(method=request.method, endpoint=endpoint, status=status_str).inc()
    HTTP_REQUEST_DURATION_SECONDS.labels(method=request.method, endpoint=endpoint).observe(duration)

    logger.info(
        json.dumps(
            {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "level": "INFO",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            }
        )
    )
    return response


# Field-level 400 validation error handler (as per specification)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_loc = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append(
            {
                "field": field_loc or "body",
                "message": err.get("msg"),
                "type": err.get("type"),
            }
        )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Validation error", "errors": errors},
    )


@app.get("/health", tags=["system"], status_code=status.HTTP_200_OK)
def liveness_probe():
    """
    Liveness probe: Process is alive.
    Strictly must NOT touch the database or cache.
    """
    return {"status": "ok", "process": "healthy"}


@app.get("/ready", tags=["system"])
def readiness_probe(response: Response):
    """
    Readiness probe: Returns 200 only if Postgres and Redis are both reachable;
    503 naming the failed dependency.
    """
    failed_dependencies = []

    # 1. Check PostgreSQL reachability
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        failed_dependencies.append(f"database ({e.__class__.__name__})")

    # 2. Check Redis reachability
    try:
        redis_client = get_redis_client()
        if not redis_client.ping():
            failed_dependencies.append("cache (redis ping failed)")
    except Exception as e:
        failed_dependencies.append(f"cache ({e.__class__.__name__})")

    if failed_dependencies:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unready",
            "failed_dependencies": failed_dependencies,
            "detail": f"Dependencies unreachable: {', '.join(failed_dependencies)}",
        }

    return {"status": "ready", "database": "connected", "cache": "connected"}


@app.get("/metrics", tags=["system"])
def metrics():
    """Prometheus text format metric exposition endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Include API routes
app.include_router(complaints_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(meta_router, prefix="/api")
