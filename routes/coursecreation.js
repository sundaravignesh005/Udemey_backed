const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  addToCart,
  getCart
} = require("../controllers/course");

// =========================
// MULTER SETUP FOR COURSE IMAGE
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===============================
// UDEMY STYLE COURSE ROUTES
// ===============================

// CREATE COURSE
router.post("/courses", upload.single("image"), createCourse);

// ⭐ ADD MISSING ROUTE FOR COURSE CREATION FORM
router.post("/course-creation-form", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      author,
      courseSub,
      description,
      price,
      language,
      level,
      catogory,
      instructor
    } = req.body;

    // Get instructor name from ID
    const User = require("../model/user");
    const instructorUser = await User.findById(instructor);
    const instructorName = instructorUser ? instructorUser.name : author || "Instructor";

    // IMAGE upload
    const imagePath = req.file ? `images/${req.file.filename}` : "";

    const Course = require("../model/course");
    const course = new Course({
      title,
      subtitle: courseSub || "",
      description: description || "",
      instructor: instructorName,
      image: imagePath ? `http://localhost:8080/${imagePath}` : "",
      price: parseFloat(price) || 0,
      category: catogory || "General",
      level: level || "All Levels",
      language: language || "English",
      highlights: []
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully",
      courseId: course._id,
      course
    });
  } catch (err) {
    console.error("Course creation error:", err);
    res.status(500).json({ 
      message: "Failed to create course", 
      error: err.message 
    });
  }
});

// GET ALL COURSES
router.get("/courses", getAllCourses);

// GET SINGLE COURSE PAGE
router.get("/courses/:id", getCourseById);

// ⭐ ADD MISSING ROUTE FOR COURSE HOME CARD
router.post("/course-home-card", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      author,
      price,
      instructor,
      courseDetails
    } = req.body;

    // Get instructor name from ID if it's an ID, otherwise use as is
    const User = require("../model/user");
    let instructorName = author || "Instructor";
    
    // Check if instructor is an ID
    if (instructor && instructor.length > 10) {
      try {
        const instructorUser = await User.findById(instructor);
        if (instructorUser) {
          instructorName = instructorUser.name;
        }
      } catch (err) {
        // If not found, use as name
        instructorName = instructor;
      }
    } else if (instructor) {
      instructorName = instructor;
    }

    // IMAGE upload
    const imagePath = req.file ? `images/${req.file.filename}` : "";

    const Course = require("../model/course");
    const course = new Course({
      title: title || "Untitled Course",
      subtitle: courseDetails || "",
      description: courseDetails || "",
      instructor: instructorName,
      image: imagePath ? `http://localhost:8080/${imagePath}` : "",
      price: parseFloat(price) || 0,
      category: "General",
      level: "All Levels",
      language: "English",
      highlights: []
    });

    await course.save();

    res.status(201).json({
      message: "Course card created successfully",
      courseId: course._id,
      course
    });
  } catch (err) {
    console.error("Course card creation error:", err);
    res.status(500).json({ 
      message: "Failed to create course card", 
      error: err.message 
    });
  }
});

// ===============================
// CART ROUTES
// ===============================
router.get("/get-cart/:userId", getCart);
router.post("/add-cart", addToCart);

module.exports = router;
