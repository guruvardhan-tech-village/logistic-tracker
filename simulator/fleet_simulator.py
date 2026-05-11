import time
import json
import random
import threading
import math
import paho.mqtt.client as mqtt

# --- Configuration ---
BROKER = "localhost" # MQTT Broker address (e.g., test.mosquitto.org, or your local Mosquitto)
PORT = 1883
TOPIC = "fleet/telemetry"
UPDATE_INTERVAL = 5 # Update interval in seconds

class Vehicle:
    def __init__(self, vin, v_type, lat, lng, speed_range, efficiency_range, fuel_capacity_range):
        self.vin = vin
        self.type = v_type
        self.lat = lat
        self.lng = lng
        
        # Vehicle characteristics ranges
        self.speed_range = speed_range
        self.efficiency_range = efficiency_range
        self.fuel_capacity_range = fuel_capacity_range
        
        # Initialize current state with random values within their specific ranges
        self.speed = random.uniform(*self.speed_range)
        self.fuel_efficiency = random.uniform(*self.efficiency_range)
        # Start with a random amount of fuel (between 50% and 100% full)
        self.fuel_level = random.uniform(self.fuel_capacity_range[0] * 0.5, self.fuel_capacity_range[1]) 
        self.fuel_range = self.fuel_level * self.fuel_efficiency
        self.heading = random.uniform(0, 360) # Initial heading in degrees (0 = North)

    def update_position(self, delta_time_seconds):
        # 1. Calculate distance traveled in kilometers
        # speed is km/h, convert time to hours
        distance_km = self.speed * (delta_time_seconds / 3600.0)
        
        # 2. Update fuel consumption
        fuel_consumed = distance_km / self.fuel_efficiency
        self.fuel_level = max(0, self.fuel_level - fuel_consumed)
        
        # 3. Calculate dynamic fuel range
        self.fuel_range = self.fuel_level * self.fuel_efficiency
        
        # If out of fuel, the vehicle stops
        if self.fuel_level <= 0:
            self.speed = 0
            return

        # 4. Update GPS coordinates
        # Simple equirectangular approximation:
        # 1 degree of latitude is ~111 km
        # 1 degree of longitude is ~111 * cos(latitude) km
        dx = distance_km * math.sin(math.radians(self.heading))
        dy = distance_km * math.cos(math.radians(self.heading))
        
        delta_lat = dy / 111.0
        delta_lng = dx / (111.0 * math.cos(math.radians(self.lat)))
        
        self.lat += delta_lat
        self.lng += delta_lng
        
        # Randomly adjust the heading slightly to simulate driving on winding roads
        self.heading = (self.heading + random.uniform(-15, 15)) % 360
        
        # Randomly adjust the speed slightly within the vehicle's capabilities
        self.speed = max(self.speed_range[0], min(self.speed_range[1], self.speed + random.uniform(-5, 5)))

    def to_json(self):
        """Formats the payload cleanly for the Spring Boot backend"""
        return json.dumps({
            "vin": self.vin,
            "type": self.type,
            "lat": round(self.lat, 6),
            "lng": round(self.lng, 6),
            "speed": round(self.speed, 2),
            "fuelLevel": round(self.fuel_level, 2),
            "fuelEfficiency": round(self.fuel_efficiency, 2),
            "fuelRange": round(self.fuel_range, 2),
            "timestamp": int(time.time() * 1000) # Epoch in milliseconds
        })


def simulate_vehicle(vehicle):
    """Function to be run by each thread. Handles the MQTT connection and continuous publishing."""
    # Ensure a unique client_id for each thread
    client = mqtt.Client(client_id=vehicle.vin)
    
    try:
        client.connect(BROKER, PORT, 60)
    except Exception as e:
        print(f"[{vehicle.vin}] Connection to MQTT broker failed: {e}")
        return

    client.loop_start()
    
    try:
        while True:
            # Publish data
            payload = vehicle.to_json()
            client.publish(f"{TOPIC}/{vehicle.vin}", payload)
            print(f"[{time.strftime('%H:%M:%S')}] Published to {TOPIC}/{vehicle.vin} -> {payload}")
            
            # Wait for next cycle
            time.sleep(UPDATE_INTERVAL)
            
            # Update telemetry for next cycle
            vehicle.update_position(UPDATE_INTERVAL)
            
    except KeyboardInterrupt:
        pass # Handle gracefully in main thread
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    # =========================================================================
    # STARTING LOCATION
    # To change the starting city globally, just update START_LAT and START_LNG
    # 
    # Examples:
    # Bengaluru, India:  LAT = 12.9716, LNG = 77.5946
    # New York, USA:     LAT = 40.7128, LNG = -74.0060
    # London, UK:        LAT = 51.5074, LNG = -0.1278
    # Sydney, Australia: LAT = -33.8688, LNG = 151.2093
    # =========================================================================
    START_LAT = 12.9716
    START_LNG = 77.5946

    # Random offset so vehicles aren't stacked exactly on top of each other 
    # +/- 0.015 degrees is roughly +/- 1.5 kilometers
    def random_offset():
        return random.uniform(-0.015, 0.015)

    fleet = []
    
    # 1. Initialize 4 Cars
    # High speed (60-100 km/h), 15-18 km/l, 40-60L capacity
    for i in range(4):
        fleet.append(Vehicle(
            vin=f"KA01NF{5550 + i}", 
            v_type="Car", 
            lat=START_LAT + random_offset(), 
            lng=START_LNG + random_offset(), 
            speed_range=(60, 100), 
            efficiency_range=(15, 18), 
            fuel_capacity_range=(40, 60)
        ))
        
    # 2. Initialize 3 Buses
    # Moderate speed (40-60 km/h), 5-8 km/l, 200-300L capacity
    for i in range(3):
        fleet.append(Vehicle(
            vin=f"MH12AB{1230 + i}", 
            v_type="Bus", 
            lat=START_LAT + random_offset(), 
            lng=START_LNG + random_offset(), 
            speed_range=(40, 60), 
            efficiency_range=(5, 8), 
            fuel_capacity_range=(200, 300)
        ))
        
    # 3. Initialize 3 Lorries/Trucks
    # Slow speed (20-40 km/h), 3-5 km/l, 400-600L capacity
    for i in range(3):
        fleet.append(Vehicle(
            vin=f"DL04TR{8880 + i}", 
            v_type="Truck", 
            lat=START_LAT + random_offset(), 
            lng=START_LNG + random_offset(), 
            speed_range=(20, 40), 
            efficiency_range=(3, 5), 
            fuel_capacity_range=(400, 600)
        ))

    threads = []
    
    print("=====================================================")
    print(f"Starting Fleet Simulation with {len(fleet)} vehicles...")
    print(f"Connecting to MQTT Broker at {BROKER}:{PORT}")
    print("=====================================================\n")
    
    # Start a concurrent thread for each vehicle
    for vehicle in fleet:
        t = threading.Thread(target=simulate_vehicle, args=(vehicle,))
        t.daemon = True # Daemon threads will automatically exit when the main program exits
        t.start()
        threads.append(t)
        
    try:
        # Keep the main thread alive so the daemon threads continue running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nSimulation stopped by user.")
