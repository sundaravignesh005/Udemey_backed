const express = require("express");
const multer = require("multer");
const path = require("path");
const Course = require("../model/course");
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "videos"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1000 * 500 },
});
router.post("/upload-video/:courseId", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No video file provided" });
    }
    const videoURL = `http://localhost:8080/uploads/videos/${req.file.filename}`;
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      { 
        $set: { videoUrl: videoURL }
      },
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }
    console.log(`Video uploaded for course ${req.params.courseId}: ${videoURL}`);
    res.json({
      success: true,
      message: "Video uploaded & saved successfully!",
      videoUrl: videoURL,
      course: updatedCourse
    });
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;