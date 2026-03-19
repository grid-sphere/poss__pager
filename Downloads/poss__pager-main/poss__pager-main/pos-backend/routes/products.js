const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM products WHERE restaurant_id = ?",
    [req.user.restaurantId]
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { stock,name, price, category } = req.body;

  const [result] = await db.query(
    `INSERT INTO products (restaurant_id, name, price,stock, category)
     VALUES (?, ?, ?, ?,?)`,
    [req.user.restaurantId, name, price,stock, category]
  );

  res.json({ id: result.insertId });
});

router.put("/:id", async (req, res) => {
  const { stock,name, price, category } = req.body;

  await db.query(
    `UPDATE products
     SET name=?, price=?, category=?, stock=?
     WHERE id=? AND restaurant_id=?`,
    [name, price, category,stock, req.params.id, req.user.restaurantId]
  );

  res.json({ message: "Updated" });
});

router.delete("/:id", async (req, res) => {
  await db.query(
    "DELETE FROM products WHERE id=? AND restaurant_id=?",
    [req.params.id, req.user.restaurantId]
  );
  res.json({ message: "Deleted" });
});

module.exports = router;