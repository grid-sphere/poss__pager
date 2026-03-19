const { SerialPort } = require('serialport');

let activePort = null;
let currentPath = null;

const SerialManager = {
    // 1. LIST PORTS (Just scans, doesn't touch them)
    listPorts: async () => {
        try {
            const ports = await SerialPort.list();
            console.log("🔍 Scanning ports... Found:", ports.length);
            return ports;
        } catch (err) {
            console.error("List Ports Error:", err);
            return [];
        }
    },

    // 2. CONNECT (Only runs when YOU click the button in UI)
    connect: (path) => {
        return new Promise((resolve, reject) => {
            // If already connected to this path, do nothing
            if (activePort && activePort.isOpen && currentPath === path) {
                console.log(`ℹ️ Already connected to ${path}`);
                return resolve("Already connected");
            }

            // If connected to a different port, close it first
            if (activePort && activePort.isOpen) {
                console.log(`🔌 Closing previous connection to ${currentPath}...`);
                activePort.close();
            }

            console.log(`🔌 Attempting connection to: ${path}`);
            
            // Create the connection
            activePort = new SerialPort({ path: path, baudRate: 115200 }, (err) => {
                if (err) {
                    console.error(`❌ Failed to open ${path}:`, err.message);
                    return reject(err.message);
                }
                currentPath = path;
                console.log(`✅ SUCCESS: Connected to Dock at ${path}`);
                resolve("Connected");
            });

            // Handle accidental disconnects
            activePort.on('error', (err) => {
                console.error('⚠️ Serial Port Error:', err.message);
                currentPath = null;
            });
            
            activePort.on('close', () => {
                console.warn('⚠️ Port Disconnected');
                currentPath = null;
            });
        });
    },

    // 3. SEND DATA (Sends token when order is confirmed)
    write: (data) => {
        return new Promise((resolve, reject) => {
            if (!activePort || !activePort.isOpen) {
                console.error("❌ Write Failed: No active connection.");
                return reject("Dock not connected. Please connect in the header.");
            }

            // Appending newline '\n' is crucial for ESP32 to read it
            activePort.write(`${data}\n`, (err) => {
                if (err) {
                    console.error("❌ Write Error:", err.message);
                    return reject(err.message);
                }
                console.log(`📡 Sent '${data}' to Dock`);
                resolve(true);
            });
        });
    }
};

module.exports = SerialManager;