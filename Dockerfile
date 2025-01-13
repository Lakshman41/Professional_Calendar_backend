FROM --platform=linux/amd64 node:14-alpine

WORKDIR /home/app

# Environment variables should ideally come from AWS environment configuration
# rather than being hardcoded in Dockerfile
# ENV PORT=5000 \
#     DB_HOST=postgres \
#     DB_USER=postgres \
#     DB_PASSWORD=123456 \
#     API_KEY=abc123xyz \
#     DB_PORT=5432 \
#     DB_DATABASE=postgres
#     JWT_SECRET=dashboard

# Install dependencies first (taking advantage of Docker layer caching)
COPY package*.json ./
RUN npm install

# Then copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5000

CMD ["node", "index.js"]