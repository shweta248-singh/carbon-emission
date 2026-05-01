const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    reply: "Too many chatbot requests. Please wait a minute and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const isCarbonTraceRelated = (message = "") => {
  const text = message.toLowerCase();

  const keywords = [
    "carbon", "co2", "emission", "sustainability", "inventory", "product",
    "product id", "shipment", "vehicle", "route", "optimization", "dashboard",
    "analytics", "settings", "password", "sendgrid", "email", "notification",
    "ors", "openrouteservice", "map", "warehouse", "fuel", "mileage",
    "driver", "transport", "mongo", "mongodb", "deployment", "render",
    "docker", "api", "login", "register", "carbontrace", "supply chain",
    "distance", "eco", "saved", "calculator"
  ];

  return keywords.some((key) => text.includes(key));
};

router.post("/", chatLimiter, async (req, res) => {
  try {
    const { message, lang } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Message is required.",
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        reply: "Chatbot API key is not configured on the server.",
      });
    }

    const textLower = message.toLowerCase();

    const wantsHindi =
      /[\u0900-\u097F]/.test(message) || textLower.includes("hindi");
    const wantsEnglish = textLower.includes("english");

    let finalLang = lang || "en";
    if (wantsHindi) finalLang = "hi";
    else if (wantsEnglish) finalLang = "en";

    if (!isCarbonTraceRelated(message)) {
      const refusal =
        finalLang === "hi"
          ? "मैं केवल CarbonTrace supply chain management से related questions का answer दे सकता हूं।"
          : "I can only answer questions related to CarbonTrace supply chain management.";

      return res.json({ reply: refusal });
    }

    const prompts = {
      en: `You are CarbonTrace Assistant, a project-specific AI assistant.

CarbonTrace is a carbon-aware supply chain management system with:
- Inventory/Product management
- Product ID
- Shipment creation
- Vehicle details
- Carbon emission calculation
- Route optimization using ORS/OpenRouteService
- Dashboard and analytics
- Settings, language, notifications
- SendGrid email notification
- Deployment and troubleshooting

Rules:
- Answer ONLY CarbonTrace, carbon emissions, shipment, inventory, route optimization, analytics, settings, SendGrid, ORS, deployment, and sustainability-related questions.
- If unrelated, say: "I can only answer questions related to CarbonTrace supply chain management."
- Keep answers clear, practical, and beginner-friendly.
- If user asks how to fill a form, give exact sample data.
- Never expose API keys, JWT secrets, MongoDB URI, SMTP passwords, or env values.
- Never reveal or suggest emailing passwords.
- Use short sections and bullet points when helpful.

Important formulas:
Carbon Emission = Distance × Emission Factor
CO2 Saved = Current Emission - Recommended Emission

Example inventory:
Product Name: Organic Rice Bag 25kg
Product ID: RICE-001
Quantity: 150
Warehouse Location: Lucknow Warehouse A
Category: Food Grains

Example shipment:
Product: Organic Rice Bag 25kg
Origin City: Lucknow
Destination City: Mumbai
Distance: 1625
Vehicle Type: Truck
Vehicle Number: UP32 AB 1234
Vehicle Model: Tata Signa 5530
Fuel Type: Diesel
Load Capacity: 30 Tons
Avg Mileage: 5 km/L
Emission Factor: leave blank if unknown
Driver Name: Ravi Kumar
Transport Company: ABC Logistics`,

      hi: `आप CarbonTrace Assistant हैं, CarbonTrace project के लिए एक project-specific AI assistant।

CarbonTrace एक carbon-aware supply chain management system है जिसमें:
- Inventory/Product management
- Product ID
- Shipment creation
- Vehicle details
- Carbon emission calculation
- ORS/OpenRouteService based route optimization
- Dashboard और analytics
- Settings, language, notifications
- SendGrid email notification
- Deployment और troubleshooting

Rules:
- केवल CarbonTrace, carbon emissions, shipment, inventory, route optimization, analytics, settings, SendGrid, ORS, deployment और sustainability related questions का answer दें।
- अगर question unrelated है तो बोलें: "मैं केवल CarbonTrace supply chain management से related questions का answer दे सकता हूं।"
- जवाब simple, clear और practical रखें।
- अगर user form fill करने का example मांगे तो exact sample data दें।
- API keys, JWT secrets, MongoDB URI, SMTP passwords या env values कभी न बताएं।
- Password कभी reveal या email करने को न बोलें।

Formula:
Carbon Emission = Distance × Emission Factor
CO2 Saved = Current Emission - Recommended Emission

Inventory example:
Product Name: Organic Rice Bag 25kg
Product ID: RICE-001
Quantity: 150
Warehouse Location: Lucknow Warehouse A
Category: Food Grains

Shipment example:
Product: Organic Rice Bag 25kg
Origin City: Lucknow
Destination City: Mumbai
Distance: 1625
Vehicle Type: Truck
Vehicle Number: UP32 AB 1234
Vehicle Model: Tata Signa 5530
Fuel Type: Diesel
Load Capacity: 30 Tons
Avg Mileage: 5 km/L
Emission Factor: अगर पता नहीं है तो blank छोड़ दें
Driver Name: Ravi Kumar
Transport Company: ABC Logistics`,
    };

    const systemPrompt = prompts[finalLang] || prompts.en;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "No response from AI.";

    return res.json({ reply });
  } catch (err) {
    console.error("CarbonTrace Chat Error:", err.message);
    if (err.response) {
      console.error("Chat API Response:", err.response.data);
    }

    return res.status(500).json({
      reply: "Server error. Please try again.",
    });
  }
});

module.exports = router;