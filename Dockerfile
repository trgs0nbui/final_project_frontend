# Dockerfile (development)
FROM node:22-alpine

WORKDIR /app

# Cài đặt dependencies trước để tận dụng Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
