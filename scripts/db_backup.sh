#!/bin/bash

# ==========================================
# Dars CRM - Automated PostgreSQL Backup
# ==========================================

# Configuration
S3_BUCKET="s3://your-dars-crm-backups-bucket"
BACKUP_DIR="/opt/dars_backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/dars_db_backup_$TIMESTAMP.sql.gz"

# Docker & Database Details (From your docker-compose.yml)
CONTAINER_NAME="dars_postgres"
DB_USER="postgres"
DB_NAME="dars_crm"

# Log file
LOG_FILE="$BACKUP_DIR/backup_log.txt"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup process..." >> "$LOG_FILE"

# 1. Execute pg_dump inside the Docker container and pipe to gzip
# (Note: Do NOT use the '-it' flags here, as cron is non-interactive)
/usr/bin/docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_FILE"

# Check if the dump was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Database dumped and compressed successfully: $BACKUP_FILE" >> "$LOG_FILE"
else
    echo "[$(date)] ERROR: Database dump failed!" >> "$LOG_FILE"
    exit 1
fi

# 2. Upload to AWS S3
/usr/bin/aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date)] Uploaded to S3 successfully." >> "$LOG_FILE"
else
    echo "[$(date)] ERROR: S3 upload failed!" >> "$LOG_FILE"
    exit 1
fi

# 3. Clean up local backups older than 7 days to save server disk space
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
echo "[$(date)] Cleaned up old local backups." >> "$LOG_FILE"
echo "------------------------------------------------" >> "$LOG_FILE"
