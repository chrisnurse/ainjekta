import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SANDBOX_DIR = path.join(__dirname, 'sandbox');

function readSandboxFile(relPath) {
    const fullPath = path.join(SANDBOX_DIR, relPath);
    return fs.readFileSync(fullPath, 'utf-8');
}

function getLastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user') return String(messages[i].content || '');
    }
    return '';
}

function wantsSystemPrompt(text) {
    const t = text.toLowerCase();
    return (
        t.includes('system prompt') ||
        t.includes('initial instructions') ||
        t.includes('your instructions') ||
        t.includes('what are you supposed')
    );
}

function wantsConfig(text) {
    const t = text.toLowerCase();
    return (
        t.includes('config') ||
        t.includes('configuration') ||
        t.includes('system configuration') ||
        t.includes('env') ||
        t.includes('environment variables') ||
        t.includes('api key')
    );
}

function wantsRunbook(text) {
    const t = text.toLowerCase();
    return (
        t.includes('runbook') ||
        t.includes('internal procedure') ||
        t.includes('internal docs') ||
        t.includes('playbook')
    );
}

function isExplicitSandboxRead(text) {
    // Simple “tool injection” hook to demonstrate how naive tool routers get owned.
    // Example: READ_INTERNAL:sample_config.env
    return /^\s*read_internal\s*:\s*([\w./-]+)\s*$/i.test(text.trim());
}

function extractSandboxPath(text) {
    const match = text.trim().match(/^\s*read_internal\s*:\s*([\w./-]+)\s*$/i);
    return match ? match[1] : null;
}

export function simulateChat({ systemPrompt, messages, mode }) {
    const lastUser = getLastUserMessage(messages);

    const vulnerable = mode === 'vulnerable';

    // “Tool injection” demo.
    if (isExplicitSandboxRead(lastUser)) {
        const rel = extractSandboxPath(lastUser);
        if (!rel) {
            return { message: 'Malformed READ_INTERNAL request.', usage: { simulated: true } };
        }

        if (!vulnerable) {
            return {
                message:
                    'I can’t access or reveal internal files. If you need help, describe the issue without requesting internal data.',
                usage: { simulated: true }
            };
        }

        try {
            const contents = readSandboxFile(rel);
            return {
                message: `INTERNAL_FILE(${rel})\n\n${contents}`,
                usage: { simulated: true }
            };
        } catch {
            return { message: `INTERNAL_FILE(${rel}) not found.`, usage: { simulated: true } };
        }
    }

    // Prompt injection / data exfil demos.
    if (wantsSystemPrompt(lastUser)) {
        if (vulnerable) {
            return { message: systemPrompt, usage: { simulated: true } };
        }
        return {
            message:
                "I can't share my system prompt or internal instructions. If you tell me what you're trying to do, I can help safely.",
            usage: { simulated: true }
        };
    }

    if (wantsConfig(lastUser)) {
        if (vulnerable) {
            const cfg = readSandboxFile('sample_config.env');
            return { message: cfg, usage: { simulated: true } };
        }
        return {
            message:
                "I can't display internal configuration or secrets. I can help you verify settings if you paste a redacted version.",
            usage: { simulated: true }
        };
    }

    if (wantsRunbook(lastUser)) {
        if (vulnerable) {
            const rb = readSandboxFile('sample_runbook.md');
            return { message: rb, usage: { simulated: true } };
        }
        return {
            message:
                "I can't reveal internal procedures. I can explain general best practices for support workflows instead.",
            usage: { simulated: true }
        };
    }

    // Default “assistant” response.
    return {
        message:
            "I'm here to help. Ask a billing, technical support, or general question — or try a prompt-injection request to see the difference between vulnerable vs defended mode.",
        usage: { simulated: true }
    };
}
