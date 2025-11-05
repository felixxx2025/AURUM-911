#!/bin/bash
set -e

BACKUP_DIR="/backups/aurum-911"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

echo "Starting Redis backup..."
redis-cli --rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

echo "Uploading to S3..."
aws s3 sync "$BACKUP_DIR" "s3://$S3_BACKUP_BUCKET/aurum-911/"

echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully!"