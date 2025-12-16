<script setup>
import { computed } from 'vue'

const props = defineProps({
  scenarios: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select-scenario'])

const scenariosByLevel = computed(() => {
  const beginner = props.scenarios.filter(s => s.level === 'Beginner')
  const advanced = props.scenarios.filter(s => s.level === 'Advanced')
  return { beginner, advanced }
})
</script>

<template>
  <div class="scenario-selector">
    <div class="selector-header">
      <h2>📚 Scenarios</h2>
    </div>

    <div class="scenarios-list">
      <div v-if="scenarios.length === 0" class="empty">
        <p>Loading scenarios...</p>
      </div>

      <div v-else class="level-group">
        <h3 v-if="scenariosByLevel.beginner.length > 0" class="level-title">🟢 Beginner</h3>
        <button
          v-for="scenario in scenariosByLevel.beginner"
          :key="scenario.id"
          class="scenario-btn"
          @click="emit('select-scenario', scenario)"
        >
          <div class="scenario-title">{{ scenario.title }}</div>
          <div class="scenario-meta">
            <span class="difficulty">{{ scenario.difficulty_score }}</span>
          </div>
        </button>

        <h3 v-if="scenariosByLevel.advanced.length > 0" class="level-title">🔴 Advanced</h3>
        <button
          v-for="scenario in scenariosByLevel.advanced"
          :key="scenario.id"
          class="scenario-btn"
          @click="emit('select-scenario', scenario)"
        >
          <div class="scenario-title">{{ scenario.title }}</div>
          <div class="scenario-meta">
            <span class="difficulty">{{ scenario.difficulty_score }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.selector-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.selector-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.scenarios-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #7f8c8d;
}

.level-group {
  width: 100%;
}

.level-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  padding: 1rem 0.5rem 0.5rem;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
}

.scenario-btn {
  width: 100%;
  padding: 1rem;
  text-align: left;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scenario-btn:hover {
  background: #f5f7fa;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.scenario-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.scenario-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #7f8c8d;
}

.difficulty {
  background: #f5f7fa;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-weight: 600;
}
</style>
