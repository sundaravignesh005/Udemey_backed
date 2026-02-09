const express = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const auth = require("../middleware/is-auth");
const stripe = require("../config/stripe");
const mongoose = require("mongoose");

const router = express.Router();

// VERIFY PAYMENT AND SAVE ORDER (Fallback when webhook doesn't fire)
router.post("/verify-and-save", auth, async (req, res) => {
  try {
    const { paymentIntentId, courseId, amount } = req.body;

    if (!paymentIntentId || !courseId) {
      return res.status(400).json({ error: "Missing paymentIntentId or courseId" });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not succeeded" });
    }

    const { userId, courseId: metaCourseId } = paymentIntent.metadata;
    const actualCourseId = courseId || metaCourseId;

    if (!userId || !actualCourseId) {
      return res.status(400).json({ error: "Missing metadata in payment intent" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const courseObjectId = new mongoose.Types.ObjectId(actualCourseId);
    const orderAmount = amount || paymentIntent.amount / 100;

    // Check if order already exists
    const existingOrder = await Order.findOne({
      user: userObjectId,
      course: courseObjectId,
      paymentId: paymentIntentId,
      status: "Paid",
    });

    if (existingOrder) {
      return res.json({ success: true, message: "Order already exists", order: existingOrder });
    }

    // Create order
    const order = await Order.create({
      user: userObjectId,
      course: courseObjectId,
      paymentId: paymentIntentId,
      amount: orderAmount,
      status: "Paid",
    });

    // Add course to user's purchasedCourses
    const user = await User.findById(userObjectId);
    if (user && !user.purchasedCourses.includes(courseObjectId)) {
      user.purchasedCourses.push(courseObjectId);
      await user.save();
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error("Error verifying and saving order:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET USER ORDERS
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId, status: "Paid" })
      .populate("course", "title image instructor price path videoUrl")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

router.get("/orders/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId, status: "Paid" })
      .populate("course", "title image instructor price path videoUrl")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

module.exports = router;
