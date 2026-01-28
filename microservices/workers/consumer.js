require('dotenv').config();
const amqp = require('amqplib');
const { PrismaClient } = require('@prisma/client');

// สร้าง Prisma Instance สำหรับ Worker
const prisma = new PrismaClient();

async function startConsumer() {
    try {
        // 1. เชื่อมต่อ RabbitMQ (เช็ค URL ให้ตรงกับ .env หรือ Docker)
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 2. ตรวจสอบว่ามี Queue ชื่อนี้อยู่จริง
        const queueName = 'booking_queue';
        await channel.assertQueue(queueName, { durable: true });

        // 3. จำกัดการรับงาน (Prefetch) 
        // รับงานมาทำทีละ 1 ชิ้น ถ้าทำไม่เสร็จจะไม่หยิบชิ้นต่อไป (ช่วยไม่ให้ DB พัง)
        channel.prefetch(1);

        console.log('Worker (Consumer) is ready and waiting for messages...');

        // 4. เริ่มรอรับงาน (Consume)
        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                console.log(`Received Job: [Queue #${content.queueNumber}]`);

                try {
                    // 5. บันทึกลง Database จริงๆ ผ่าน Prisma
                    await prisma.booking.create({
                        data: {
                            username: content.username,
                            queueNumber: content.queueNumber,
                            // ถ้ามีฟิลด์อื่น เช่น createdAt สามารถใส่เพิ่มได้
                        }
                    });

                    console.log(`Successfully saved to Database!`);
                    
                    // 6. บอก RabbitMQ ว่า "งานเสร็จแล้ว ลบออกจากคิวได้" (Acknowledge)
                    channel.ack(msg);
                } catch (error) {
                    console.error(`Error saving to DB: ${error.message}`);
                    
                    // หากเกิด Error (เช่น DB ล่ม) ให้เอางานกลับไปต่อคิวใหม่ (Negative Acknowledge)
                    // requeue: true คือส่งกลับไปรอทำใหม่
                    setTimeout(() => channel.nack(msg, false, true), 5000); 
                }
            }
        });

    } catch (error) {
        console.error('❌ Consumer Error:', error);
    }
}

startConsumer();