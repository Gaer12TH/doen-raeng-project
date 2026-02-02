FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port (Railway will override this but good for docs)
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
