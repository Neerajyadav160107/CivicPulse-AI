require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = JSON.parse(
    Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
    ).toString("utf8")
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const complaintRoutes = require("./routes/complaintRoutes");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/complaints", complaintRoutes);

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("CivicPulse AI backend is running!");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "CivicPulse API is healthy"
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000`);
});