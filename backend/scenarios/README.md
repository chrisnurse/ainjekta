# Prompt Injection Scenarios

This directory contains carefully crafted educational scenarios demonstrating prompt injection vulnerabilities and defenses.

## Structure

Each scenario is a markdown file with the following sections:

### Metadata Fields
- **ID**: Unique identifier for programmatic access (e.g., `basic-prompt-leaking`)
- **Level**: `Beginner` or `Advanced`
- **Tags**: Comma-separated list of attack type categories
- **Difficulty Score**: Rating from 1-10 indicating complexity

### Content Sections
- **Description**: Explains the vulnerability, setup, tactics, and how they work
- **Demonstrated Vulnerability**: Shows the vulnerable prompts with:
  - System Prompt (in ```system_prompt block)
  - User Prompt/Attack (in ```user_prompt block)
  - What Happens: Explanation of the attack outcome
  - Expected Outcome: What users should observe
  
- **Variations**: 2-4 alternative attack vectors showing different ways to exploit the same vulnerability

- **Defence**: Shows remediated prompts with:
  - System Prompt (Protected) (in ```system_prompt block)
  - User Prompt (Protected) (in ```user_prompt block)
  - What Happens (Protected): How the system responds
  - Expected Outcome: Demonstrates successful defense

- **Key Learning Points**: Bullet points summarizing important takeaways

## Current Scenarios

### 1. Basic Prompt Leaking (Beginner - 2/10)
The simplest prompt injection attack where users try to directly request the system prompt. Demonstrates the importance of explicit safeguards.

**Tags**: prompt-leaking, information-disclosure

### 2. Role Confusion Attack (Beginner - 3/10)
Attackers trick the AI into adopting a different persona with fewer restrictions. Shows how role definitions can be overridden through injection.

**Tags**: privilege-escalation, role-confusion, instruction-override

### 3. Context Overflow Attack (Advanced - 6/10)
Sophisticated attack using large amounts of injected content to shadow or override the original system prompt. Exploits how LLMs weight recent instructions.

**Tags**: context-overflow, data-injection, instruction-shadowing

### 4. Prompt Leaking via Code Generation (Advanced - 5/10)
Attackers use seemingly legitimate requests for code or examples to trick the system into revealing sensitive configuration information indirectly.

**Tags**: prompt-leaking, code-generation, indirect-disclosure

## Scenario Format Example

```markdown
# Scenario Title

## ID
scenario-identifier

## Level
Beginner

## Tags
tag1, tag2, tag3

## Difficulty Score
3/10

## Description
[Detailed explanation of the vulnerability...]

## Demonstrated Vulnerability

### System Prompt
\`\`\`system_prompt
Your system prompt here
\`\`\`

### User Prompt (Vulnerable)
\`\`\`user_prompt
The attack vector here
\`\`\`

### What Happens
[Explanation of the attack]

### Expected Outcome
[What the user should observe]

## Variations

### Variation 1: [Name]
\`\`\`user_prompt
Alternative attack approach
\`\`\`

## Defence

### System Prompt (Protected)
\`\`\`system_prompt
Hardened system prompt
\`\`\`

### User Prompt (Protected)
\`\`\`user_prompt
Same attack attempt
\`\`\`

### What Happens (Protected)
[How the system now responds]

### Expected Outcome
[Defense works - system is protected]

## Key Learning Points
- Point 1
- Point 2
- Point 3
```

## Backend Integration

The backend parses these markdown files and serves them via API:

### Endpoints
- `GET /api/scenarios` - List all scenarios with metadata
- `GET /api/scenarios/:id` - Get full details of a specific scenario

### Scenario Service Methods
- `getScenariosList()` - Returns array of scenario summaries
- `loadScenario(id)` - Returns complete scenario with all sections
- `loadAllScenarios()` - Returns all scenarios with metadata

## Adding New Scenarios

1. Create a new markdown file in this directory with the naming convention: `##-scenario-name.md`
2. Use the format specified above
3. Ensure the ID matches the scenario identifier
4. The backend will automatically discover and serve it via the API

## Best Practices for Scenarios

1. **Progressive Difficulty**: Beginner scenarios should be easy to understand and execute; Advanced scenarios explore nuances
2. **Multiple Variations**: Show 2-4 ways the same attack can be executed
3. **Clear Defenses**: Explain exactly what changed in the system prompt and why it works
4. **Learning Focused**: Each scenario should teach a specific security principle
5. **Real-World Relevance**: Base scenarios on actual attack patterns used in the wild
6. **Complete Examples**: Include full, runnable prompts that don't require user interpretation

## Difficulty Scoring Guidelines

- **1-2/10**: Trivial attacks that work with minimal prompting
- **3-4/10**: Simple but effective attacks requiring basic understanding
- **5-6/10**: Moderate complexity, exploiting nuances in LLM behavior
- **7-8/10**: Advanced attacks using sophisticated techniques
- **9-10/10**: Cutting-edge attacks or those requiring deep LLM knowledge
