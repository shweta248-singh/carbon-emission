const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const knowledge = require('../src/knowledge/carbonTraceKnowledge');
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after an hour'
  }
});

// @desc    Ask chatbot a question
// @route   POST /api/chatbot/ask
// @access  Private
router.post('/ask', protect, chatbotLimiter, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const lowerMessage = message.toLowerCase();
    let intent = 'unrelated';
    let confidence = 0.5;
    let answer = knowledge.unrelated_reply[language] || knowledge.unrelated_reply['en'];
    let source = 'project_knowledge';

    // Intent detection logic
    if (lowerMessage.includes('inventory') || lowerMessage.includes('इन्वेंट्री') || lowerMessage.includes('inventario')) {
      intent = 'explain_inventory';
      confidence = 0.9;
      answer = knowledge.definitions.inventory[language];
    }
    
    if (lowerMessage.includes('shipment') || lowerMessage.includes('शिपमेंट') || lowerMessage.includes('envío')) {
      intent = 'explain_shipment';
      confidence = 0.9;
      answer = knowledge.definitions.shipment[language];
    }

    if (lowerMessage.includes('sku')) {
      intent = 'explain_sku';
      confidence = 0.95;
      answer = knowledge.definitions.sku[language];
    }

    if (lowerMessage.includes('warehouse') || lowerMessage.includes('गोदाम') || lowerMessage.includes('almacén')) {
      intent = 'explain_warehouse';
      confidence = 0.9;
      answer = knowledge.definitions.warehouse[language];
    }

    if (lowerMessage.includes('emission') || lowerMessage.includes('उत्सर्जन') || lowerMessage.includes('emisión')) {
      intent = 'explain_emission';
      confidence = 0.95;
      answer = knowledge.definitions.carbon_emission[language];
    }

    if (lowerMessage.includes('summary') || lowerMessage.includes('सारांश') || lowerMessage.includes('resumen') || lowerMessage.includes('my data') || lowerMessage.includes('मेरा डेटा')) {
      intent = 'user_summary';
      confidence = 0.95;
      source = 'user_data';
      
      const inventoryCount = await Inventory.countDocuments({ user: userId });
      const shipments = await Shipment.find({ user: userId });
      const shipmentCount = shipments.length;
      const totalEmissions = shipments.reduce((acc, s) => acc + (s.carbonEmissionKg || 0), 0);
      const totalSavings = shipments.reduce((acc, s) => acc + (s.savingsKg || 0), 0);
      const lowStock = await Inventory.find({ user: userId, quantity: { $lt: 10 } }).limit(3);

      if (language === 'hi') {
        answer = `आपका सारांश:\n- कुल इन्वेंट्री: ${inventoryCount}\n- कुल शिपमेंट: ${shipmentCount}\n- कुल कार्बन उत्सर्जन: ${totalEmissions.toFixed(2)} किग्रा\n- कुल CO2 बचत: ${totalSavings.toFixed(2)} किग्रा`;
        if (lowStock.length > 0) {
          answer += `\n- कम स्टॉक वाले उत्पाद: ${lowStock.map(i => i.productName).join(', ')}`;
        }
      } else if (language === 'es') {
        answer = `Su resumen:\n- Inventario total: ${inventoryCount}\n- Envíos totales: ${shipmentCount}\n- Emisiones totales de carbono: ${totalEmissions.toFixed(2)} kg\n- Total de CO2 ahorrado: ${totalSavings.toFixed(2)} kg`;
        if (lowStock.length > 0) {
          answer += `\n- Productos con poco stock: ${lowStock.map(i => i.productName).join(', ')}`;
        }
      } else {
        answer = `Your Summary:\n- Total Inventory: ${inventoryCount}\n- Total Shipments: ${shipmentCount}\n- Total Carbon Emissions: ${totalEmissions.toFixed(2)} kg\n- Total CO2 Saved: ${totalSavings.toFixed(2)} kg`;
        if (lowStock.length > 0) {
          answer += `\n- Low Stock Products: ${lowStock.map(i => i.productName).join(', ')}`;
        }
      }
    }

    if (lowerMessage.includes('example') || lowerMessage.includes('उदाहरण') || lowerMessage.includes('ejemplo') || lowerMessage.includes('sample') || lowerMessage.includes('fill')) {
      intent = 'example_data';
      confidence = 0.9;
      if (lowerMessage.includes('inventory') || lowerMessage.includes('इन्वेंट्री') || lowerMessage.includes('inventario')) {
        answer = knowledge.examples.inventory[language];
      } else if (lowerMessage.includes('shipment') || lowerMessage.includes('शिपमेंट') || lowerMessage.includes('envío')) {
        answer = knowledge.examples.shipment[language];
      } else {
        answer = `${knowledge.examples.inventory[language]}\n\n${knowledge.examples.shipment[language]}`;
      }
    }

    if (lowerMessage.includes('dashboard') || lowerMessage.includes('डैशबोर्ड')) {
      intent = 'explain_dashboard';
      confidence = 0.9;
      answer = knowledge.features.operations_hub[language]; // Reusing description for now or could add more
    }

    if (lowerMessage.includes('analytics') || lowerMessage.includes('एनालिटिक्स')) {
      intent = 'explain_analytics';
      confidence = 0.9;
      answer = knowledge.features.analytics[language];
    }

    if (confidence < 0.8) {
      answer = knowledge.low_confidence_reply[language] || knowledge.low_confidence_reply['en'];
    }

    res.json({
      success: true,
      answer,
      confidence,
      source
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
