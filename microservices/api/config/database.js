const { PrismaClient } = require('@prisma/client');

// สร้าง instance ของ PrismaClient
// ในช่วง Load Test เราสามารถตั้งค่า log เพื่อดู query ที่ช้าได้
const prisma = new PrismaClient({
  log: ['error', 'warn'], 
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('[Prisma] Database connection success');
  } catch (err) {
    console.error('[Prisma] Could not connect to database', err);
    process.exit(1);
  }
}

module.exports = { prisma, connectDB };