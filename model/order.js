const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "Paid", enum: ["pending", "Paid", "failed"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
