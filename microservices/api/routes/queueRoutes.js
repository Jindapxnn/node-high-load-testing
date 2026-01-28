const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// call to use direct database access
router.post('/book-direct', queueController.bookDirect);
router.get('/get-book-direct', queueController.getAllDirect);

// call to use redis, rabbitmq
router.post('/book', queueController.bookQueue)
router.get('/get-book', queueController.getLatestBookings)

module.exports = router;