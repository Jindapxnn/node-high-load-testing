require('dotenv').config();
const express = require('express')
const { connectRabbit } = require('./config/rabbitmq');
const redisClient = require('./config/redis');
const { connectDB } = require('./config/database')
const queueRoutes = require('./routes/queueRoutes')

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

app.use('/api', queueRoutes)

async function startServer() {
    try {
        // 1. เชื่อมต่อ Database 
        await connectDB();
        // 2. เชื่อมต่อ Redis 
        await redisClient.connect();
        // 3. เชื่อมต่อ RabbitMQ
        await connectRabbit();
        // 4. เริ่มต้น Server
        const server = app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 API Server is running on port ${PORT}`);
            console.log(`=========================================`);
        });

        server.on('error', (error) => {
            console.log("Failed to start server:", error);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();