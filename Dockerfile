# Base image for Node
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 5173 (Vite's default dev port)
EXPOSE 5173

# Start the application in development mode
CMD ["npm", "run", "dev"]
