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

## Full Stack Docker Mode

### Overview

Run both PostgreSQL and NestJS API in Docker containers with a single command.

### Quick Start

Start everything with one command:

```bash
docker-compose up -d
```

This will:
1. Start PostgreSQL container (`skillbase-postgres`)
2. Wait for PostgreSQL to be healthy
3. Build and start API container (`skillbase-api`)
4. Both services will be available and ready

### Verify Services

Check running containers:

```bash
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS                    PORTS                    NAMES
abc123def456   tvg-api                  "node dist/main.js"     2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:3000->3000/tcp   skillbase-api
xyz789uvw012   postgres:16-alpine       "docker-entrypoint.s…"  2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp   skillbase-postgres
```

### API Container Details

**Container Name:** `skillbase-api`

**Features:**
- Multi-stage build (optimized image size)
- Health check endpoint at `/health`
- Automatic restart on failure
- Depends on PostgreSQL (waits for healthy state)
- Uses `.env.docker` for configuration

**Health Check:**
- Endpoint: `GET /health`
- Returns: `200 OK` with service status
- Used by Docker for container health monitoring

### Environment Configuration

The API container uses `.env.docker` file which includes:
- `DB_HOST=skillbase-postgres` (Docker service name)
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres`
- `DB_DATABASE=skillbase`
- `PORT=3000`
- `NODE_ENV=production` (or `docker`)

### Running Migrations in Docker

After starting containers, run migrations:

```bash
# Option 1: Run from host (requires .env.docker)
cp .env.docker .env
npm run migration:run

# Option 2: Run inside API container
docker exec -it skillbase-api npm run migration:run
```

### Accessing Services

- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **PostgreSQL:** localhost:5432

### Stopping Services

```bash
docker-compose down
```

To also remove volumes (deletes database data):

```bash
docker-compose down -v
```

### Rebuilding API Container

After code changes, rebuild the API:

```bash
docker-compose up -d --build api
```

Or rebuild everything:

```bash
docker-compose up -d --build
```

### Viewing Logs

**API logs:**
```bash
docker-compose logs -f api
```

**PostgreSQL logs:**
```bash
docker-compose logs -f postgres
```

**All logs:**
```bash
docker-compose logs -f
```

### Production Considerations

1. **Environment Variables:**
   - Update `.env.docker` with production credentials
   - Never commit sensitive data to version control
   - Use secrets management in production

2. **Port Configuration:**
   - Default port is 3000
   - Change via `PORT` environment variable
   - Update `docker-compose.yml` ports mapping if needed

3. **Database Migrations:**
   - Run migrations before starting API in production
   - Consider migration automation in CI/CD

4. **Health Checks:**
   - Both services have health checks
   - Docker will restart unhealthy containers
   - Monitor health check endpoints

5. **Resource Limits:**
   - Add resource limits in production:
     ```yaml
     deploy:
       resources:
         limits:
           cpus: '1'
           memory: 512M
     ```

