# 🚗 Fleet Simulator Guide

This guide covers everything you need to know to run the Python Fleet Simulator locally on your laptop, and how to host it 24/7 on the cloud.

---

## 1. Running Locally (On Your Laptop)

> [!NOTE]
> Running locally is best for development and for testing your frontend/backend against the simulated data.

### Prerequisites
1. **Python 3.10+**: Ensure Python is installed on your machine.
2. **Eclipse Mosquitto**: A lightweight, open-source MQTT message broker.
3. **Python Libraries**: You need the `paho-mqtt` package installed.

### Step-by-Step Setup

1. **Install Mosquitto MQTT Broker**:
   - **Windows**: Download the installer from the [Mosquitto Download Page](https://mosquitto.org/download/). Install it, and the Windows Service will start automatically.
   - **Mac**: Open terminal and run `brew install mosquitto`, then start it with `brew services start mosquitto`.
   - **Linux**: Run `sudo apt install mosquitto mosquitto-clients`.

2. **Verify Broker is Running**:
   Mosquitto runs on port `1883` by default. You don't need to change any configuration for local testing.

3. **Install Dependencies**:
   If you haven't already, open a terminal in your project directory and run:
   ```bash
   pip install paho-mqtt
   ```

> [!IMPORTANT]
> **When should I run this simulator?**
> You must run this simulator **AFTER** the Java Backend and Mosquitto MQTT Broker are running. The backend needs to be alive to catch the telemetry data broadcast by the simulator and instantly save it to the database/websocket.

4. **Run the Simulator**:
   Ensure the configuration variables in `fleet_simulator.py` are set to `BROKER = "localhost"` and `PORT = 1883`. 
   
   > [!IMPORTANT]
   > **When to start?** Make sure you start the Spring Boot backend **before** starting the simulator. The backend needs to be running and connected to Mosquitto so it can capture the vehicle registration and telemetry data.
   
   Execute:
   ```bash
   python fleet_simulator.py
   ```
   You will see the vehicles start publishing their coordinates to your terminal and the local broker!

---

## 2. Hosting in the Cloud (24/7 Production Deployment)

> [!IMPORTANT]
> To run this simulator for a live demo where the frontend and backend are hosted on the internet, your MQTT Broker **must** also be accessible over the internet. `localhost` will no longer work.

### Step 1: Set Up a Cloud MQTT Broker
Instead of hosting your own Mosquitto broker on a server, the easiest and most reliable method is to use a managed cloud broker.
- **HiveMQ Cloud (Recommended)**: Offers a very generous free tier for up to 100 devices. Go to [HiveMQ](https://www.hivemq.com/mqtt-cloud-broker/), create a free serverless cluster, and get your **Cluster URL**, **Port** (usually 8883 for TLS), **Username**, and **Password**.
- **Alternative**: AWS IoT Core.

### Step 2: Update the Python Script
You will need to update the configuration section in `fleet_simulator.py` to point to your new cloud broker:
```python
# --- Configuration ---
BROKER = "your-cluster-url.s1.eu.hivemq.cloud" 
PORT = 8883 # 8883 is the standard port for secure cloud MQTT connections
TOPIC = "fleet/telemetry"
```

Because cloud brokers require security, you also need to update the connection logic inside the `simulate_vehicle` function to use SSL and Authentication:
```python
    client = mqtt.Client(client_id=vehicle.vin)
    
    # NEW CLOUD CONFIGURATION:
    client.tls_set() # Enable SSL/TLS encryption
    client.username_pw_set("your_hivemq_username", "your_hivemq_password")
    
    try:
        client.connect(BROKER, PORT, 60)
        # ... rest of the code
```

### Step 3: Deploy the Python Script
To keep the script running forever, deploy it to a cloud server.

**Method A: Virtual Private Server (AWS EC2, DigitalOcean Droplet, Linode) - CHEAPEST**
1. Spin up a basic $4-$5/month Linux Ubuntu server.
2. SSH into the server and upload your `fleet_simulator.py` script.
3. Install python and paho-mqtt (`sudo apt install python3-pip && pip3 install paho-mqtt`).
4. Run the script in the background using `nohup` so it doesn't stop when you close your SSH terminal:
   ```bash
   nohup python3 fleet_simulator.py > simulator.log 2>&1 &
   ```
   *(To stop it later, use `ps aux | grep fleet_simulator.py` to find the process ID, then `kill -9 <PID>`)*

**Method B: Platform as a Service (Render, Railway)**
1. Inside your `simulator` folder, create a `requirements.txt` file containing exactly one line: `paho-mqtt`
2. Push the simulator folder to a GitHub repository.
3. Link the repository to Render.com or Railway.app as a **Background Worker**.
4. Set the Start Command to `python fleet_simulator.py`.
5. The platform will automatically install dependencies and run the script 24/7 on their infrastructure.
