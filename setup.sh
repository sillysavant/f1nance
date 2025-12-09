#!/bin/bash

# f1nance Local Development Setup Script

set -e

echo "🌻 f1nance Local Development Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install it."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created. Update with your credentials if needed."
    echo ""
fi

# Start Docker daemon check
echo "🐳 Verifying Docker daemon is running..."
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker daemon is running"
echo ""

# Build and start services
echo "🚀 Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services are starting up!"
echo ""
echo "🌐 Access points:"
echo "   Client:     http://localhost:3000"
echo "   API:        http://localhost:8000"
echo "   API Docs:   http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   View logs:           docker-compose logs -f"
echo "   View server logs:    docker-compose logs -f server"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   Enter server shell:  docker-compose exec server bash"
echo ""
echo "📚 For more info, see DEPLOYMENT.md"
