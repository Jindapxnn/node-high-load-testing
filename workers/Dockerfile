FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

CMD ["node", "consumer.js"]