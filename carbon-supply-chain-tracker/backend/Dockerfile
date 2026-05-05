FROM node:20-alpine

# Set working directory to /app
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy all files from backend directory to /app
COPY . .

# Expose backend port
EXPOSE 5000

# Start server using node directly as requested
CMD ["node", "server.js"]
