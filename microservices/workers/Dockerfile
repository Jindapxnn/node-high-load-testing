FROM node:25-alpine

WORKDIR /app

COPY workers/package*.json ./
RUN npm ci

COPY workers/ .

COPY prisma/ ./prisma
RUN npx prisma generate

CMD ["node", "consumer.js"]
