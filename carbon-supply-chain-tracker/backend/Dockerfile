# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Backend Runtime
FROM node:22-alpine
WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy backend dependency files
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend code
COPY backend ./backend

# Copy frontend build artifacts from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Use non-root user
USER node

EXPOSE 5000

# Start backend from its directory
WORKDIR /app/backend
CMD ["npm", "start"]
