FROM node:18-alpine

# Set to production
ENV NODE_ENV=production

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies using ci for consistent builds
RUN npm ci --only=production

# Copy application code
COPY . .

# Use non-root user provided by node image
USER node

EXPOSE 5000

CMD ["npm", "start"]
