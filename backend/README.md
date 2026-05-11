# 🧠 The Backend (Java Spring Boot)

Think of the Backend as a **Traffic Controller**. It doesn't drive the trucks, and it doesn't look at the map. It just receives information, processes it, saves it, and hands it off to whoever needs it.

## 🛠️ The Tech Stack
*   **Java 17 & Spring Boot 3**: The coding language and framework. We use this because it is extremely powerful, safe, and handles thousands of connections easily.
*   **PostgreSQL**: The Filing Cabinet. This is where we permanently save user accounts, vehicle details, and the history of everywhere a truck has been.
*   **JWT (JSON Web Tokens)**: A digital VIP pass. When a user logs in, we give them a JWT string. They must show this string every time they ask for data, proving they are logged in.

## 📂 Understanding the Code (Folder by Folder)

*   `model.entity`: **The Blueprints.** Here we define what a "Vehicle" or a "User" looks like in our Database. (e.g., A Vehicle has an ID, a VIN, and a Status).
*   `repository`: **The Filing Clerks.** These files are shortcuts to talk to the PostgreSQL Database. If we want to find a User by their username, we ask the `UserRepository`.
*   `controller`: **The Receptionists.** These handle requests from the Frontend Website. For example, `VehicleController.java` listens for the website asking "Give me a list of all vehicles".
*   `service`: **The Workers.** This is where the actual logic happens. The controller passes the request to the service, the service does the math/logic, and asks the repository to save it.

## 📡 How the Real-Time Magic Works

1.  **MQTT (MqttSubscriberService.java):** 
    *   This file connects to the Mosquitto MQTT broker (our radio station). 
    *   It constantly listens to the topic `fleet/telemetry/+`. 
    *   When the ESP32 Hardware publishes a JSON message (like `{"latitude": 40.7, "longitude": -74.0}`), this service catches it!
    *   It immediately takes that data and saves it to the PostgreSQL database.

2.  **WebSockets (WebSocketConfig.java):**
    *   After saving the data to the database, the Backend uses a `SimpMessagingTemplate` to instantly "broadcast" that exact same GPS data over a WebSocket to the Frontend website. 
    *   This is how the website updates instantly without refreshing.
