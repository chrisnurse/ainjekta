import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { systemPrompt, messages } = req.body;

    if (!systemPrompt || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request. Required: systemPrompt (string) and messages (array)' 
      });
    }

    // Build the message array with system prompt and conversation history
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
    });

    res.json({
      message: completion.choices[0].message.content,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ 
      error: 'Failed to get completion from OpenAI',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
