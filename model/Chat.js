const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String },
  senderRole: { type: String },
  receiverId: { type: String },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: "text" }
});

const ChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },

  participants: {
    type: [String],
    default: []         // 🔥 FIXED
  },

  messages: {
    type: [MessageSchema],
    default: []         // 🔥 FIXED
  }

}, { timestamps: true });

module.exports = mongoose.model("Chat", ChatSchema);
