const jwt = require("jsonwebtoken");
console.log("DEBUG: JWT_SECRET loaded from process.env:", !!process.env.JWT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { userId, email, role, restaurantId } = decoded;

    if (!userId || !email || !role || !restaurantId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      userId: Number(userId),
      email,
      role,
      restaurantId: Number(restaurantId)
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;