const express = require("express"); 
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// SSL Configuration
const keyPath = path.join(__dirname, "cert/server.key");
const certPath = path.join(__dirname, "cert/server.cert");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error("ERROR: SSL Certificates not found in /cert folder!");
    process.exit(1);
}

const sslOptions = { 
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

//Security 



app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'"], 
                scriptSrc: ["'self'"], 
                imgSrc: ["'self'", "data:"]
            }
        }
    })
);

//Core Middleware Setup

app.use(express.json());
app.use(cookieParser()); //added to read JWT tokens later

//FIXED: Static file caching
app.use(express.static("public", {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.set("Cache-Control", "public, max-age=86400");
        }
    }
}));

//Filler(mock) Data

const feedback = [
{
    id:1,
    project: "Website redesign",
    client: "Client A", 
    freelancer: "Designer B", 
    comment: "Please improve spacing on Homepage", 
    status: "open"
}, 
{
    id: 2, 
    project: "Mobile app UI", 
    client: "Client K", 
    freelancer: "Designer J", 
    comment: "Those colors look great now", 
    status: "resolved"
}]; 

//cache enabling for public feedbacks

app.get("/feedback", (req, res) => {
    res.set("Cache-Control", "public, max-age=600, stale-while-revalidate=120");
    res.json(feedback);
})

app.get("/feedback/:id" , (req, res) => {
    const item = feedback.find(f => f.id == req.params.id);

    if (!item) {
        return res.status(404).json({ error: "Feedback not found" });
    }

    res.set("Cache-Control", "public, max-age=300");
    res.json(item);
})

// Create Feedback (No Caching Sensitive)

app.post("/feedback", (req, res) => {
    const newFeedback = {
        id: feedback.length + 1, 
        ...req.body
    };

    feedback.push(newFeedback);

    res.set("cache-control", "no-store");
    res.status(201).json(newFeedback);
});

//Private Routes (Not for Cache)

app.get("/profile", (req, res) => {
    res.set("cache-control", "no-store");

    res.json({
        user: "Freelancer A",
        role: "freelancer"
    });
});

app.get("/dashboard", (req, res) => {
    res.set("Cache-Control", "private, no-store");

        res.json({
            activeProjects: 3,
            unreadFeedback: 5
        });
});

//Start Secure HTTPS Server

https.createServer(sslOptions, app).listen(3000, () => {
    console.log("Secure server running at:");
    console.log("https://localhost:3000");
});
