FROM node:18-alpine

WORKDIR /app

# Install Python3, ffmpeg, and yt-dlp (System-wide)
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install yt-dlp --break-system-packages

# Copy package files (works from either backend/ or root context)
COPY package*.json ./
COPY *.js ./
COPY routes/ ./routes/
COPY controllers/ ./controllers/

# Install dependencies
RUN npm install --omit=dev

# Copy remaining files (cookies, etc.)
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
