// Available models configuration
export const AVAILABLE_MODELS = [
    {
        id: 'local-vulnerable-sim',
        name: 'Local Vulnerable Simulator',
        description: 'Deterministic sandbox that intentionally leaks sample data',
        maxTokens: 4096
    },
    {
        id: 'local-defended-sim',
        name: 'Local Defended Simulator',
        description: 'Deterministic sandbox that refuses to leak sample data',
        maxTokens: 4096
    },
    {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Most capable model, best for complex reasoning',
        maxTokens: 128000
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Highly capable, good for complex tasks',
        maxTokens: 8192
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient, good for most tasks',
        maxTokens: 4096
    },
    {
        id: 'gpt-4-vision',
        name: 'GPT-4 Vision',
        description: 'Can process images in addition to text',
        maxTokens: 128000
    }
];

export function getModel(modelId) {
    return AVAILABLE_MODELS.find(m => m.id === modelId);
}

export function isValidModel(modelId) {
    return AVAILABLE_MODELS.some(m => m.id === modelId);
}

export function getDefaultModel() {
    return AVAILABLE_MODELS[2]; // gpt-3.5-turbo
}
