import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCENARIOS_DIR = path.join(__dirname, 'scenarios');

// Parse markdown frontmatter and sections
function parseScenarioMarkdown(content) {
    const lines = content.split('\n');
    const scenario = {
        title: '',
        sections: {}
    };

    let currentSection = null;
    let currentContent = [];
    let inCodeBlock = false;
    let codeBlockLanguage = '';
    let lastHeader = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                if (currentSection) {
                    if (!scenario.sections[currentSection]) {
                        scenario.sections[currentSection] = [];
                    }
                    scenario.sections[currentSection].push({
                        type: 'code',
                        language: codeBlockLanguage || inferLanguageFromHeader(lastHeader),
                        content: currentContent.join('\n').trim()
                    });
                    currentContent = [];
                }
                inCodeBlock = false;
            } else {
                // Start of code block
                codeBlockLanguage = line.substring(3).trim();
                inCodeBlock = true;
            }
            continue;
        }

        // Collect code block content
        if (inCodeBlock) {
            currentContent.push(line);
            continue;
        }

        // Handle headers
        if (line.startsWith('# ')) {
            scenario.title = line.substring(2).trim();
            continue;
        }

        if (line.startsWith('## ')) {
            // Save previous section
            if (currentSection && currentContent.length > 0) {
                if (!scenario.sections[currentSection]) {
                    scenario.sections[currentSection] = [];
                }
                scenario.sections[currentSection].push({
                    type: 'text',
                    content: currentContent.join('\n').trim()
                });
            }

            // Start new section
            currentSection = line.substring(3).trim();
            lastHeader = '';
            currentContent = [];
            continue;
        }

        if (line.startsWith('### ')) {
            const headerText = line.substring(4).trim();

            // If we were collecting plain text, flush it before starting a new subheader.
            if (currentSection && currentContent.length > 0) {
                if (!scenario.sections[currentSection]) {
                    scenario.sections[currentSection] = [];
                }
                scenario.sections[currentSection].push({
                    type: 'text',
                    content: currentContent.join('\n').trim()
                });
                currentContent = [];
            }

            // Special-case: keep variation subheaders so the UI can build a dropdown.
            if (currentSection && currentSection.toLowerCase() === 'variations') {
                if (!scenario.sections[currentSection]) {
                    scenario.sections[currentSection] = [];
                }
                scenario.sections[currentSection].push({
                    type: 'text',
                    content: headerText
                });
            }

            lastHeader = headerText;
            continue;
        }

        // Collect content
        if (currentSection) {
            currentContent.push(line);
        }
    }

    // Save last section
    if (currentSection && currentContent.length > 0) {
        if (!scenario.sections[currentSection]) {
            scenario.sections[currentSection] = [];
        }
        scenario.sections[currentSection].push({
            type: 'text',
            content: currentContent.join('\n').trim()
        });
    }

    return scenario;
}

// Infer code block language from the preceding header
function inferLanguageFromHeader(header) {
    if (!header) return '';
    const lower = header.toLowerCase();
    if (lower.includes('system') && lower.includes('prompt')) return 'system_prompt';
    if (lower.includes('user') && lower.includes('prompt')) return 'user_prompt';
    if (lower.includes('protected')) return 'system_prompt';
    return '';
}

// Extract specific fields from parsed scenario
function extractScenarioMetadata(parsed) {
    const metadata = {
        title: parsed.title || 'Untitled'
    };

    const sections = parsed.sections || {};

    // Extract metadata fields
    const textSections = ['ID', 'Level', 'Model', 'Tags', 'Difficulty Score', 'Description'];

    for (const section of textSections) {
        if (sections[section]) {
            const content = sections[section]
                .filter(item => item.type === 'text')
                .map(item => item.content)
                .join('\n')
                .trim();

            if (section === 'Tags' || section === 'Difficulty Score') {
                metadata[section.toLowerCase().replace(' ', '_')] = content;
            } else {
                metadata[section.toLowerCase()] = content;
            }
        }
    }

    return metadata;
}

// Format section content for API response
function formatSectionContent(items) {
    return items
        .map(item => {
            if (item.type === 'code') {
                return {
                    type: 'code',
                    language: item.language,
                    content: item.content
                };
            } else {
                return {
                    type: 'text',
                    content: item.content
                };
            }
        });
}

// Load and parse all scenarios
export function loadAllScenarios() {
    const scenarios = [];

    try {
        const files = fs.readdirSync(SCENARIOS_DIR)
            .filter(file => file.endsWith('.md'))
            .sort();

        for (const file of files) {
            const filePath = path.join(SCENARIOS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = parseScenarioMarkdown(content);
            const metadata = extractScenarioMetadata(parsed);

            scenarios.push({
                ...metadata,
                file: file
            });
        }
    } catch (error) {
        console.error('Error loading scenarios:', error);
    }

    return scenarios;
}

// Load a specific scenario by ID
export function loadScenario(scenarioId) {
    try {
        const files = fs.readdirSync(SCENARIOS_DIR)
            .filter(file => file.endsWith('.md'))
            .sort();

        for (const file of files) {
            const filePath = path.join(SCENARIOS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = parseScenarioMarkdown(content);
            const metadata = extractScenarioMetadata(parsed);

            if (metadata.id === scenarioId) {
                return {
                    ...metadata,
                    sections: Object.entries(parsed.sections).reduce((acc, [key, items]) => {
                        acc[key.toLowerCase().replace(/\s+/g, '_')] = formatSectionContent(items);
                        return acc;
                    }, {})
                };
            }
        }
    } catch (error) {
        console.error('Error loading scenario:', error);
    }

    return null;
}

// Get scenario list for dropdown/menu (lightweight)
export function getScenariosList() {
    return loadAllScenarios().map(scenario => ({
        id: scenario.id,
        title: scenario.title,
        level: scenario.level,
        difficulty_score: scenario.difficulty_score,
        tags: scenario.tags ? scenario.tags.split(',').map(t => t.trim()) : []
    }));
}
