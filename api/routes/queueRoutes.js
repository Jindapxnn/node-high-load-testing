const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// เมื่อเรียก /api/book-direct
router.post('/book-direct', queueController.bookDirect);
router.get('/get-book-direct', queueController.getAllDirect);

router.post('/book', queueController.bookQueue)
router.get('/get-book', queueController.getLatestBookings)

module.exports = router;