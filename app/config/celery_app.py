from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    'dars_crm',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

celery_app.conf.task_routes = {
    'tasks.messaging.*': {'queue': 'q_urgent'},
    'tasks.vector.*': {'queue': 'q_vector_sync'},
    'tasks.llm.*': {'queue': 'q_llm_batch'},
}

celery_app.conf.beat_schedule = {
    'sync-weekly-remarks': {
        'task': 'tasks.vector.sync_weekly_remarks',
        'schedule': crontab(hour=23, minute=30, day_of_week='friday'),
    },
}

app = celery_app
