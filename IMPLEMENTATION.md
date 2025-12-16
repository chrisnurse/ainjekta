# Prompt Injection Learning Lab - Implementation Guide

## 🎯 Project Overview

A world-class, interactive platform for learning about prompt injection vulnerabilities and defenses. Users can explore curated scenarios that demonstrate real attacks and their mitigations in a safe, educational environment.

## 📂 Architecture

### Backend (`/backend`)
- **Express.js** server with OpenAI integration
- **Scenario Service** (`scenarioService.js`) - Parses and serves markdown-based scenarios
- **Scenario Library** (`/scenarios`) - 4 high-quality starting scenarios with 2+ variations each

### Frontend (`/frontend`)
- **Vue 3** with Vite
- **Three-component system**:
  - `ScenarioSelector.vue` - Browse and select learning scenarios
  - `ScenarioViewer.vue` - Interactive scenario viewer with tabs
  - `ChatInterface.vue` - Live chat with configurable prompts

## 🚀 Key Features

### Scenario Management
Each scenario includes:
- **Metadata**: ID, Level (Beginner/Advanced), Tags, Difficulty Score (1-10)
- **Educational Content**: Description and key learning points
- **Vulnerability Demo**: Shows vulnerable prompts with detailed explanation
- **Attack Variations**: 2-4 alternative ways to exploit the same vulnerability
- **Defense Showcase**: Protected prompts with clear explanations of how defense works
- **Code Examples**: All prompts in dedicated code blocks for easy copying

### Backend Endpoints
```
GET /health
  → Health check

GET /api/scenarios
  → List all scenarios with metadata
  → Returns: { scenarios: [...] }

GET /api/scenarios/:id
  → Get complete scenario details
  → Returns: { title, id, level, description, sections: {...} }

POST /api/chat
  → Send message with system prompt
  → Body: { systemPrompt, messages }
```

### Scenario Structure (Markdown)
```
# Title

## ID
unique-identifier

## Level
Beginner / Advanced

## Tags
tag1, tag2, tag3

## Difficulty Score
X/10

## Description
[Explanation of vulnerability]

## Demonstrated Vulnerability
System Prompt + User Prompt + Explanation

## Variations
[2-4 alternative attack vectors]

## Defence
Protected System Prompt + Protected User Prompt

## Key Learning Points
[Bullet points of insights]
```

## 📚 Current Scenarios (4 Included)

### 1. **Basic Prompt Leaking** (Beginner - 2/10)
- Most fundamental prompt injection attack
- Direct request to reveal system prompt
- Defense: Explicit security directives
- Tags: prompt-leaking, information-disclosure

### 2. **Role Confusion Attack** (Beginner - 3/10)
- Trick AI into adopting unrestricted persona
- Uses roleplay and "mode switching"
- Defense: Immutable core identity
- Tags: privilege-escalation, role-confusion, instruction-override

### 3. **Context Overflow Attack** (Advanced - 6/10)
- Injects conflicting instructions in context
- Exploits how models weight recent instructions
- Defense: Explicit injection pattern detection
- Tags: context-overflow, data-injection, instruction-shadowing

### 4. **Prompt Leaking via Code Generation** (Advanced - 5/10)
- Requests for "realistic examples" or code
- Indirectly reveals system configuration
- Defense: Strict isolation of system vs. generated content
- Tags: prompt-leaking, code-generation, indirect-disclosure

## 🛠️ Implementation Details

### Scenario Service (`scenarioService.js`)
- Parses markdown files with custom frontmatter format
- Extracts metadata and sections
- Handles code blocks with language identifiers
- Returns structured JSON for frontend consumption

**Functions:**
```javascript
getScenariosList()          // Returns lightweight summaries
loadScenario(id)            // Returns complete scenario
loadAllScenarios()          // Raw parsed scenarios
```

### Frontend Components

#### ScenarioSelector.vue
- Sidebar component for browsing scenarios
- Groups by difficulty level (Beginner/Advanced)
- Shows difficulty score as visual indicator
- Emits 'select-scenario' event

#### ScenarioViewer.vue
- Three-tab interface (Overview, Vulnerability, Defense)
- Displays formatted code blocks with syntax highlighting
- Action buttons to apply vulnerable/protected prompts
- Fetches full scenario details via API

#### ChatInterface.vue
- Editable system prompt textarea
- Message history display
- Real-time chat with OpenAI
- Clear chat and reset functionality

### App.vue (Main)
- Manages global state (scenarios, selected scenario, chat)
- Handles scenario selection flow
- Integrates all sub-components
- Modern gradient header with branding

## 🎨 UI/UX Design

**Color Scheme:**
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Deep Purple)
- Success: #42b983 (Green)
- Accent: Gradient background

**Layout:**
- Sidebar (280px) with scenario list
- Main content area with responsive components
- Clean typography and spacing
- Hover states for interactivity

## 📡 API Integration

### Scenario Loading Flow
1. App mounts → `GET /api/scenarios` → Display list
2. User clicks scenario → `GET /api/scenarios/:id` → Show viewer
3. User clicks "Try" button → Apply prompts to chat

### Chat Flow
1. User types message
2. Send via `POST /api/chat` with current system prompt
3. Receive AI response
4. Display in message history

## 🔧 Setup & Running

### Backend
```bash
cd backend
npm install
npm run 01.dev          # Development with watch mode
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Development server with Vite
```

### Environment Variables
`.env` (Backend):
```
PORT=3000
OPENAI_API_KEY=your_key_here
```

## 🚀 Deployment Considerations

### Frontend
- Build with `npm run build`
- Deploy static files to any hosting (Vercel, Netlify, etc.)
- CORS configured to work with backend

### Backend
- Containerize with Docker
- Use environment variables for API keys
- Implement rate limiting for OpenAI calls
- Add request logging and monitoring

## 🎓 Educational Value

### Learning Path for Users
1. **Beginner**: Start with Basic Prompt Leaking (2/10)
2. **Beginner+**: Try Role Confusion Attack (3/10)
3. **Intermediate**: Move to Advanced scenarios
4. **Advanced**: Context Overflow and Code Generation exploits

### Teaching Techniques
- **Vulnerability-First**: Users see attacks before defenses
- **Multiple Variations**: Shows that defenses work against different approaches
- **Side-by-Side Comparison**: Vulnerable vs. protected code visible together
- **Hands-On Practice**: Users can immediately test in chat interface

## 📖 Adding New Scenarios

1. Create `##-scenario-name.md` in `/backend/scenarios`
2. Follow the markdown format in `scenarios/README.md`
3. Include 2-4 variations for comprehensive learning
4. Test via `GET /api/scenarios/:id`
5. Scenarios auto-discover - no code changes needed!

## 🔒 Security Considerations

This platform is designed as an **educational tool** with:
- OpenAI API key in backend (never exposed to frontend)
- No user data persistence
- Rate limiting recommended for production
- All prompts visible for learning purposes (not for production systems)

## 🌟 Quality Standards Implemented

✅ **Complete Scenario Library**: 4 diverse scenarios covering beginner to advanced attacks  
✅ **Enhanced Metadata**: ID, level, tags, difficulty score, multiple variations  
✅ **Defense Demonstrations**: Clear before/after showing attack mitigation  
✅ **Educational Structure**: Description, variations, learning points  
✅ **Professional UI**: Modern gradient design with intuitive navigation  
✅ **API-Driven Content**: Backend serves markdown as JSON for flexibility  
✅ **Component Architecture**: Reusable, maintainable Vue components  
✅ **Type-Safe Parsing**: Robust scenario markdown parser  
✅ **User-Friendly**: One-click scenario loading with clear prompts  

## 🎯 Future Enhancements

- User progress tracking
- Scenario difficulty filtering
- Custom prompt comparison tool
- Attack success metrics
- Community-contributed scenarios
- Scenario rating system
- Export capabilities for reports
- Interactive attack simulation builder
- Multi-language support
