FROM node:25-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm ci 

COPY api/ .

COPY prisma/ ./prisma
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
