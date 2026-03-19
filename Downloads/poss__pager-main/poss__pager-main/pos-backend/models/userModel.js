const db = require("../db");

async function createUser({ restaurantId, username, email, password, role }) {
  const [result] = await db.query(
    `INSERT INTO users (restaurant_id, username, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [restaurantId, username, email, password, role]
  );

  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail
};