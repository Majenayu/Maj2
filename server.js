const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Serve script1.js and script.js from their current location
app.use("/script1.js", express.static(path.join(__dirname, "script1.js")));
app.use("/script.js", express.static(path.join(__dirname, "script.js")));


// Connect to MongoDB
mongoose.connect("mongodb+srv://ayu:ayu@ayu.cawv7.mongodb.net/yourDatabaseName?retryWrites=true&w=majority&appName=ayu")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));


// Route-to-collection mapping
const routeCollections = [
    { start: [12.9172, 74.8560], end: [12.9716, 77.5946], collection: "1" },
    { start: [12.9172, 74.8560], end: [13.3409, 74.7421], collection: "2" },
    { start: [12.9172, 74.8560], end: [14.4530, 75.9215], collection: "3" },
    { start: [12.9172, 74.8560], end: [15.3647, 75.1239], collection: "4" },
    { start: [12.9172, 74.8560], end: [15.8497, 74.4977], collection: "5" },
    { start: [12.9172, 74.8560], end: [12.2958, 76.6394], collection: "6" },
    { start: [12.9716, 77.5946], end: [12.9172, 74.8560], collection: "7" },
    { start: [12.9716, 77.5946], end: [13.3409, 74.7421], collection: "8" },
    { start: [12.9716, 77.5946], end: [14.4530, 75.9215], collection: "9" },
    { start: [12.9716, 77.5946], end: [15.3647, 75.1239], collection: "10" },
    { start: [12.9716, 77.5946], end: [15.8497, 74.4977], collection: "11" },
    { start: [12.9716, 77.5946], end: [12.2958, 76.6394], collection: "12" },
    { start: [13.3409, 74.7421], end: [12.9172, 74.8560], collection: "13" },
    { start: [13.3409, 74.7421], end: [12.9716, 77.5946], collection: "14" },
    { start: [13.3409, 74.7421], end: [14.4530, 75.9215], collection: "15" },
    { start: [13.3409, 74.7421], end: [15.3647, 75.1239], collection: "16" },
    { start: [13.3409, 74.7421], end: [15.8497, 74.4977], collection: "17" },
    { start: [13.3409, 74.7421], end: [12.2958, 76.6394], collection: "18" },
    { start: [14.4530, 75.9215], end: [12.9172, 74.8560], collection: "19" },
    { start: [14.4530, 75.9215], end: [12.9716, 77.5946], collection: "20" },
    { start: [14.4530, 75.9215], end: [13.3409, 74.7421], collection: "21" },
    { start: [14.4530, 75.9215], end: [15.3647, 75.1239], collection: "22" },
    { start: [14.4530, 75.9215], end: [15.8497, 74.4977], collection: "23" },
    { start: [14.4530, 75.9215], end: [12.2958, 76.6394], collection: "24" },
    { start: [15.3647, 75.1239], end: [12.9172, 74.8560], collection: "25" },
    { start: [15.3647, 75.1239], end: [12.9716, 77.5946], collection: "26" },
    { start: [15.3647, 75.1239], end: [13.3409, 74.7421], collection: "27" },
    { start: [15.3647, 75.1239], end: [14.4530, 75.9215], collection: "28" },
    { start: [15.3647, 75.1239], end: [15.8497, 74.4977], collection: "29" },
    { start: [15.3647, 75.1239], end: [12.2958, 76.6394], collection: "30" },];

// Function to get the correct MongoDB collection
function getRouteCollection(start, end) {
    start = start.map(Number);
    end = end.map(Number);

    const route = routeCollections.find(r => 
        r.start[0] === start[0] && r.start[1] === start[1] && 
        r.end[0] === end[0] && r.end[1] === end[1]
    );

    return route ? mongoose.connection.db.collection(route.collection) : null;
}

// API to update the driver's location
// API to update the driver's location
app.post('/update-location', async (req, res) => {
    const { start, end, lat, lng, passengerCount } = req.body;

    // Validate required fields
    if (!start || !end || lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: "Missing required parameters (start, end, lat, lng)" });
    }

    const collection = getRouteCollection(start, end);
    if (!collection) {
        return res.status(404).json({ success: false, message: "Route not found" });
    }

    const routeId = `${start.join(",")}-${end.join(",")}`;
    const updateData = {
        location: { lat, lng },
        updatedAt: new Date()
    };

    // Include passengerCount only if it's valid (number or string representing number)
    if (passengerCount !== undefined && passengerCount !== null) {
        updateData.passengerCount = passengerCount;
    }

    try {
        await collection.updateOne(
            { _id: routeId },
            { $set: updateData },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
