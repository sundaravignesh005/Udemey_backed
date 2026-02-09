module.exports = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};

