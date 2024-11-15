# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.12.1

# Start the application in development mode
CMD ["sh", "-c", "pnpm install && pnpm dev"]