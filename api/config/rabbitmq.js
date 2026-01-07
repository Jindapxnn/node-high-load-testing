const amqp = require('amqplib');

let channel;
async function connectRabbit (){
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('booking_queue', {durable: true})
        console.log('Connected to RabbitMQ')
    } catch (error) {
        console.log('RabbitMQ Connection Error:', error)
    }
}

const sendtoQueue = (data) => {
    channel.sendtoQueue('booking_queue', Buffer.from(JSON.stringify(data)), {persistent: true})
}

module.exports = { connectRabbit, sendtoQueue };