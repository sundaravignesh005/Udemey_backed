const express = require("express");
const { createPayment, checkPaymentStatus } = require("../controllers/paymentController");

const router = express.Router();

router.post("/create", createPayment);
router.post("/status", checkPaymentStatus);

module.exports = router;
  