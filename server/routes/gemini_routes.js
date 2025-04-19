const express = require('express');
const router = express.Router();
const { generateGeminiResponse } = require('../services/gemini_service');

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided.' });
  }

  try {
    const aiResponse = await generateGeminiResponse(userMessage);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error handling Gemini chat request:', error);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

module.exports = router;
