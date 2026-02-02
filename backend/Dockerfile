FROM node:18-alpine

WORKDIR /app

# Install Python3, ffmpeg, and yt-dlp (System-wide)
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install yt-dlp --break-system-packages

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
