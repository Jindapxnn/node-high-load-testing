const amqp = require('amqplib');

let channel;
async function connectRabbit (){
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('booking_queue', {durable: true})
        console.log('[RabbitMQ] Connected to RabbitMQ')
    } catch (error) {
        console.log('[RabbitMQ] Connection Error:', error)
    }
}

const sendToQueue = (data) => {
    if (!channel) {
        console.error('[RabbitMQ] Channel is not initialized yet!');
        return;
    }
    channel.sendToQueue('booking_queue', Buffer.from(JSON.stringify(data)), { persistent: true });
    // const result = channel.sendToQueue('booking_queue', Buffer.from(JSON.stringify(data)), { persistent: true });
    // console.log(`[RabbitMQ] Message sent to queue: ${result}`);
    // return result;
}

module.exports = { connectRabbit, sendToQueue };
