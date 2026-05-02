# Deployment Guide

## Local Build & Server Deployment

### Option 1: With External Dependencies (Recommended)

**1. Build locally:**

```bash
npm install
npm run build
```

**2. Copy these files to server:**

```
dist/server.bundle.js
package.json
Dockerfile.webpack
```

**3. Create .env file on server with real values:**

```bash
# Create .env on server (NOT .env.example)
database=your_actual_database_name
keyForToken=your_actual_jwt_secret
PORT=5000
NODE_ENV=production
```

**4. On server, build Docker image:**

```bash
docker build -f Dockerfile.webpack -t shiv-admin-backend .
```

**5. Run container with .env mounted:**

```bash
docker run -d \
  --name shiv-backend \
  -p 5000:5000 \
  -v $(pwd)/.env:/app/.env \
  shiv-admin-backend
```

### Option 2: Standalone Bundle (No Dependencies)

**1. Build standalone locally:**

```bash
npm install
npm run build:standalone
```

**2. Copy these files to server:**

```
dist/server.standalone.js
Dockerfile.standalone
```

**3. Create .env file on server:**

```bash
# Create .env on server
database=your_actual_database_name
keyForToken=your_actual_jwt_secret
PORT=5000
NODE_ENV=production
```

**4. On server, build Docker image:**

```bash
docker build -f Dockerfile.standalone -t shiv-admin-backend-standalone .
```

**5. Run container with .env mounted:**

```bash
docker run -d \
  --name shiv-backend \
  -p 5000:5000 \
  -v $(pwd)/.env:/app/.env \
  shiv-admin-backend-standalone
```

### Option 3: Direct Node.js (No Docker)

**1. Build locally:**

```bash
npm run build
```

**2. Copy to server:**

```
dist/server.bundle.js
package.json
.env (with real values)
```

**3. On server:**

```bash
npm install --production
node server.bundle.js
```

## Environment Variables

**Important:** Your `.env` file should contain REAL values:

```
database=myactualdb
keyForToken=mysecretjwtkey123
PORT=5000
NODE_ENV=production
```

**Note:** The `.env.example` file is just a template showing what variables are needed.
