# Use node:bookworm-slim as base image
FROM node:bookworm-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Define entrypoint command
CMD [ "node", "index.js" ]
