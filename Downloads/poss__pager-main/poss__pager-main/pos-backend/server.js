const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/products", authMiddleware, require("./routes/products"));
app.use("/orders", authMiddleware, require("./routes/orderRoutes"));
app.use("/settings", authMiddleware, require("./routes/settingsRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "POS Backend Online" });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);