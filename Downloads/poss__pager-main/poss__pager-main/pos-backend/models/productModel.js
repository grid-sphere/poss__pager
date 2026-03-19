const db = require("../db");

async function getProductsByRestaurant(restaurantId) {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE restaurant_id = ?`,
    [restaurantId]
  );
  return rows;
}

async function createProduct({ restaurantId, name, price, stock, category }) {
  const [result] = await db.query(
    `INSERT INTO products (restaurant_id, name, price, stock, category)
     VALUES (?, ?, ?, ?, ?)`,
    [restaurantId, name, price, stock, category]
  );
  return result.insertId;
}

module.exports = {
  getProductsByRestaurant,
  createProduct
};