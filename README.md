# 🚚 Smart Fleet & Logistics Management System

Welcome to the Fleet Management System! This guide is written so simply that **anyone can understand it**. 

Imagine you own a delivery company with dozens of trucks. You want to see exactly where every truck is on a map, in real-time, on your computer screen. This project does exactly that! 

This system has **three main parts**, and they all talk to each other:
1. **Hardware (ESP32 + GPS)**: A tiny physical computer sitting inside the truck. It looks at the sky, finds out where it is (GPS), and shouts that location over Wi-Fi.
2. **Backend (Java Spring Boot)**: The "brain" of the operation. It lives on a server, listens to the trucks shouting their locations, saves that information to a database, and passes it to the website.
3. **Frontend (React Website)**: The beautiful dashboard you look at on your screen. It receives the location from the Backend and draws a little moving truck icon on a map.

---

## 🛠️ Tools We Used (And Why We Used Them)

### 1. Docker & Docker Compose
- **What it is:** Imagine you need to install a specific database (PostgreSQL) and a message broker (Mosquitto) on your computer. Normally, this takes hours of downloading, clicking "Next", and fixing errors. Docker lets you download and run them instantly in safe, invisible "boxes" (called containers).
- **Why we used it:** So you don't have to install PostgreSQL or Mosquitto manually. You just run one command, and Docker sets it all up for you. 
- **The `docker-compose.yml` file:** This is literally a shopping list for Docker. It says: *"Hey Docker, please get me a Database and a Message Broker, and connect them together."*

### 2. MQTT (Mosquitto)
- **What it is:** A super lightweight messaging system designed for IoT (Internet of Things). 
- **Why we used it:** Trucks don't always have great internet. MQTT is incredibly fast and uses very little data. The ESP32 "publishes" a message to a "topic" (like a radio station), and our Backend "subscribes" to that radio station to hear the message.

### 3. WebSockets (STOMP)
- **What it is:** Normally, a website has to keep asking the server, "Are we there yet? Are we there yet?" (Polling). A WebSocket is an open telephone line. The server just calls the website and says, "The truck moved!"
- **Why we used it:** So the truck marker on your screen moves instantly, without you ever having to refresh the page.

---

## 🚀 How to Run Everything from Scratch

### Step 1: Start the Background Infrastructure
You need Docker installed on your computer (Download Docker Desktop and open it).
1. Open a terminal and go into the `backend` folder.
2. Run this command:
   ```bash
   docker-compose up -d
   ```
   *What this does: It reads the `docker-compose.yml` file and starts your Database and MQTT radio station.*

### Step 2: Start the Backend (The Brain)
1. In the `backend` folder, run:
   ```bash
   mvn spring-boot:run
   ```
   *What this does: It starts the Java server. It connects to the database and starts listening to the MQTT radio station.*

### Step 3: Start the Frontend (The Dashboard)
1. Open a **new** terminal and go into the `frontend` folder.
2. Run:
   ```bash
   npm run dev
   ```
   *What this does: It starts the website.*
3. Open your browser and go to `http://localhost:5173`.

### Step 4: Turn on the Hardware (The Truck)
1. Wire your ESP32 to your GPS.
2. Upload the code via Arduino IDE.
3. Once the ESP32 connects to your Wi-Fi and gets a GPS signal, it will start shouting its location. The Backend will hear it, pass it to the Frontend, and the truck will appear on your map!

---
> 💡 **Read More:** I have created a specific `README.md` file inside the `backend`, `frontend`, and `hardware` folders. Open them to understand exactly how each specific part works!
