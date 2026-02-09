const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Multiple roles supported
    roles: {
      type: [String],
      enum: ["student", "instructor"],
      default: ["student"],
    },

    // ✅ Active UI mode (no session reset)
    currentRole: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },

    status: {
      type: String,
      default: "I am new User",
    },

    // ⭐ COURSES THE USER HAS PURCHASED
    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
