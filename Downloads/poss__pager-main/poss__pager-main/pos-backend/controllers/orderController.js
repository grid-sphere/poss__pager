const db = require("../db");
const QRCode = require("qrcode");
const OrderModel = require("../models/orderModel");

// ---------------- 1. CREATE ORDER ----------------
// ---------------- 1. CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
  try {
    // 1. Destructure token and items from req.body
    const { total, paymentMethod, token, items } = req.body;
    const restaurantId = req.user.restaurantId;
    console.log("DEBUG: Received token from frontend:", token);

    // 2. Insert Order using the TOKEN from frontend
    const [result] = await db.query(
      `INSERT INTO orders (restaurant_id, total, payment_method, payment_status, token)
       VALUES (?, ?, ?, 'pending', ?)`,
      [restaurantId, total, paymentMethod, token]
    );
    const [verify] = await db.query("SELECT token FROM orders WHERE id = ?", [result.insertId]);
    console.log("DEBUG: DB physically saved token as:", verify[0].token);
    const orderId = result.insertId;

    // 3. Insert Items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.name || 'Item', item.price, item.quantity]
        );
      }
    }

    // 4. Generate QR (Optional logic for UPI)
    let upi = null;
    if (paymentMethod === "upi") {
      const [settingsRows] = await db.query(
          `SELECT upi_id, payee_name FROM store_settings WHERE restaurant_id = ?`, 
          [restaurantId]
      );
      const settings = settingsRows[0];
      if (settings && settings.upi_id) {
        const upiLink = `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(settings.payee_name)}&am=${parseFloat(total).toFixed(2)}&cu=INR&tr=ORD${orderId}`;
        upi = { link: upiLink, qr: await QRCode.toDataURL(upiLink) };
      }
    }

    // 5. Send ONE final response
    res.json({ orderId, token:Number(token), total, upi });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Create Failed: " + err.message });
  }
};
// ---------------- 2. GET ACTIVE ORDERS ----------------
exports.getActiveOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { status } = req.query;

    let query = `
      SELECT id, total, payment_method, payment_status, token, created_at
      FROM orders
      WHERE restaurant_id = ?`;
      
    // ✅ FIX: Only show 'pending' orders in the kitchen (Active view)
    // This ensures 'paid' orders disappear from the dashboard
    if (status === 'active') {
       query += ` AND payment_status = 'pending'`;
    }
    query += ` ORDER BY created_at ASC`;

    const [orders] = await db.query(query, [restaurantId]);
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT name, quantity FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items; // Attach items to the order object
    }
    res.json(orders);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Fetch Failed: " + err.message });
  }
};

// ---------------- 3. GET SALES HISTORY ----------------
exports.getSalesHistory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { date } = req.query; 

    // 1. Get the summary (totals)
    const summary = await OrderModel.getDailySalesSummary(restaurantId, date);
    
    // 2. Get the individual orders
    const orders = await OrderModel.getHistoryByDate(restaurantId, date);

    // 3. Attach items to each order
    for (let order of orders) {
      const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    res.json({
      summary,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- 4. COMPLETE ORDER (Fixes 500 Error) ----------------
exports.deleteOrder = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const orderId = req.params.id;

    console.log(`Completing Order: ${orderId} for Restaurant: ${restaurantId}`);

    // ✅ FIX: Use 'paid' instead of 'completed'
    // This matches your database ENUM('pending', 'paid')
    const [result] = await db.query(
      "UPDATE orders SET payment_status = 'paid' WHERE id = ? AND restaurant_id = ?", 
      [orderId, restaurantId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found or already completed" });
    }

    res.json({ message: "Order marked as paid" });

  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ message: "Complete Failed: " + err.message });
  }
};