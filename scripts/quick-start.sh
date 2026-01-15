#!/bin/bash

# SkillBase Quick Start Script
# One-command setup for SkillBase backend

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 SkillBase Quick Start${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "   Visit: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env.docker exists, create if not
if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}⚠️  .env.docker not found. Creating from template...${NC}"
    cat > .env.docker << EOF
# Docker Environment Configuration
DB_HOST=skillbase-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skillbase

JWT_SECRET=dev-secret-key-change-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ Created .env.docker${NC}"
fi

echo -e "${BLUE}📦 Starting SkillBase with Docker Compose...${NC}"
echo ""

# Build and start containers
docker-compose up --build -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for API to be healthy
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SkillBase API is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ API failed to start. Check logs with: docker-compose logs api${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 SkillBase is ready!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "📡 API Base URL: ${GREEN}http://localhost:3000${NC}"
echo -e "🏥 Health Check: ${GREEN}http://localhost:3000/health${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo -e "   1. Test the API: ${YELLOW}curl http://localhost:3000/health${NC}"
echo -e "   2. View logs: ${YELLOW}docker-compose logs -f api${NC}"
echo -e "   3. Stop services: ${YELLOW}docker-compose down${NC}"
echo -e "   4. Clean everything: ${YELLOW}docker-compose down -v${NC}"
echo ""
echo -e "${BLUE}📖 SDK Examples:${NC}"
echo -e "   • JavaScript/TypeScript: ${YELLOW}cd sdk && npm test${NC}"
echo -e "   • Unity: See ${YELLOW}sdk-unity/README.md${NC}"
echo ""

