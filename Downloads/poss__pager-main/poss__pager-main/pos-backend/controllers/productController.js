// ✅ MAKE SURE THIS PATH IS CORRECT (points to db.js in the main folder)
const db = require('../db'); 

exports.getAllProducts = (req, res) => {
    // 🔍 Query the database
    const query = "SELECT * FROM products";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ DB Error in getAllProducts:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        // 📢 LOGGING: This will show in your terminal!
        console.log(`✅ Database found ${results.length} products`);

        if (results.length === 0) {
            console.log("⚠️ WARNING: The 'products' table is empty!");
        }

        res.json(results);
    });
};

// Admin: Add Product
exports.createProduct = (req, res) => {
    const { name, category, price } = req.body;
    const query = "INSERT INTO products (name, category, price) VALUES (?, ?, ?)";
    db.query(query, [name, category, price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product added", id: result.insertId });
    });
};

// Admin: Delete Product
exports.deleteProduct = (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
};

// Admin: Update Product
exports.updateProduct = (req, res) => {
    const { name, category, price } = req.body;
    const query = "UPDATE products SET name=?, category=?, price=? WHERE id=?";
    db.query(query, [name, category, price, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Updated" });
    });
};