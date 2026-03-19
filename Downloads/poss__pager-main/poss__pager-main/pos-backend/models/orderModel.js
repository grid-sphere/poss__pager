const db = require("../db");

// ---------------- 1. CREATE ORDER ----------------
async function createOrder({ restaurantId, total, paymentMethod, token }) {
  const [result] = await db.query(
    `
    INSERT INTO orders 
    (restaurant_id, total, payment_method, payment_status, token)
    VALUES (?, ?, ?, 'pending', ?)
    `,
    [restaurantId, total, paymentMethod, token]
  );
  return result.insertId;
}

// ---------------- 2. ADD ORDER ITEM ----------------
async function addOrderItem({ orderId, productId, name, price, quantity }) {
  const subtotal = price * quantity;
  await db.query(
    `
    INSERT INTO order_items
    (order_id, product_id, name, price, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [orderId, productId, name || 'Item', price, quantity, subtotal]
  );
}

// ---------------- 3. MARK PAID ----------------
async function markOrderPaid(orderId, restaurantId) {
  await db.query(
    `
    UPDATE orders
    SET payment_status = 'paid'
    WHERE id = ? AND restaurant_id = ?
    `,
    [orderId, restaurantId]
  );
}

// ---------------- 4. SALES HISTORY & ANALYTICS ----------------

/**
 * Gets daily summary for the Sales Report
 */
async function getDailySalesSummary(restaurantId, date) {
  const [rows] = await db.query(
    `
    SELECT 
      COUNT(id) as totalOrders,
      SUM(total) as grossSales,
      SUM(CASE WHEN payment_method = 'upi' THEN total ELSE 0 END) as upiSales,
      SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cashSales
    FROM orders 
    WHERE restaurant_id = ? 
    AND DATE(created_at) = ? 
    AND payment_status = 'paid'
    `,
    [restaurantId, date]
  );
  return rows[0];
}

/**
 * Gets full details of all completed orders for a specific date
 */
async function getHistoryByDate(restaurantId, date) {
  const [orders] = await db.query(
    `
    SELECT id, total, payment_method, payment_status, token, created_at
    FROM orders
    WHERE restaurant_id = ? 
    AND DATE(created_at) = ?
    AND payment_status = 'paid'
    ORDER BY created_at DESC
    `,
    [restaurantId, date]
  );
  return orders;
}

/**
 * Gets total sales for a range (useful for weekly/monthly charts)
 */
async function getSalesInRange(restaurantId, startDate, endDate) {
  const [rows] = await db.query(
    `
    SELECT DATE(created_at) as date, SUM(total) as dailyTotal
    FROM orders
    WHERE restaurant_id = ? 
    AND created_at BETWEEN ? AND ?
    AND payment_status = 'paid'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    `,
    [restaurantId, startDate, endDate]
  );
  return rows;
}

module.exports = {
  createOrder,
  addOrderItem,
  markOrderPaid,
  getDailySalesSummary,
  getHistoryByDate,
  getSalesInRange
};