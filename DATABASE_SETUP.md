# Database Setup Guide

## Create Database

The `skillbase` database needs to be created before running migrations.

### Option 1: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE skillbase;

# Exit
\q
```

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `skillbase`
5. Click "Save"

### Option 3: Using Docker (if PostgreSQL is in Docker)

```bash
# If PostgreSQL is running in Docker
docker exec -it <postgres-container-name> psql -U postgres -c "CREATE DATABASE skillbase;"
```

### Option 4: Using SQL Script

Create a file `create-db.sql`:

```sql
CREATE DATABASE skillbase;
```

Then run:
```bash
psql -U postgres -f create-db.sql
```

## Verify Database Creation

```bash
psql -U postgres -c "\l" | grep skillbase
```

## Run Migrations

After creating the database, run migrations:

```bash
npm run migration:run
```

## Environment Variables

Make sure your `.env` file has correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skillbase
```

## Troubleshooting

### Error: "database does not exist"
- Solution: Create the database first (see above)

### Error: "password authentication failed"
- Solution: Check your `.env` file credentials

### Error: "connection refused"
- Solution: Make sure PostgreSQL is running
  ```bash
  # macOS (Homebrew)
  brew services start postgresql
  
  # Linux (systemd)
  sudo systemctl start postgresql
  
  # Docker
  docker start <postgres-container>
  ```

