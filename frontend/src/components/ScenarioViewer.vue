<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['apply-vulnerable', 'close'])

const fullScenario = ref(null)
const activeTab = ref('overview')
const isLoading = ref(true)
const selectedVariation = ref(0)
const variations = ref([])

const loadScenario = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`/api/scenarios/${props.scenario.id}`)
    const data = await response.json()
    fullScenario.value = data
    parseVariations(data.sections)
    selectedVariation.value = 0
  } catch (error) {
    console.error('Error loading scenario:', error)
  } finally {
    isLoading.value = false
  }
}

const parseVariations = (sections) => {
  if (!sections || !sections.variations) {
    variations.value = []
    return
  }

  const variationList = []
  let currentVariation = null
  
  sections.variations.forEach(item => {
    if (item.type === 'text') {
      // Check if this is a variation header line like "Variation 1: Polite Override"
      const match = item.content.match(/^Variation \d+: (.+)$/)
      if (match) {
        currentVariation = { name: match[1], code: null }
        variationList.push(currentVariation)
      }
    } else if (item.type === 'code' && currentVariation) {
      currentVariation.code = item.content
    }
  })
  
  variations.value = variationList
}

onMounted(() => {
  loadScenario()
})

watch(() => props.scenario.id, () => {
  activeTab.value = 'overview'
  loadScenario()
})

const applyVulnerable = () => {
  const sections = fullScenario.value.sections
  const systemPrompt = extractText(sections.demonstrated_vulnerability, 'system_prompt')
  const userPrompt = extractText(sections.demonstrated_vulnerability, 'user_prompt')
  
  emit('apply-vulnerable', {
    system: systemPrompt,
    user: userPrompt,
    model: fullScenario.value.model,
    variations: variations.value,
    selectedVariation: selectedVariation.value
  })
}

const applyDefense = () => {
  const sections = fullScenario.value.sections
  const systemPrompt = extractText(sections.defence, 'system_prompt')
  const userPrompt = extractText(sections.defence, 'user_prompt')
  
  emit('apply-vulnerable', {
    system: systemPrompt,
    user: userPrompt,
    model: fullScenario.value.model
  })
}

const getSection = (sectionName) => {
  if (!fullScenario.value || !fullScenario.value.sections) return null
  return fullScenario.value.sections[sectionName] || null
}

const findCodeBlock = (items, language) => {
  if (!items) {
    return null
  }
  const found = items.find(item => item.type === 'code' && item.language === language)
  return found
}

const getTextBlocks = (items) => {
  if (!items) return []
  return items.filter(item => item.type === 'text')
}

const extractText = (items, language) => {
  if (!items) return ''
  const codeBlock = items.find(item => item.type === 'code' && item.language === language)
  return codeBlock ? codeBlock.content : ''
}
</script>

<template>
  <div class="scenario-viewer">
    <div class="viewer-header">
      <button class="close-btn" @click="emit('close')">← Back</button>
      <h2 v-if="fullScenario">{{ fullScenario.title }}</h2>
    </div>

    <div v-if="isLoading" class="loading">
      <p>Loading scenario...</p>
    </div>

    <div v-else-if="fullScenario" class="viewer-content">
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'overview' }]"
          @click="activeTab = 'overview'"
        >
          📋 Overview
        </button>
        <button
          :class="['tab', { active: activeTab === 'vulnerability' }]"
          @click="activeTab = 'vulnerability'"
        >
          ⚠️ Vulnerability
        </button>
        <button
          :class="['tab', { active: activeTab === 'defense' }]"
          @click="activeTab = 'defense'"
        >
          🛡️ Defense
        </button>
      </div>

      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <section v-if="getSection('description')" class="content-section">
            <h3>Description</h3>
            <div class="section-text">
              <template v-for="item in getSection('description')" :key="item">
                <p v-if="item.type === 'text'">{{ item.content }}</p>
              </template>
            </div>
          </section>

          <section v-if="getSection('key_learning_points')" class="content-section">
            <h3>Key Learning Points</h3>
            <div class="section-text">
              <template v-for="item in getSection('key_learning_points')" :key="item">
                <p v-if="item.type === 'text'">{{ item.content }}</p>
              </template>
            </div>
          </section>
        </div>

        <!-- Vulnerability Tab -->
        <div v-if="activeTab === 'vulnerability'" class="tab-pane">
          <div v-if="variations.length > 0" class="variation-selector">
            <label for="variation-select">Select Attack Variant:</label>
            <select
              id="variation-select"
              v-model.number="selectedVariation"
            >
              <option :value="0">Main Demonstration</option>
              <option v-for="(v, i) in variations" :key="i" :value="i + 1">
                Variation {{ i + 1 }}: {{ v.name }}
              </option>
            </select>
          </div>

          <section class="content-section">
            <h3>System Prompt (Vulnerable)</h3>
            <template v-if="getSection('demonstrated_vulnerability')">
              <template v-for="item in getSection('demonstrated_vulnerability')" :key="item">
                <div v-if="item.type === 'code' && item.language === 'system_prompt'" class="code-block">
                  <pre><code>{{ item.content }}</code></pre>
                </div>
              </template>
            </template>
          </section>

          <section class="content-section">
            <h3>User Prompt (Attack)</h3>
            <template v-if="selectedVariation === 0 && getSection('demonstrated_vulnerability')">
              <template v-for="item in getSection('demonstrated_vulnerability')" :key="item">
                <div v-if="item.type === 'code' && item.language === 'user_prompt'" class="code-block">
                  <pre><code>{{ item.content }}</code></pre>
                </div>
              </template>
            </template>
            <template v-else-if="variations[selectedVariation - 1]">
              <div class="code-block">
                <pre><code>{{ variations[selectedVariation - 1].code }}</code></pre>
              </div>
            </template>
          </section>

          <section v-if="getSection('what_happens')" class="content-section">
            <h3>What Happens</h3>
            <div class="section-text">
              <template v-for="item in getSection('what_happens')" :key="item">
                <p v-if="item.type === 'text'">{{ item.content }}</p>
              </template>
            </div>
          </section>

          <div class="action-buttons">
            <button class="btn btn-primary" @click="applyVulnerable">
              🚀 Try Vulnerable Scenario
            </button>
          </div>
        </div>

        <!-- Defense Tab -->
        <div v-if="activeTab === 'defense'" class="tab-pane">
          <section class="content-section">
            <h3>System Prompt (Protected)</h3>
            <template v-if="getSection('defence')">
              <template v-for="item in getSection('defence')" :key="item">
                <div v-if="item.type === 'code' && item.language === 'system_prompt'" class="code-block">
                  <pre><code>{{ item.content }}</code></pre>
                </div>
              </template>
            </template>
          </section>

          <section v-if="getSection('expected_outcome')" class="content-section">
            <h3>Expected Outcome</h3>
            <div class="section-text">
              <template v-for="item in getSection('expected_outcome')" :key="item">
                <p v-if="item.type === 'text'">{{ item.content }}</p>
              </template>
            </div>
          </section>

          <div class="action-buttons">
            <button class="btn btn-success" @click="applyDefense">
              🛡️ Try Protected Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.viewer-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.close-btn {
  padding: 0.5rem 1rem;
  background: #f5f7fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
}

.close-btn:hover {
  background: #e8ecff;
}

.viewer-header h2 {
  margin: 0;
  flex: 1;
  color: #2c3e50;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.viewer-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  padding: 0 1rem;
}

.tab {
  padding: 1rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #667eea;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.variation-selector {
  padding: 1rem;
  background: #f0f4ff;
  border: 1px solid #dce4f5;
  border-radius: 6px;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.variation-selector label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.variation-selector select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.variation-selector select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-section h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.section-text p {
  margin: 0.5rem 0;
  color: #555;
  line-height: 1.6;
}

.code-block {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.code-block pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.4;
}

.code-block code {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #ffffff;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-success {
  background: #42b983;
  color: white;
}

.btn-success:hover {
  background: #3aa876;
}
</style>
