import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { loadAllScenarios, loadScenario, getScenariosList } from './scenarioService.js';
import { AVAILABLE_MODELS, getDefaultModel, isValidModel } from './models.js';

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

// Models endpoint
app.get('/api/models', (req, res) => {
  try {
    res.json({
      models: AVAILABLE_MODELS,
      default: getDefaultModel().id
    });
  } catch (error) {
    console.error('Error loading models:', error);
    res.status(500).json({ error: 'Failed to load models' });
  }
});

// Scenarios endpoints
app.get('/api/scenarios', (req, res) => {
  try {
    const scenarios = getScenariosList();
    res.json({ scenarios });
  } catch (error) {
    console.error('Error loading scenarios:', error);
    res.status(500).json({ error: 'Failed to load scenarios' });
  }
});

app.get('/api/scenarios/:id', (req, res) => {
  try {
    const scenario = loadScenario(req.params.id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    console.error('Error loading scenario:', error);
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { systemPrompt, messages, model } = req.body;

    if (!systemPrompt || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request. Required: systemPrompt (string) and messages (array)'
      });
    }

    const selectedModel = model || getDefaultModel().id;

    if (!isValidModel(selectedModel)) {
      return res.status(400).json({
        error: `Invalid model: ${selectedModel}`
      });
    }

    // Build the message array with system prompt and conversation history
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: selectedModel,
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
