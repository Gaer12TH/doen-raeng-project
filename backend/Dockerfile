FROM node:18-alpine

WORKDIR /app

# Install Python3 (Required for yt-dlp)
RUN apk add --no-cache python3 py3-pip

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
