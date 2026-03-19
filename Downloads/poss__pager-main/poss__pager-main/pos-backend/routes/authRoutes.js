const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =====================
// PUBLIC
// =====================
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// =====================
// ADMIN ONLY
// =====================

// Create staff (manager / cashier / kitchen)
router.post(
  "/staff",
  authMiddleware,
  authorizeRoles("admin"),
  authController.createStaff
);

// Get users of this restaurant
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  authController.getAllUsers
);

// Delete user
router.delete(
  "/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  authController.deleteUser
);

module.exports = router;