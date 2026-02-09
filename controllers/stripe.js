const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../model/user");
const Order = require("../model/order");
const mongoose = require("mongoose");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { title, price, userId, courseId } = req.body;

    console.log("🔥 Creating PaymentIntent:", { title, price, userId, courseId });

    if (!userId || !courseId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cleanPrice = Number(price);
    if (isNaN(cleanPrice)) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cleanPrice * 100,
      currency: "inr",
      metadata: { userId, courseId, title },
    });

    // Create a pending order record
    await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      course: new mongoose.Types.ObjectId(courseId),
      price: cleanPrice,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
};
