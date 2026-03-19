import serial
import logging
from app.core.config import settings

class SerialService:
    def __init__(self):
        self.port = None
        self.initialize_port()

    def initialize_port(self):
        print(f"🔌 Attempting to connect to ESP32 on: {settings.PREFERRED_PORT}")
        try:
            self.port = serial.Serial(
                port=settings.PREFERRED_PORT,
                baudrate=settings.BAUD_RATE,
                timeout=1
            )
            print(f"✅ ESP32 Connected on {settings.PREFERRED_PORT}")
        except Exception as e:
            print(f"⚠️ ESP32 Not Found ({str(e)}). Server continuing in 'Simulation Mode'.")
            self.port = None

    def send_token(self, token: str):
        """
        Sends a token to the ESP32 via UART.
        Matches the behavior of sendTokenToESP in Node.js.
        """
        if not self.port or not self.port.is_open:
            print(f"⚠️ ESP Disconnected. Skipping token '{token}' send.")
            return False
        
        try:
            message = f"{token}\n".encode('utf-8')
            self.port.write(message)
            print(f"🚀 Token '{token}' sent to ESP32")
            return True
        except Exception as e:
            print(f"⚠️ Failed to write to Serial: {str(e)}")
            return False

# Global instance
serial_bus = SerialService()