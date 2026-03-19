const express = require('express');
const router = express.Router();
const SerialManager = require('../utils/serialManager');

// GET /dock/ports -> Returns list of available COM ports
router.get('/ports', async (req, res) => {
    const ports = await SerialManager.listPorts();
    res.json(ports);
});

// POST /dock/connect -> Frontend sends { path: "COM9" }
router.post('/connect', async (req, res) => {
    const { path } = req.body;
    if (!path) return res.status(400).json({ message: "Port path required" });

    try {
        await SerialManager.connect(path);
        res.json({ message: `Connected to ${path}` });
    } catch (err) {
        res.status(500).json({ message: "Connection failed", error: err });
    }
});

// POST /dock/send -> Frontend sends { token: 10 }
router.post('/send', async (req, res) => {
    const { token } = req.body;
    try {
        await SerialManager.write(token);
        res.json({ message: "Signal sent" });
    } catch (err) {
        res.status(500).json({ message: "Failed to send to Dock", error: err });
    }
});

module.exports = router;