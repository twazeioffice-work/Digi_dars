import asyncio
from datetime import date
from celery import shared_task

from app.database import get_db
from app.services.rag_ai_aggregation import fetch_weekly_remarks_for_all_students
from app.services.rag_ai import get_embedding, upsert_to_vector_db

@shared_task(name="tasks.vector.sync_weekly_remarks")
def sync_weekly_remarks_to_vector_db():
    """
    Celery Beat task: Runs weekly. 
    Aggregates text, generates embeddings, and pushes to Pinecone.
    """
    asyncio.run(_process_and_sync())

async def _process_and_sync():
    current_year, current_week, _ = date.today().isocalendar()
    vectors_to_upsert = []

    db = next(get_db())
    try:
        student_data = fetch_weekly_remarks_for_all_students(db)

        for student_id, data in student_data.items():
            if not data["text"].strip():
                continue

            embedding = await get_embedding(data["text"])
            vector_id = f"wk_{current_year}_{current_week}_{student_id}"
            
            metadata = {
                "student_id": student_id,
                "center_id": data["center_id"],
                "year": current_year,
                "week": current_week,
                "document_type": "weekly_ustad_remarks",
                "raw_text": data["text"]
            }

            vectors_to_upsert.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })

        upsert_to_vector_db(vectors_to_upsert)
        print(f"Successfully synced {len(vectors_to_upsert)} student chunks to Vector DB.")
    finally:
        db.close()
