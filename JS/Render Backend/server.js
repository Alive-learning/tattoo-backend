const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); 
// We increase the limit so you can upload images up to 10MB
app.use(express.json({ limit: '10mb' })); 

// This will pull the password from Render's secret settings. 
// If it's not set (like on your local PC), it defaults to "admin123" for testing.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET_TOKEN = "my_super_secret_vip_wristband_9988"; // In a real app, generate this randomly

// We will temporarily store images in the server's memory.
// (Note: On Render's free tier, this resets when the server sleeps. In the future, we will connect this to a free database!)
let galleryDatabase = {
    tattoo: [],
    piercing:[],
    team:[]
};

// 1. LOGIN ROUTE (Checking the password)
app.post('/api/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        res.json({ success: true, token: SECRET_TOKEN });
    } else {
        res.status(401).json({ success: false, message: "Wrong password" });
    }
});

// 2. GET GALLERY ROUTE (Anyone can view the images)
app.get('/api/gallery', (req, res) => {
    res.json(galleryDatabase);
});

// 3. UPLOAD IMAGE ROUTE (Requires the VIP Token!)
app.post('/api/gallery', (req, res) => {
    // Check for the VIP Wristband
    const userToken = req.headers.authorization;
    if (userToken !== SECRET_TOKEN) {
        return res.status(401).json({ success: false, message: "Unauthorized! Nice try." });
    }

    const newImage = req.body; // The frontend sends the image data
    const category = newImage.category;

    if (!galleryDatabase[category]) {
        galleryDatabase[category] = [];
    }

    galleryDatabase[category].push(newImage);
    res.json({ success: true, message: "Image saved to server!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});