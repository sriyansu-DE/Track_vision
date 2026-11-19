/* Track Vision ESP32 checkpoint sender
   Hardware: ESP32 + laser-gate receiver digital outputs.
   Adjust pins and active level for the receiver modules used at the event.
   Configure Wi-Fi, API URL and device key before flashing.
*/
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "https://YOUR-VERCEL-DOMAIN.vercel.app/api/checkpoint";
const char* DEVICE_KEY = "YOUR_ESP32_DEVICE_KEY";
const int GATE_PINS[] = {25, 26, 27, 14, 12};
const int CHECKPOINT_COUNT = 5;
const int ACTIVE_LEVEL = LOW;
unsigned long lastTrigger[5] = {0,0,0,0,0};
const unsigned long DEBOUNCE_MS = 800;

void sendCheckpoint(int checkpoint) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);
  String body = "{\"checkpoint\":" + String(checkpoint) + ",\"device_id\":\"track-vision-esp32\",\"finish\":" + String(checkpoint == CHECKPOINT_COUNT ? "true" : "false") + "}";
  int status = http.POST(body);
  Serial.printf("Checkpoint %d -> HTTP %d\n", checkpoint, status);
  if (status > 0) Serial.println(http.getString());
  http.end();
}

void setup() {
  Serial.begin(115200);
  for (int i=0; i<CHECKPOINT_COUNT; i++) pinMode(GATE_PINS[i], INPUT_PULLUP);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(" connected");
}

void loop() {
  for (int i=0; i<CHECKPOINT_COUNT; i++) {
    if (digitalRead(GATE_PINS[i]) == ACTIVE_LEVEL && millis() - lastTrigger[i] > DEBOUNCE_MS) {
      lastTrigger[i] = millis();
      sendCheckpoint(i + 1);
    }
  }
  delay(10);
}
