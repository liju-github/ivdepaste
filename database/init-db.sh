#!/bin/sh

# Wait for PostgreSQL to be ready
until psql $DIRECT_URL -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Log file for database setup
LOG_FILE="/app/db_setup.log"

# Execute SQL commands and log the output
{
  echo "$(date): Starting database setup..."
  
  # Run the SQL script
  psql $DIRECT_URL -f /tmp/dbsetup.sql
  
  if [ $? -ne 0 ]; then
    echo "$(date): Error occurred during database setup." >> "$LOG_FILE"
    exit 1
  fi
  
  echo "$(date): Database setup completed."
} >> "$LOG_FILE" 2>&1

# Print log file content for debugging
cat "$LOG_FILE"
