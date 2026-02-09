const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, "supersecretesecrete");

    if (!decodedToken) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Attach decoded values to request
    req.userId = decodedToken.userId;
    req.currentRole = decodedToken.currentRole || "student";
    req.roles = decodedToken.roles || [];
    req.email = decodedToken.email;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
