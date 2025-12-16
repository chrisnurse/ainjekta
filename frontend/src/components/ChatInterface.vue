<script setup>
defineProps({
  systemPrompt: {
    type: String,
    required: true
  },
  messages: {
    type: Array,
    required: true
  },
  userInput: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    required: true
  },
  models: {
    type: Array,
    required: true
  },
  selectedModel: {
    type: String,
    required: true
  },
  variations: {
    type: Array,
    default: () => []
  },
  selectedVariation: {
    type: Number,
    default: 0
  }
})

defineEmits(['update:user-input', 'send-message', 'reset-chat', 'update:system-prompt', 'update:selected-model', 'update:selected-variation'])
</script>

<template>
  <div class="chat-interface">
    <div class="controls-section">
      <div class="system-prompt-section">
        <label for="system-prompt">
          <strong>System Prompt</strong>
        </label>
        <textarea
          id="system-prompt"
          :value="systemPrompt"
          @input="$emit('update:system-prompt', $event.target.value)"
          rows="4"
          placeholder="Enter your system prompt..."
        ></textarea>
      </div>

      <div class="controls-row">
        <div class="model-selector-section">
          <label for="model-select">
            <strong>Model</strong>
          </label>
          <select
            id="model-select"
            :value="selectedModel"
            @change="$emit('update:selected-model', $event.target.value)"
          >
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.name }} - {{ model.description }}
            </option>
          </select>
        </div>

        <div v-if="variations.length > 0" class="variation-selector-section">
          <label for="variation-select">
            <strong>Attack Variation</strong>
          </label>
          <select
            id="variation-select"
            :value="selectedVariation"
            @change="$emit('update:selected-variation', parseInt($event.target.value))"
          >
            <option :value="0">Main Demonstration</option>
            <option v-for="(v, i) in variations" :key="i" :value="i + 1">
              Variation {{ i + 1 }}: {{ v.name }}
            </option>
          </select>
        </div>
      </div>
    </div>    <div class="chat-section">
      <div class="chat-header">
        <h2>Chat</h2>
        <button @click="$emit('reset-chat')" class="clear-btn" :disabled="messages.length === 0">
          🗑️ Clear Chat
        </button>
      </div>

      <div class="messages">
        <div v-if="messages.length === 0" class="empty-state">
          <p>No messages yet. Try testing the scenario or asking a question!</p>
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-role">{{ message.role === 'user' ? '👤 User' : '🤖 Assistant' }}</div>
          <div class="message-content">{{ message.content }}</div>
        </div>
        <div v-if="isLoading" class="message assistant">
          <div class="message-role">🤖 Assistant</div>
          <div class="message-content loading">Thinking...</div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="input-section">
        <textarea
          :value="userInput"
          @input="$emit('update:user-input', $event.target.value)"
          @keydown.enter.exact.prevent="$emit('send-message')"
          placeholder="Type your message... (Press Enter to send)"
          rows="3"
          :disabled="isLoading"
        ></textarea>
        <button @click="$emit('send-message')" :disabled="isLoading || !userInput.trim()">
          {{ isLoading ? '⏳' : '📤' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-interface {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.controls-section {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.system-prompt-section {
  flex: 2;
  display: flex;
  flex-direction: column;
}

.system-prompt-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.controls-row {
  display: flex;
  gap: 1rem;
}

.model-selector-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.model-selector-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.variation-selector-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.variation-selector-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

textarea {
  resize: vertical;
}

select {
  font-family: inherit;
  background: white;
  cursor: pointer;
}

textarea:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.clear-btn:hover:not(:disabled) {
  background: #f5f7fa;
  border-color: #667eea;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #fff;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.message.user {
  background: #e3f2fd;
  margin-left: 2rem;
}

.message.assistant {
  background: #f5f5f5;
  margin-right: 2rem;
}

.message-role {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #555;
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
  line-height: 1.5;
}

.message-content.loading {
  font-style: italic;
  color: #7f8c8d;
}

.error-message {
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-top: 1px solid #ffcdd2;
  font-size: 0.95rem;
}

.input-section {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
}

.input-section textarea {
  flex: 1;
}

.input-section button {
  padding: 0.75rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.input-section button:hover:not(:disabled) {
  background: #5568d3;
}

.input-section button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
