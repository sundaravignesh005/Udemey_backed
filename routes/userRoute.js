const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const requireRole = require("../middleware/requireRole");
const User = require("../model/user");

// Switch current role (student <-> instructor) without logout
router.put("/switch-role", isAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["student", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.roles.includes(role)) {
      return res.status(403).json({ message: "You don't have this role" });
    }

    user.currentRole = role;
    await user.save();

    return res.json({
      success: true,
      currentRole: user.currentRole,
      roles: user.roles,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Switch role error:", err);
    res.status(500).json({ message: "Failed to switch role" });
  }
});

// Instructor-only example
router.get("/instructor", isAuth, requireRole("instructor"), (req, res) => {
  res.json({ message: "Welcome Instructor" });
});

// Accessible by any logged-in user
router.get("/user", isAuth, (req, res) => {
  res.json({ message: "Welcome User" });
});

module.exports = router;