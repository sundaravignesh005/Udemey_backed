const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course");
const User = require("../model/user");

// ======================================================
// ⭐ FIXED ROUTES — REST STANDARD
// ======================================================

// GET all courses → /api/courses
router.get("/", courseController.getAllCourses);

// Create new course → /api/courses
router.post("/", courseController.createCourse);

// ======================================================
// ⭐ SPECIFIC ROUTES (MUST COME BEFORE /:id)
// ======================================================

// GET USER'S PURCHASED COURSES
router.get("/user/:userId/purchased-courses", async (req, res) => {
  try {
    const Order = require("../model/order");
    const mongoose = require("mongoose");
    
    const userId = req.params.userId;
    
    // Convert userId to ObjectId if valid
    let userObjectId;
    try {
      userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
    } catch {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    console.log("📦 Fetching purchased courses for user:", userId);
    
    // Get all orders
    const orders = await Order.find({ user: userObjectId })
      .populate("course")
      .sort({ createdAt: -1 });

    const coursesFromOrders = orders
      .filter(order => order.course)
      .map(order => ({
        ...order.course.toObject(),
        purchaseDate: order.createdAt,
        orderId: order._id,
        price: order.price || order.course.price,
      }));

    const user = await User.findById(userObjectId).populate("purchasedCourses");
    const allCourses = [...coursesFromOrders];

    // Merge without duplicates
    user?.purchasedCourses?.forEach(course => {
      if (!allCourses.some(c => c._id.toString() === course._id.toString())) {
        allCourses.push({
          ...course.toObject(),
          purchaseDate: new Date(),
        });
      }
    });

    console.log(`✅ Returning ${allCourses.length} total purchased courses`);

    res.json({
      success: true,
      courses: allCourses,
      orderCount: orders.length,
    });
  } catch (err) {
    console.error("❌ Error fetching purchased courses:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET INSTRUCTOR COURSE PURCHASES
router.get("/instructor/:instructorId/purchases", async (req, res) => {
  try {
    const Order = require("../model/order");
    const Course = require("../model/course");
    const User = require("../model/user");

    const instructor = await User.findById(req.params.instructorId);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const instructorCourses = await Course.find({ instructor: instructor.name });
    const courseIds = instructorCourses.map((c) => c._id);

    const orders = await Order.find({ course: { $in: courseIds } })
      .populate("user", "name email")
      .populate("course", "title price instructor")
      .sort({ createdAt: -1 });

    res.json({ success: true, purchases: orders });

  } catch (err) {
    console.error("❌ Error fetching instructor purchases:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// ⭐ PARAMETERIZED ROUTES (MUST COME AFTER SPECIFIC ROUTES)
// ======================================================

// GET single course → /api/courses/:id
router.get("/:id", courseController.getCourseById);

// Update a course → /api/courses/:id
router.patch("/:id", async (req, res) => {
  try {
    const Course = require("../model/course");
    const mongoose = require("mongoose");
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid course ID format" });
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json({
      success: true,
      course
    });
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
