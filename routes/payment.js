const express = require("express");
const router = express.Router();

// =========================
//  DUMMY PAYMENT API
// =========================
router.post("/checkout", async (req, res) => {
  try {
    const { userId, totalAmount, courses } = req.body;

    if (!userId || !totalAmount || !courses) {
      return res.status(400).json({ message: "Missing data" });
    }

    console.log("💰 PAYMENT REQUEST RECEIVED");
    console.log("User ID:", userId);
    console.log("Amount :", totalAmount);
    console.log("Courses:", courses);

    // Simulating order creation
    const fakeOrderId = "ORDER-" + Date.now();

    return res.status(200).json({
      success: true,
      message: "Payment successful!",
      orderId: fakeOrderId,
    });

  } catch (err) {
    console.log("❌ Payment Error:", err);
    return res.status(500).json({ message: "Payment failed" });
  }
});

module.exports = router;
