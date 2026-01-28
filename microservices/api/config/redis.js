const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6439'
})

client.on('error', (err) => console.error('[Redis] Client Error', err));
client.on('connect', () => console.log('[Redis] Successfully connected to Redis'));

module.exports = client;