# Digi Dars
🕌 Dars CRM - Master Repository
An enterprise, multi-tenant SaaS platform for Masjids and Islamic Centers to manage Hifz/Tarbiyyah tracking, Zakat-compliant accounting, AI-generated progress reports, and WhatsApp parent communications.

🏗️ Architecture Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, next-themes (Dark Mode), Recharts.

Backend: FastAPI (Python 3.11), SQLAlchemy (Asyncpg), Pydantic.

Database: PostgreSQL 15 (with Row Level Security enforced).

Vector DB: Pinecone (Namespaced by center_id).

Asynchronous Workers: Redis + Celery + Celery Beat.

Integrations: OpenAI (gpt-4o), Meta WhatsApp Cloud API, Stripe, Sentry.

Infrastructure: Docker Compose, Nginx Reverse Proxy, AWS S3 (Backups), Prometheus/Grafana.
Welcome to the Digi Dars project repository.
⚙️ 1. Environment Variables (.env)
Before starting the application, create a .env file in the root directory. Never commit this file to version control.

Bash
# --- POSTGRESQL ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=supersecretpassword
POSTGRES_DB=dars_crm
DATABASE_URL=postgresql+asyncpg://postgres:supersecretpassword@db:5432/dars_crm

# --- REDIS & CELERY ---
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# --- INTEGRATIONS ---
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pc-sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
WA_PHONE_NUMBER_ID=123456789
WA_ACCESS_TOKEN=EAAB...
WA_VERIFY_TOKEN=my_secure_verify_token

# --- OBSERVABILITY ---
SENTRY_DSN=https://your-key@sentry.io/123
ENVIRONMENT=production

# --- INITIAL BOOTSTRAP ---
SUPER_ADMIN_EMAIL=admin@darscrm.com
SUPER_ADMIN_PASSWORD=ChangeMeImmediately123!
🚀 2. Deployment (Production)
Step 1: Start the Docker Stack
This will pull the images, build the Next.js standalone frontend, and launch all 5 core containers.

Bash
docker-compose up --build -d
Step 2: Run Database Migrations
Create the tables and apply Row Level Security (RLS) policies inside the Postgres container.

Bash
docker exec -it dars_api alembic upgrade head
Step 3: Seed the Database
Generate the first global Super Admin and initial Center to solve the chicken-and-egg login problem.

Bash
docker exec -it dars_api python seed_db.py
🛠️ 3. Standard Operating Procedures (SOPs)
A. Checking System Health & Logs
We use structured JSON logging. To view real-time API logs:

Bash
docker logs -f dars_api
To view background task (WhatsApp/AI) logs:

Bash
docker logs -f dars_celery_worker
B. Applying Backend Updates
When a developer merges new code to the main branch:

Pull the latest code: git pull origin main

Rebuild the API container without dropping the database:

Bash
docker-compose up -d --build api celery_worker
Apply any new database schema changes:

Bash
docker exec -it dars_api alembic upgrade head
C. Database Backups & Recovery
Backups run automatically every night at 2:00 AM via cron and are uploaded to AWS S3.

Manual Backup: /opt/dars_backups/db_backup.sh

Restore from S3:

Bash
aws s3 cp s3://your-dars-crm-backups-bucket/dars_db_backup_TIMESTAMP.sql.gz .
gunzip dars_db_backup_TIMESTAMP.sql.gz
docker exec -i dars_postgres psql -U postgres -d dars_crm < dars_db_backup_TIMESTAMP.sql
🚨 4. Emergency Contacts & Escalation
500 Internal Server Errors: Check the Sentry dashboard immediately.

WhatsApp Bot Not Replying: Check dars_celery_worker logs. If rate-limited by Meta, the Celery retry policy (countdown=60) will automatically attempt redelivery.

Dashboard Not Loading: Verify Nginx status (sudo systemctl status nginx) and Grafana (http://localhost:3001) for Next.js CPU spikes.
