const stripe = require("../config/stripe");
const Order = require("../model/order");
const User = require("../model/user");
const mongoose = require("mongoose");

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Webhook secret not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, courseId } = paymentIntent.metadata;

    if (!userId || !courseId) {
      console.error("Missing metadata in payment intent");
      return res.status(400).json({ error: "Missing metadata in payment intent" });
    }

    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const courseObjectId = new mongoose.Types.ObjectId(courseId);
      const amount = paymentIntent.amount / 100;

      const existingOrder = await Order.findOne({
        user: userObjectId,
        course: courseObjectId,
        status: "Paid",
      });

      if (existingOrder) {
        return res.json({ received: true, message: "Order already exists" });
      }

      const order = await Order.create({
        user: userObjectId,
        course: courseObjectId,
        paymentId: paymentIntent.id,
        amount: amount,
        status: "Paid",
      });

      const user = await User.findById(userObjectId);
      if (user && !user.purchasedCourses.includes(courseObjectId)) {
        user.purchasedCourses.push(courseObjectId);
        await user.save();
      }

      return res.json({ received: true, orderId: order._id });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.json({ received: true });
};

module.exports = { handleWebhook };

