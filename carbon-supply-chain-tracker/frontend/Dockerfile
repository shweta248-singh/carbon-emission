# Build stage
FROM node:22-alpine AS build-stage

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Use ci for clean, deterministic builds
RUN npm ci

# Copy code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy build artifacts to nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Use custom nginx config for security headers
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]