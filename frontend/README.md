# 💻 The Frontend (React Dashboard)

Think of the Frontend as the **Television Screen**. It doesn't actually know where the trucks are by itself. It just asks the Backend for the information and draws pretty pictures and maps so humans can understand it.

## 🛠️ The Tech Stack
*   **React & Vite**: React is the tool we use to build the website out of "LEGO blocks" (components like Buttons and Tables). Vite is the engine that runs it super fast on your computer.
*   **Tailwind CSS**: This is how we make it look pretty. Instead of writing separate styling files, we write styling directly in the code (like saying `bg-blue-500` to make a button blue).
*   **Zustand**: The "Memory". It remembers if you are logged in or not.
*   **React Query**: The "Data Fetcher". It asks the Backend for data (like the list of vehicles) and remembers it so it doesn't have to keep asking.
*   **React-Leaflet**: The tool used to draw the actual interactive Map.

## 📂 Understanding the Code

*   `src/components`: **The LEGO Blocks.** Small pieces of the website that we can reuse, like an `Input` box or a `Button`.
*   `src/pages`: **The Whole Rooms.** These are entire pages. 
    *   `LoginPage.tsx`: The screen where you type your username and password.
    *   `LiveMap.tsx`: The screen holding the map.
    *   `VehicleList.tsx`: The screen holding the table of vehicles.
*   `src/services/api.ts`: **The Mailman.** This file handles talking to the backend. It also automatically attaches your "VIP Pass" (JWT Token) to every request.

## 📡 How the Live Map Works (`useTelemetrySocket.ts`)

1. When you open the Live Map page, the website opens a special telephone line (WebSocket/STOMP) directly to the Backend.
2. It subscribes to a channel called `/topic/telemetry`.
3. Whenever a truck moves, the Backend shouts the new coordinates down this telephone line.
4. The website hears it, updates its memory, and the truck icon on the map instantly shifts to the new coordinates!
