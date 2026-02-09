const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "supersecretesecrete"; // Move to env later

// =======================
// SIGN UP
// =======================
exports.SignUp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email, password, name, selectedRole } = req.body;

  try {
    const hashedPwd = await bcrypt.hash(password, 12);

    // Assign roles based on signup selection
    const roles =
      selectedRole === "instructor"
        ? ["student", "instructor"]
        : ["student"];

    const user = new User({
      email,
      password: hashedPwd,
      name,
      roles,
      currentRole: selectedRole === "instructor" ? "instructor" : "student",
    });

    const result = await user.save();

    res.status(201).json({
      message: "User created successfully",
      userId: result._id,
      roles: user.roles,
      currentRole: user.currentRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong on the server",
    });
  }
};

// =======================
// LOGIN
// =======================
exports.Login = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  try {
    const { email, password, loginRole } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong Password" });

    // Only allow instructor login if they have that role
    if (loginRole === "instructor" && !user.roles.includes("instructor")) {
      return res.status(403).json({
        message: "You do not have instructor access. Please apply first.",
      });
    }

    // Update the active UI mode
    if (loginRole && user.roles.includes(loginRole)) {
      user.currentRole = loginRole;
      await user.save();
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        roles: user.roles,
        currentRole: user.currentRole,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      userId: user._id.toString(),
      roles: user.roles,
      currentRole: user.currentRole,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// =======================
// SWITCH ROLE
// =======================
exports.switchRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "Role required" });

    const user = await User.findById(req.userId);

    if (!user.roles.includes(role)) {
      return res.status(403).json({
        message: "You do not have permission for this role",
      });
    }

    user.currentRole = role;
    await user.save();

    // Generate new token with updated role
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        roles: user.roles,
        currentRole: user.currentRole,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      message: `Switched to ${role} mode`,
      token,
      currentRole: user.currentRole,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed role switch" });
  }
};

// =======================
// GET USER INFO
// =======================
exports.getUserInfo = (req, res) => {
  const userId = req.userId;

  User.findById(userId)
    .select("name email roles currentRole")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      });
    })
    .catch(() => res.status(500).json({ message: "Error fetching user info" }));
};
