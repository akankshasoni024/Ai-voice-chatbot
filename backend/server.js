require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

app.use(express.json());
app.use(cors());

if (!COHERE_API_KEY) {
    console.error("❌ COHERE_API_KEY is missing in .env file!");
    process.exit(1);
} else {
    console.log("✅ COHERE_API_KEY loaded successfully.");
}

// API Route
app.post("/chat", async (req, res) => {
    try {
        const { message, language } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log(`📩 Incoming message (${language}): ${message}`);

        // Call Cohere API with language support
        const response = await axios.post(
            {
                model: "command",
                prompt: message,
                max_tokens: 100,
                language: language === "hi" ? "hi" : "en" // Set language
            },
            {
                headers: {
                    "Authorization": `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const botResponse = response.data.generations[0].text;
        console.log(`✅ Cohere Response (${language}):`, botResponse);
        res.json({ response: botResponse });

    } catch (error) {
        console.error("❌ Cohere API Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || "Something went wrong"
        });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
