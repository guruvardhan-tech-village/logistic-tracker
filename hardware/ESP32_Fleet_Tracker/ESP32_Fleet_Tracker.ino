/**
 * @file ESP32_Fleet_Tracker.ino
 * @brief IoT Gateway firmware for Smart Fleet Management System
 * @details Connects to a Wi-Fi network and MQTT broker to publish real-time NEO-6M GPS telemetry.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>
#include <HardwareSerial.h>

// ==========================================
// CONFIGURATION: Network & MQTT
// ==========================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_SERVER   = "192.168.1.100"; // Replace with your backend/broker IP
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "fleet/telemetry/1"; // Backend expects fleet/telemetry/+

// ==========================================
// CONFIGURATION: Hardware & Identifiers
// ==========================================
const long   VEHICLE_ID   = 1; // Used for backend DB matching
const char*  VEHICLE_VIN  = "VIN1234567890ABC";

const int RXPin = 16;
const int TXPin = 17;
const uint32_t GPSBaud = 9600; // NEO-6M default baud rate

// ==========================================
// GLOBAL OBJECTS
// ==========================================
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ==========================================
// TIMING VARIABLES (Async non-blocking)
// ==========================================
unsigned long lastMqttPublish = 0;
const unsigned long MQTT_INTERVAL = 5000; // 5 seconds

// ==========================================
// FUNCTION PROTOTYPES
// ==========================================
void setupWiFi();
void reconnectMqtt();
void publishTelemetry();

/**
 * @brief Initial setup of serial ports, Wi-Fi, and MQTT client.
 */
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);
  
  Serial.println("\n[INIT] Starting ESP32 Fleet Tracker...");
  
  setupWiFi();
  
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  
  Serial.println("[INIT] Setup complete. Waiting for GPS data...");
}

/**
 * @brief Main loop handling async tasks (GPS parsing and MQTT publishing).
 */
void loop() {
  // 1. Maintain Network Connections
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }
  if (!mqttClient.connected()) {
    reconnectMqtt();
  }
  mqttClient.loop();

  // 2. Poll GPS continuously (Non-blocking)
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // 3. Publish Telemetry at fixed intervals
  unsigned long currentMillis = millis();
  if (currentMillis - lastMqttPublish >= MQTT_INTERVAL) {
    lastMqttPublish = currentMillis;
    publishTelemetry();
  }
}

/**
 * @brief Connects to the specified Wi-Fi network.
 */
void setupWiFi() {
  delay(10);
  Serial.printf("[WIFI] Connecting to %s\n", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected!");
    Serial.print("[WIFI] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI] Failed to connect.");
  }
}

/**
 * @brief Attempts to reconnect to the MQTT broker if the connection drops.
 */
void reconnectMqtt() {
  // Loop until we're reconnected, but use a non-blocking check mechanism in production
  // For safety, we'll try once per call to avoid blocking the main loop entirely
  if (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection...");
    
    // Create a random client ID
    String clientId = "ESP32Tracker-";
    clientId += String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" Connected!");
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" - Will try again later");
    }
  }
}

/**
 * @brief Constructs a JSON payload and publishes it to the MQTT broker.
 */
void publishTelemetry() {
  if (!mqttClient.connected()) return;

  StaticJsonDocument<256> doc;
  
  // Base Identifiers
  doc["vehicleId"] = VEHICLE_ID; // Needed for backend mapping
  doc["vin"] = VEHICLE_VIN;
  
  // Uptime as simulated timestamp fallback
  doc["uptime_ms"] = millis();

  // Check GPS Fix Status
  if (gps.location.isValid() && gps.satellites.value() >= 3) {
    doc["status"] = "ACTIVE";
    // Mapping keys to match Java Backend DTOs where possible, 
    // while keeping requested keys.
    doc["latitude"] = gps.location.lat();
    doc["longitude"] = gps.location.lng();
    doc["speed"] = gps.speed.kmph();
    doc["alt"] = gps.altitude.meters();
    
    // Format timestamp if date/time is valid
    if (gps.date.isValid() && gps.time.isValid()) {
      char ts[32];
      sprintf(ts, "%04d-%02d-%02dT%02d:%02d:%02dZ",
              gps.date.year(), gps.date.month(), gps.date.day(),
              gps.time.hour(), gps.time.minute(), gps.time.second());
      doc["timestamp"] = ts;
    }
    Serial.println("[TELEMETRY] GPS Fix acquired. Publishing exact location.");
  } else {
    // Keep-Alive state
    doc["status"] = "Searching for Satellites";
    doc["latitude"] = 0.0;
    doc["longitude"] = 0.0;
    doc["speed"] = 0.0;
    doc["alt"] = 0.0;
    Serial.println("[TELEMETRY] No GPS fix. Publishing Keep-Alive.");
  }

  // Serialize to string
  char output[256];
  serializeJson(doc, output);
  
  // Publish to Broker
  if (mqttClient.publish(MQTT_TOPIC, output)) {
    Serial.printf("[MQTT] Published: %s\n", output);
  } else {
    Serial.println("[MQTT] Failed to publish message.");
  }
}
