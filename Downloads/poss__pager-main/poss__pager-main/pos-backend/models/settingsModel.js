const db = require("../db");

async function getSettings(restaurantId) {
  const [rows] = await db.query(
    `SELECT upi_id, payee_name
     FROM store_settings
     WHERE restaurant_id = ?`,
    [restaurantId]
  );
  return rows[0];
}

async function upsertSettings({ restaurantId, upiId, payeeName }) {
  await db.query(
    `INSERT INTO store_settings (restaurant_id, upi_id, payee_name)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       upi_id = VALUES(upi_id),
       payee_name = VALUES(payee_name)`,
    [restaurantId, upiId, payeeName]
  );
}

module.exports = { getSettings, upsertSettings };