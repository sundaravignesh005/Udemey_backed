const express = require("express");
const router = express.Router();
const Chat = require("../model/Chat");
const User = require("../model/user");


router.get("/instructor", async (req, res) => {
  try {
    const instructor = await User.findOne({ roles: "instructor" }).select("_id name");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    return res.status(200).json({
      instructorId: instructor._id.toString(),
      instructorName: instructor.name,
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ----------------------
// 1) LIST CHATS
// ----------------------
router.get("/list/:userId", async (req, res) => {
  const chats = await Chat.find({ participants: req.params.userId });

  const formatted = chats.map((c) => {
    const lastMessage = c.messages[c.messages.length - 1] || null;
    const unreadCount = c.messages.filter(
      (m) => !m.isRead && m.receiverId === req.params.userId
    ).length;

    return {
      roomId: c.roomId,
      lastMessage,
      unreadCount,
      participants: c.participants
    };
  });

  res.json(formatted);
});


// ----------------------
// 2) GET UNREAD MESSAGE COUNT
// ----------------------
router.get("/unread/:userId", async (req, res) => {
  const chats = await Chat.find({ "messages.receiverId": req.params.userId });
  let total = 0;

  chats.forEach((chat) => {
    total += chat.messages.filter(
      (m) => !m.isRead && m.receiverId === req.params.userId
    ).length;
  });

  res.json({ unreadCount: total });
});


// ----------------------
// 3) CREATE COURSE CHAT ROOM
// ----------------------
router.post("/course", async (req, res) => {
  const { courseId } = req.body;
  const roomId = `course_${courseId}`;

  let chat = await Chat.findOne({ roomId });
  if (!chat) {
    chat = new Chat({
      roomId,
      participants: [],
      messages: []
    });
    await chat.save();
  }

  res.json({ success: true, roomId });
});


// ----------------------
// 4) CREATE PRIVATE CHAT ROOM
// ----------------------
router.post("/private", async (req, res) => {
  const { userA, userB } = req.body;
  const sorted = [userA, userB].sort();
  const roomId = `private_${sorted[0]}_${sorted[1]}`;

  let chat = await Chat.findOne({ roomId });
  if (!chat) {
    chat = new Chat({
      roomId,
      participants: sorted,
      messages: []
    });
    await chat.save();
  }

  res.json({ success: true, roomId });
});
router.get("/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  const chat = await Chat.findOne({ roomId });
  res.json(chat || { messages: [] });
});


module.exports = router;
