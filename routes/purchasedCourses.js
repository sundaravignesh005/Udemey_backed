const express = require("express");
const router = express.Router();
const User = require("../model/user");

router.post("/purchase-success", async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { purchasedCourses: courseId } } // prevents duplicates
    );

    res.json({
      success: true,
      message: "Course purchased successfully!"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
