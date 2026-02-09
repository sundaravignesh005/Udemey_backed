const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseCardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseCard", CourseCardSchema);
