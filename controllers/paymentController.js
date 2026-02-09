const stripe = require("../config/stripe");

// Create Payment Intent
const createPayment = async (req, res) => {
  try {
    const { userId, courseId, price } = req.body;

    if (!userId || !courseId || !price) {
      return res.status(400).json({ error: "Missing required fields: userId, courseId, price" });
    }

    const cleanPrice = Number(price);
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cleanPrice * 100),
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        courseId: courseId,
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Check Payment Status
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId is required" });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.json({
      success: true,
      paymentIntentId,
      status: paymentIntent.status,
    });

  } catch (error) {
    res.status(500).json({ message: "Error checking status", error: error.message });
  }
};

module.exports = { createPayment, checkPaymentStatus };
