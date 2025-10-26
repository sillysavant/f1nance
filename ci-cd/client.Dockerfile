# Multi-stage build for React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY client/package.json client/package-lock.json* ./
RUN npm ci

# Build the React app
COPY client/ .
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS runner

# Copy build output to nginx's default static directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]