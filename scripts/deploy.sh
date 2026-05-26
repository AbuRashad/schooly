#!/bin/bash
set -e

# School Smart Eye — Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: local (default), staging, production

ENV=${1:-local}
echo "🏫 School Smart Eye — Deploying to: $ENV"
echo "============================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build
echo -e "${BLUE}📦 Building frontend...${NC}"
npm run build

echo -e "${BLUE}🔧 Building server...${NC}"
npm run build:server

if [ "$ENV" = "local" ]; then
  echo -e "${BLUE}🐳 Starting Docker Compose...${NC}"
  docker-compose down 2>/dev/null || true
  docker-compose up --build -d

  echo -e "${GREEN}✅ Deployed!${NC}"
  echo "   Frontend: http://localhost"
  echo "   API:      http://localhost:3000/api/health"
  echo "   Backend:  http://localhost:8000/api/v1/health"

elif [ "$ENV" = "staging" ] || [ "$ENV" = "production" ]; then
  echo -e "${BLUE}🐳 Building Docker images...${NC}"
  docker build -f Dockerfile.api -t schooly-api:$ENV .
  docker build -f Dockerfile.frontend -t schooly-frontend:$ENV .

  echo -e "${GREEN}✅ Images built!${NC}"
  echo "   Push to registry:"
  echo "   docker tag schooly-api:$ENV your-registry/schooly-api:$ENV"
  echo "   docker push your-registry/schooly-api:$ENV"
fi

echo -e "${GREEN}🎉 Done!${NC}"
