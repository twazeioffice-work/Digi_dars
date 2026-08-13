import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_BACKEND = os.getenv("REDIS_BACKEND_URL", "redis://localhost:6379/1")

# Enable in-memory eager task execution for local tests if Redis is offline / in testing mode
IS_TESTING = os.getenv("TESTING", "true").lower() in ("true", "1")

celery_app = Celery(
    "dars_crm",
    broker=REDIS_URL if not IS_TESTING else "memory://",
    backend=REDIS_BACKEND if not IS_TESTING else "rpc://"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_always_eager=IS_TESTING,
    task_eager_propagates=IS_TESTING,
    task_routes={
        "tasks.messaging.*": {"queue": "q_urgent"},
        "tasks.vector.*": {"queue": "q_vector_sync"},
        "tasks.ai.*": {"queue": "q_llm_batch"},
    },
    task_annotations={
        "tasks.ai.generate_student_report": {"rate_limit": "10/m"}
    }
)
