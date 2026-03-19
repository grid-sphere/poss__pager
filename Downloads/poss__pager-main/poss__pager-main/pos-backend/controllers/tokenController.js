const { sendTokenToESP } = require("../services/espService");

async function assignToken(req, res) {
  const { orderId } = req.params;
  const { token } = req.body;

  if (!token || typeof token !== "number") {
    return res.status(400).json({ message: "Invalid token" });
  }

  // Later you can validate orderId from DB if needed
  const success = await sendTokenToESP(token);

  if (!success) {
    return res.status(503).json({ message: "ESP unreachable" });
  }

  res.json({
    message: "Token sent to ESP successfully",
    orderId,
    token
  });
}

module.exports = { assignToken };