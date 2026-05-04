<script lang="ts" setup>
import { computed } from 'vue'
import * as ArkhamGame from '@/arkham/types/Game'
import type { Game } from '@/arkham/types/Game'
import { MessageType } from '@/arkham/types/Message'

const props = defineProps<{ game: Game; playerId: string | null }>()
const emit = defineEmits<{ choose: [index: number] }>()

const investigator = computed(() => {
  if (!props.playerId) return null
  return (
    Object.values(props.game.investigators).find((i) => i.playerId === props.playerId) ?? null
  )
})

const remainingActions = computed(() => investigator.value?.remainingActions ?? null)

const choices = computed(() =>
  props.playerId ? ArkhamGame.choices(props.game, props.playerId) : []
)

const endTurnIndex = computed(() => {
  const invId = investigator.value?.id
  if (!invId) return -1
  return choices.value.findIndex(
    (c) => c.tag === MessageType.END_TURN_BUTTON && c.investigatorId === invId
  )
})

const canEndTurn = computed(() => endTurnIndex.value !== -1)

function endTurn() {
  if (endTurnIndex.value !== -1) emit('choose', endTurnIndex.value)
}
</script>

<template>
  <div class="ah-turn">
    <button
      class="ah-turn__end"
      :disabled="!canEndTurn"
      @click="endTurn"
    >
      End Turn
    </button>
    <p v-if="remainingActions !== null" class="ah-turn__actions">
      <span class="ah-turn__actions-num">{{ remainingActions }}</span>
      <span class="ah-turn__actions-label">actions left</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.ah-turn {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ah-space-2);
  padding: var(--ah-space-2) var(--ah-space-3);
  min-width: 220px;
}

.ah-turn__end {
  font-family: var(--ah-font-display);
  font-size: 1.3em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: var(--ah-space-3) var(--ah-space-5);
  color: var(--ah-bg-stage);
  background: linear-gradient(180deg, var(--ah-gold-bright) 0%, var(--ah-gold) 60%, var(--ah-gold-dim) 100%);
  border: 2px solid var(--ah-border-strong);
  border-radius: var(--ah-r-md);
  box-shadow: var(--ah-shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: filter 120ms ease, transform 80ms ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    filter: brightness(0.95);
  }

  &:disabled {
    cursor: not-allowed;
    background: linear-gradient(180deg, #4a3a26 0%, #3a2d1e 100%);
    color: var(--ah-ink-muted);
    border-color: var(--ah-border-soft);
    box-shadow: none;
  }
}

.ah-turn__actions {
  margin: 0;
  text-align: center;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--ah-space-2);
  color: var(--ah-ink-dim);
}

.ah-turn__actions-num {
  font-family: var(--ah-font-display);
  font-size: 1.4em;
  color: var(--ah-gold-bright);
  font-weight: 600;
}

.ah-turn__actions-label {
  font-size: 0.78em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ah-ink-muted);
}
</style>
