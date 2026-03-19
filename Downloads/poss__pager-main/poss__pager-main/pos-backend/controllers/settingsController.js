const storeSettingsModel = require("../models/settingsModel");

exports.getSettings = async (req, res) => {
  const settings = await storeSettingsModel.getSettings(req.user.restaurantId);
  res.json(settings || { upi_id: "", payee_name: "" });
};

exports.updateSettings = async (req, res) => {
  const { upiId, payeeName } = req.body;

  if (!upiId || !payeeName) {
    return res.status(400).json({ message: "Missing fields" });
  }

  await storeSettingsModel.upsertSettings({
    restaurantId: req.user.restaurantId,
    upiId,
    payeeName
  });

  res.json({ message: "Settings updated" });
};