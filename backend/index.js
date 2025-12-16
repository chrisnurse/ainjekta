import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { loadAllScenarios, loadScenario, getScenariosList } from './scenarioService.js';
import { AVAILABLE_MODELS, getDefaultModel, isValidModel } from './models.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SANDBOX_DIR = path.join(__dirname, 'sandbox');

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
    const { systemPrompt, messages, model, toolMode } = req.body;

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

    const enableTools = toolMode === 'vulnerable' || toolMode === 'defended';
    const enforceToolPolicy = toolMode === 'defended';

    const tools = enableTools
      ? [
        {
          type: 'function',
          function: {
            name: 'read_internal_file',
            description:
              'Reads an internal sandbox file. Intended for demonstrating prompt-injection data exfiltration in a safe environment.',
            parameters: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Relative path within the sandbox, e.g. sample_config.env'
                }
              },
              required: ['path'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'list_internal_files',
            description: 'Lists available internal sandbox files.',
            parameters: {
              type: 'object',
              properties: {},
              additionalProperties: false
            }
          }
        }
      ]
      : undefined;

    const runTool = (toolCall) => {
      const toolName = toolCall?.function?.name;
      const rawArgs = toolCall?.function?.arguments || '{}';
      let args;
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = {};
      }

      if (toolName === 'list_internal_files') {
        const files = fs
          .readdirSync(SANDBOX_DIR)
          .filter(f => !f.startsWith('.'))
          .sort();
        return JSON.stringify({ files });
      }

      if (toolName === 'read_internal_file') {
        const relPath = String(args.path || '');

        // Basic path traversal guard
        if (!relPath || relPath.includes('..') || path.isAbsolute(relPath)) {
          return JSON.stringify({ error: 'Invalid path' });
        }

        // "Defended" mode: enforce a policy at the tool layer.
        // This is what real apps must do (authz at the boundary), regardless of prompt quality.
        if (enforceToolPolicy) {
          return JSON.stringify({
            error:
              'Access denied: internal files are not available. (Tool-layer policy enforcement)'
          });
        }

        const fullPath = path.join(SANDBOX_DIR, relPath);
        try {
          const contents = fs.readFileSync(fullPath, 'utf-8');
          return JSON.stringify({ path: relPath, contents });
        } catch {
          return JSON.stringify({ error: 'File not found' });
        }
      }

      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    };

    // Build the message array with system prompt and conversation history
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Tool-calling loop (max 3 iterations)
    let workingMessages = chatMessages;
    let lastUsage;
    let finalText = null;
    const trace = enableTools ? { toolCalls: [] } : null;

    for (let i = 0; i < 3; i++) {
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: workingMessages,
        tools,
        tool_choice: enableTools ? 'auto' : undefined,
        temperature: enableTools ? 0 : undefined
      });

      lastUsage = completion.usage;
      const msg = completion.choices?.[0]?.message;

      // If the model produced tool calls, execute them and continue.
      if (enableTools && msg?.tool_calls?.length) {
        workingMessages = [...workingMessages, msg];

        for (const tc of msg.tool_calls) {
          const output = runTool(tc);

          if (trace) {
            trace.toolCalls.push({
              name: tc?.function?.name,
              arguments: tc?.function?.arguments,
              output
            });
          }

          workingMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: output
          });
        }

        continue;
      }

      finalText = msg?.content || '';
      break;
    }

    res.json({
      message: finalText ?? '',
      usage: lastUsage,
      trace: trace || undefined
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({
      error: 'Failed to get completion from OpenAI',
      details: error.message
    });
  }
});

export { app };

// Only start the HTTP server when this file is executed directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
