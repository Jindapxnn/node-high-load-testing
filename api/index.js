require('dotenv').config();
const express = require('express')
const { connectRabbit } = require('./config/rabbitmq');
const redisClient = require('./config/redis');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

async function startServer() {
    try {
        // 1. เชื่อมต่อ Database (ทดลอง Query สั้นๆ เพื่อเช็คสถานะ)
        await db.query('SELECT NOW()');
        console.log('Database Status: OK');

        // 2. เชื่อมต่อ Redis 
        await redisClient.ping();
        console.log('Redis Status: OK');

        // 3. เชื่อมต่อ RabbitMQ
        await connectRabbit();
        console.log('RabbitMQ Status: OK');

        // 4. เริ่มต้น Server
        app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 API Server is running on port ${PORT}`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();