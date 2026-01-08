const { prisma } = require("../config/database");
const redisClient = require("../config/redis");
const { sendToQueue } = require("../config/rabbitmq");

exports.bookDirect = async (req, res) => {
  try {
    const { username } = req.body;

    // หาเลขคิวล่าสุดจาก DB
    const lastBooking = await prisma.booking.findFirst({
      orderBy: { queueNumber: "desc" },
    });
    const nextQueue = (lastBooking?.queueNumber || 0) + 1;

    // บันทึกลง Postgres ทันที
    const newBooking = await prisma.booking.create({
      data: {
        username: username,
        queueNumber: nextQueue,
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDirect = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      take: 100, // ดึงมาแค่ 100 ล่าสุด
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ใช้ Queue และ Redis ในการจัดการคิว
exports.bookQueue = async (req, res) => {
  try {
    const { username } = req.body;

    const queueNumber = await redisClient.incr("daily_queue_count");

    const payload = {
      username,
      queueNumber,
      timestamp: new Date(),
    };
    sendToQueue(payload);

    res.status(202).json({
      success: true,
      queueNumber: queueNumber,
      message: "จองคิวสำเร็จ (กำลังประมวลผลผ่าน Queue)",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLatestBookings = async (req, res) => {
  const CACHE_KEY = "latest_bookings";
  try {
    // 1. ลองดึงข้อมูลจาก Redis ก่อน
    const cachedData = await redisClient.get(CACHE_KEY);

    if (cachedData) {
      console.log("Cache Hit: ดึงข้อมูลจาก Redis");
      return res.json({ source: "cache", data: JSON.parse(cachedData) });
    }

    // 2. ถ้าไม่มีใน Cache (Cache Miss) ให้ไปดึงจาก Postgres
    console.log("Cache Miss: ดึงข้อมูลจาก Postgres");
    const bookings = await prisma.booking.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    })
    // 3. เก็บข้อมูลลง Redis (ตั้งเวลาหมดอายุ 10 วินาที เพื่อให้ข้อมูลไม่เก่าเกินไป)
    await redisClient.setEx(CACHE_KEY, 10, JSON.stringify(bookings));
    res.json({ source: "database", data: bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};