# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Tailwind CSS
RUN bun run postinstall

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]