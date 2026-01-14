# Docker Setup Guide

## Quick Start

### Start PostgreSQL
```bash
npm run docker:up
```

### Stop PostgreSQL
```bash
npm run docker:down
```

### View Logs
```bash
npm run docker:logs
```

### Restart PostgreSQL
```bash
npm run docker:restart
```

### Clean Everything (removes volumes)
```bash
npm run docker:clean
```

## Manual Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI
```bash
docker exec -it skillbase-postgres psql -U postgres -d skillbase
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

## Environment Variables

The `docker-compose.yml` uses environment variables from your `.env` file:

- `DB_USERNAME` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `DB_DATABASE` (default: skillbase)
- `DB_PORT` (default: 5432)

## Data Persistence

PostgreSQL data is stored in a Docker volume named `postgres_data`. This means:
- Data persists even if you stop the container
- To completely remove data, use `npm run docker:clean`

## Health Check

The PostgreSQL container includes a health check that verifies the database is ready to accept connections.

## Network

All services run on the `skillbase-network` bridge network for isolation.

