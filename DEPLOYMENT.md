# Deployment Guide

## ✅ Local Testing - PASSED

The Docker image has been tested locally and is working correctly:
- ✅ Build successful
- ✅ Container runs and serves content
- ✅ Nginx configured properly
- ✅ SPA routing works

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Docker setup and GitHub Actions workflow"
git push origin main
```

### 2. GitHub Actions will automatically:
- Build the Docker image
- Push to Docker Hub as `dosibirdge/rag-mcp-frontend:latest`

### 3. Required GitHub Secrets

Make sure these secrets are set in your GitHub repository:
- `DOCKER_USERNAME` - Your Docker Hub username (e.g., `dosibirdge`)
- `DOCKER_PASSWORD` - Your Docker Hub access token
- `VITE_API_BASE_URL` (optional) - Backend API URL (defaults to `http://160.191.163.85:8085`)

### 4. Deploy on Server

SSH into your server and run:

```bash
# Navigate to your project directory
cd /path/to/rag-mcp-frontend

# Pull the latest image
docker compose pull

# Start/restart the container
docker compose up -d

# Check logs
docker compose logs -f
```

### 5. Verify Deployment

```bash
# Check if container is running
docker ps | grep rag-mcp-frontend

# Test the frontend
curl http://localhost:5173

# Check health
docker compose ps
```

## 📝 Server docker-compose.yml

Your server's `docker-compose.yml` is ready:

```yaml
services:
  frontend:
    container_name: rag-mcp-frontend
    image: dosibirdge/rag-mcp-frontend:latest
    ports:
      - "5173:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

## 🔧 Configuration

The frontend is configured to connect to:
- **Backend API**: `http://160.191.163.85:8085` (configured in Dockerfile nginx proxy)

The API URL is baked into the build at compile time. To change it:
1. Update the `VITE_API_BASE_URL` secret in GitHub
2. Or rebuild with: `--build-arg VITE_API_BASE_URL=http://your-new-url`

## 🌐 Access

Once deployed, the frontend will be available at:
- **Local**: `http://localhost:5173`
- **Server**: `http://your-server-ip:5173`

## 🔍 Troubleshooting

### Container won't start
```bash
docker compose logs frontend
```

### Check if image was pulled
```bash
docker images | grep rag-mcp-frontend
```

### Rebuild and restart
```bash
docker compose down
docker compose pull
docker compose up -d
```

## ✅ Test Results

- ✅ Docker build: **SUCCESS**
- ✅ Container runs: **SUCCESS**
- ✅ Nginx serves content: **SUCCESS**
- ✅ HTML loads correctly: **SUCCESS**
- ✅ Ready for production: **YES**

