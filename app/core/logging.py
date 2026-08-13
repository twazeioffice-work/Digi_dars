import logging
import sys
import structlog

def setup_structured_logging():
    """
    Configures structlog to output machine-readable JSON logs 
    and hijacks the standard library logging to use the same format.
    """
    # 1. Define the processors pipeline
    processors = [
        structlog.contextvars.merge_contextvars,     # Merges global context (like tenant_id)
        structlog.stdlib.add_log_level,              # Adds "level": "info"
        structlog.stdlib.add_logger_name,            # Adds "logger": "fastapi"
        structlog.processors.TimeStamper(fmt="iso"), # Adds "timestamp": "2026-08-13T14:07:23Z"
        structlog.processors.StackInfoRenderer(),    # Adds stack traces on exceptions
        structlog.processors.format_exc_info,        # Formats exceptions cleanly
        structlog.processors.JSONRenderer()          # Outputs the final dictionary as a JSON string
    ]

    # 2. Configure structlog
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # 3. Hijack Uvicorn & Standard Library logs to use structlog formatting
    formatter = structlog.stdlib.ProcessorFormatter(
        processor=structlog.processors.JSONRenderer(),
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)
    
    # Silence overly verbose libraries if needed
    logging.getLogger("uvicorn.access").disabled = True
