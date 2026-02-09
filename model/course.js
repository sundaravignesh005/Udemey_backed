const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    // BASIC INFO
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, required: true },

    // INSTRUCTOR INFO
    instructor: { type: String, required: true },

    // MEDIA
    image: { type: String, required: true },
    videoUrl: { type: String, default: "" },

    // PRICE INFO
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },

    // RATING INFO
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    bestSeller: { type: Boolean, default: false },

    // EXTRA
    highlights: { type: [String], default: [] },
    category: { type: String, required: true },
    level: { type: String, default: "All Levels" },
    language: { type: String, default: "English" },
    learners: { type: Number, default: 0 },
    lastUpdated: { type: String, default: "" },

    // FOR YOUR EXISTING FLOW
    courseInstruction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseInstruction",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
