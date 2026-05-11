# 🔧 The Hardware (ESP32 + NEO-6M GPS)

Think of the Hardware as the **Reporter in the Field**. It sits physically inside the vehicle, looks up at the sky to figure out its exact location, and shouts that location over the internet back to the headquarters.

## 🛠️ What You Need (The Parts)
1. **ESP32 DevKit V1**: This is a tiny, cheap, yet incredibly powerful computer. It is special because it has **built-in Wi-Fi**.
2. **NEO-6M GPS Module**: A small antenna board. It listens to satellites orbiting the Earth to figure out its exact Latitude, Longitude, and Speed.
3. **Jumper Wires**: To connect the two together.
4. **Micro-USB Cable**: To connect the ESP32 to your laptop to upload the code.

## 🔌 How to Connect the Wires (Configuration)

The NEO-6M GPS module has 4 pins. You must connect them to the ESP32 like this:

| NEO-6M GPS Pin | ESP32 DevKit Pin | What it does |
| :--- | :--- | :--- |
| **VCC** | **VIN** or **3V3** | Provides Power (Usually Red Wire) |
| **GND** | **GND** | Ground/Minus (Usually Black Wire) |
| **TX** | **RX2 (Pin 16)** | The GPS *Transmits* data, the ESP32 *Receives* it. |
| **RX** | **TX2 (Pin 17)** | The GPS *Receives* data, the ESP32 *Transmits* it. |

*Warning: NEVER connect TX to TX. It must always be TX to RX!*

## 📂 Understanding the Code (`ESP32_Fleet_Tracker.ino`)

The code is written in C++ using the Arduino IDE. 

1. **The Setup (`setup()`)**: 
   When you plug the ESP32 into power, it runs this once. It turns on its Wi-Fi, connects to your router, and connects to the MQTT Radio Station.
2. **The Loop (`loop()`)**:
   This runs over and over, thousands of times a second. 
   - First, it checks if the Wi-Fi disconnected. If yes, it reconnects!
   - Next, it listens to the GPS module to see if new satellite data came in.
   - **The Timer (`millis()`)**: We use a stopwatch technique called `millis()`. Every 5 seconds, the ESP32 packages the Latitude, Longitude, and Speed into a text format called JSON (which looks like `{ "speed": 60, "latitude": 40.7 }`).
3. **Publishing**: It sends that JSON text to the MQTT topic `fleet/telemetry/1`. The Backend is waiting to catch it!

## 🚀 How to Upload the Code

1. Download and install the **Arduino IDE** on your laptop.
2. Open the `ESP32_Fleet_Tracker.ino` file.
3. **IMPORTANT:** At the top of the code, change `WIFI_SSID` to your home Wi-Fi name, and change `WIFI_PASSWORD` to your Wi-Fi password. Change `MQTT_SERVER` to your laptop's IP address.
4. Plug your ESP32 into your laptop with the USB cable.
5. In Arduino IDE, click **Tools > Board** and select "ESP32 Dev Module" or "DOIT ESP32 DEVKIT V1".
6. Click **Tools > Port** and select the COM port.
7. Click the **Upload** arrow at the top left!
8. Once uploaded, click the **Serial Monitor** (magnifying glass icon top right). Set it to `115200 baud`. You will see it print out exactly what it is doing!
