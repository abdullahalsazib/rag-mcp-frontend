# Docker Setup for Frontend

## Building the Docker Image

### Build locally:

```bash
docker build -t rag-mcp-frontend:latest .
```

### Build with custom API URL:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://your-server:8085 \
  -t rag-mcp-frontend:latest .
```

## Running the Container

### Using Docker:

```bash
docker run -d \
  -p 5173:80 \
  --name rag-mcp-frontend \
  rag-mcp-frontend:latest
```

### Using Docker Compose:

```bash
docker compose up -d
```

## GitHub Actions Setup

The workflow automatically builds and pushes to Docker Hub when you push to `main` branch.

### Required Secrets:

Add these secrets to your GitHub repository:

1. `DOCKER_USERNAME` - Your Docker Hub username
2. `DOCKER_PASSWORD` - Your Docker Hub access token (not password)
3. `VITE_API_BASE_URL` (optional) - Backend API URL (defaults to `http://localhost:8000`)

### How to add secrets:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the name and value

## Environment Variables

The frontend uses Vite environment variables that are baked in at build time:

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8000`)

**Note:** Since Vite variables are embedded at build time, you need to rebuild the image if you want to change the API URL.

## Deployment

After the GitHub Action builds and pushes the image:

1. Pull the latest image on your server:
   ```bash
   docker compose pull
   ```

2. Restart the container:
   ```bash
   docker compose up -d --force-recreate
   ```

## Accessing the Frontend

Once running, the frontend will be available at:
- Local: `http://localhost:5173`
- Server: `http://your-server-ip:5173`

The nginx configuration includes:
- SPA routing support (all routes redirect to index.html)
- API proxy for `/api` requests (if needed)

