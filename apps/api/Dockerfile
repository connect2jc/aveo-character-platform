FROM node:20-slim

RUN apt-get update && apt-get install -y openssl ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
