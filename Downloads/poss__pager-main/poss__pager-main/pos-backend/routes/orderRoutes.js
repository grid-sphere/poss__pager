const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("✅ Order Routes Loaded");

// 1. Create Order
router.post("/", authMiddleware, orderController.createOrder);

// 2. Get Active Orders
router.get("/", authMiddleware, orderController.getActiveOrders);

// 3. Sales History (Must come BEFORE /:id)
router.get("/history", authMiddleware, orderController.getSalesHistory);

// 4. Complete Order (Using DELETE verb as per frontend)
router.delete("/:id", authMiddleware, orderController.deleteOrder);

module.exports = router;