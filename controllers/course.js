const Course = require("../model/course");

// ============================
// CREATE A NEW COURSE (Admin)
// ============================
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      instructor,
      price,
      oldPrice,
      rating,
      totalRatings,
      bestSeller,
      category,
      level,
      language,
      learners,
      lastUpdated,
      highlights
    } = req.body;

    // IMAGE upload
    const image = req.file ? `${req.protocol}://${req.get("host")}/${req.file.path}` : "";

    const course = new Course({
      title,
      subtitle,
      description,
      instructor,
      image,
      price,
      oldPrice,
      rating,
      totalRatings,
      bestSeller,
      category,
      level,
      language,
      learners,
      lastUpdated,
      highlights
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully",
      course
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create course", error: err.message });
  }
};

// ============================
// GET ALL COURSES
// ============================
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).json({
      message: "Courses fetched successfully",
      courses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

// ============================
// GET SINGLE COURSE BY ID
// ============================
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const mongoose = require("mongoose");

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("❌ Invalid course ID format:", courseId);
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format",
        error: "Course ID must be a valid MongoDB ObjectId"
      });
    }

    console.log("🔍 Fetching course with ID:", courseId);

    const course = await Course.findById(courseId);

    if (!course) {
      console.error("❌ Course not found:", courseId);
      return res.status(404).json({ 
        success: false,
        message: "Course not found",
        error: "The requested course does not exist"
      });
    }

    console.log("✅ Course found:", course.title);

    // Return course in the format expected by frontend
    res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      course: course.toObject()
    });

  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch course", 
      error: err.message 
    });
  }
};
// ============================
// ADD TO CART
// ============================
exports.addToCart = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, courses: [] });
    }

    if (!cart.courses.includes(courseId)) {
      cart.courses.push(courseId);
    }

    await cart.save();

    res.status(200).json({
      message: "Course added to cart",
      cart
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

// 
// GET CART
// ============================
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("courses");

    if (!cart) {
      return res.status(200).json({ message: "Cart empty", courses: [] });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      courses: cart.courses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};
