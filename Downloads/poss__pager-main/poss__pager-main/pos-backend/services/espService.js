/*const { SerialPort } = require("serialport");

// ⚙️ CONFIGURATION
// Windows: "COM9" (or whatever yours is) | Mac: "/dev/cu.usbserial-0001"
const PREFERRED_PORT = process.platform === "win32" ? "COM9" : "/dev/cu.usbserial-0001";
const BAUD_RATE = 115200;

let port = null;

console.log(`🔌 Attempting to connect to ESP32 on: ${PREFERRED_PORT}`);

try {
  // 1. Create the port instance
  port = new SerialPort({
    path: PREFERRED_PORT,
    baudRate: BAUD_RATE,
    autoOpen: false, // ⚠️ Don't open automatically yet
  });

  // 2. Try to open it safely
  port.open((err) => {
    if (err) {
      // ✅ IF THIS FAILS, SERVER WILL STILL START
      console.log(`⚠️ ESP32 Not Found (${err.message}). Server continuing in "Simulation Mode".`);
      port = null; // Set to null so we know it's missing
    } else {
      console.log(`✅ ESP32 Connected on ${PREFERRED_PORT}`);
    }
  });

  // 3. Catch unexpected disconnects later
  port.on("error", (err) => {
    console.log(`⚠️ Serial Port Error: ${err.message}`);
  });

} catch (err) {
  console.log(`⚠️ Serial Port Setup Failed: ${err.message}`);
  port = null;
}

/**
 * Sends a token to the ESP32 via UART.
 * Returns immediately so the UI never freezes.
 */
/*
function sendTokenToESP(token) {
  return new Promise((resolve) => {
    // If no ESP connected, just pretend we sent it
    if (!port || !port.isOpen) {
      console.log(`⚠️ ESP Disconnected. Skipping token '${token}' send.`);
      return resolve(false); 
    }

    // Attempt to write
    port.write(`${token}\n`, (err) => {
      if (err) {
        console.error("❌ UART Write Failed:", err.message);
        resolve(false);
      } else {
        console.log(`✅ UART Sent Token: ${token}`);
        resolve(true);
      }
    });
  });
}

module.exports = { sendTokenToESP };*/