const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * =========================
 * PUBLIC SIGNUP
 * Creates:
 *  - Restaurant
 *  - Admin user
 * =========================
 */
exports.signup = async (req, res) => {
  const { restaurantName, username, email, password } = req.body;

  if (!restaurantName || !username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length) {
      await conn.rollback();
      return res.status(409).json({ message: "User already exists" });
    }

    const [restaurantResult] = await conn.query(
      "INSERT INTO restaurants (name, email) VALUES (?, ?)",
      [restaurantName, email]
    );

    const restaurantId = restaurantResult.insertId;

    const hashedPassword = await bcrypt.hash(password, 10);

    await conn.query(
      `INSERT INTO users (restaurant_id, username, email, password, role)
       VALUES (?, ?, ?, ?, 'admin')`,
      [restaurantId, username, email, hashedPassword]
    );

    await conn.commit();

    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    await conn.rollback();
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

/**
 * =========================
 * LOGIN (ALL ROLES)
 * =========================
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurant_id
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      restaurantId: user.restaurant_id
    }
  });
};

/**
 * =========================
 * ADMIN: CREATE STAFF
 * =========================
 */
exports.createStaff = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const allowedRoles = ["manager", "cashier", "kitchen"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (restaurant_id, username, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.restaurantId, username, email, hashedPassword, role]
  );

  res.json({ message: "Staff created" });
};

/**
 * =========================
 * ADMIN: GET USERS
 * =========================
 */
exports.getAllUsers = async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
  
      const [rows] = await db.query(
        `SELECT id, username, email, role
         FROM users
         WHERE restaurant_id = ?`,
        [restaurantId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

/**
 * =========================
 * ADMIN: DELETE USER
 * =========================
 */
exports.deleteUser = async (req, res) => {
  await db.query(
    "DELETE FROM users WHERE id = ? AND restaurant_id = ?",
    [req.params.id, req.user.restaurantId]
  );

  res.json({ message: "User deleted" });
};