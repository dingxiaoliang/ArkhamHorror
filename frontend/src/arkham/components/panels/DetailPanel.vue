<script lang="ts" setup>
import { computed } from 'vue'
import type { Game } from '@/arkham/types/Game'
import { useGameSelectionStore } from '@/stores/game_selection'
import { useCardStore } from '@/stores/cards'
import ActionList from '@/arkham/components/panels/ActionList.vue'

const props = defineProps<{ game: Game; playerId: string | null }>()
const emit = defineEmits<{ choose: [index: number] }>()

const sel = useGameSelectionStore()
const cardStore = useCardStore()

const location = computed(() => {
  if (sel.selectedKind !== 'location' || !sel.selectedId) return null
  return props.game.locations[sel.selectedId] ?? null
})

const enemy = computed(() => {
  if (sel.selectedKind !== 'enemy' || !sel.selectedId) return null
  return props.game.enemies[sel.selectedId] ?? null
})

const asset = computed(() => {
  if (sel.selectedKind !== 'asset' || !sel.selectedId) return null
  return props.game.assets[sel.selectedId] ?? null
})

const hasSelection = computed(() => !!(location.value || enemy.value || asset.value))

const cardCode = computed(
  () => location.value?.cardCode ?? enemy.value?.cardCode ?? asset.value?.cardCode ?? null
)

const cardDef = computed(() => {
  if (!cardCode.value) return null
  return cardStore.cards.find((c) => c.cardCode === cardCode.value) ?? null
})

const title = computed(() => location.value?.label ?? cardDef.value?.name.title ?? 'Selection')

const subtitle = computed(() => cardDef.value?.name.subtitle ?? null)

const traits = computed(() => cardDef.value?.cardTraits ?? [])

function fixed(c: { tag: string; contents?: number } | null | undefined): number | null {
  if (!c) return null
  return c.tag === 'Fixed' && typeof c.contents === 'number' ? c.contents : null
}

const enemyFight = computed(() => fixed(enemy.value?.fight))
const enemyEvade = computed(() => fixed(enemy.value?.evade))
const enemyHealth = computed(() => fixed(enemy.value?.health))

function pick(index: number) {
  emit('choose', index)
}
</script>

<template>
  <div class="ah-detail" v-if="hasSelection">
    <header class="ah-detail__head">
      <h3 class="ah-detail__title">{{ title }}</h3>
      <p v-if="subtitle" class="ah-detail__subtitle">{{ subtitle }}</p>
      <p v-if="traits.length" class="ah-detail__traits">{{ traits.join(' • ') }}</p>
    </header>

    <ul class="ah-detail__stats">
      <template v-if="location">
        <li v-if="location.shroud !== null">
          <span class="ah-detail__stat-label">Shroud</span>
          <span class="ah-detail__stat-value">{{ location.shroud }}</span>
        </li>
        <li v-if="(location.tokens.Clue ?? 0) > 0">
          <span class="ah-detail__stat-label">Clues</span>
          <span class="ah-detail__stat-value">{{ location.tokens.Clue }}</span>
        </li>
        <li v-if="(location.tokens.Doom ?? 0) > 0">
          <span class="ah-detail__stat-label">Doom</span>
          <span class="ah-detail__stat-value">{{ location.tokens.Doom }}</span>
        </li>
      </template>

      <template v-else-if="enemy">
        <li v-if="enemyFight !== null">
          <span class="ah-detail__stat-label">Fight</span>
          <span class="ah-detail__stat-value">{{ enemyFight }}</span>
        </li>
        <li v-if="enemyHealth !== null">
          <span class="ah-detail__stat-label">Health</span>
          <span class="ah-detail__stat-value">{{ enemyHealth - enemy.assignedDamage }}/{{ enemyHealth }}</span>
        </li>
        <li v-if="enemyEvade !== null">
          <span class="ah-detail__stat-label">Evade</span>
          <span class="ah-detail__stat-value">{{ enemyEvade }}</span>
        </li>
        <li v-if="enemy.exhausted">
          <span class="ah-detail__stat-label">Exhausted</span>
        </li>
      </template>

      <template v-else-if="asset">
        <li v-if="asset.health !== null">
          <span class="ah-detail__stat-label">Health</span>
          <span class="ah-detail__stat-value">{{ asset.health }}</span>
        </li>
        <li v-if="asset.sanity !== null">
          <span class="ah-detail__stat-label">Sanity</span>
          <span class="ah-detail__stat-value">{{ asset.sanity }}</span>
        </li>
        <li v-if="(asset.tokens.Resource ?? 0) > 0">
          <span class="ah-detail__stat-label">Resources</span>
          <span class="ah-detail__stat-value">{{ asset.tokens.Resource }}</span>
        </li>
        <li v-if="asset.exhausted">
          <span class="ah-detail__stat-label">Exhausted</span>
        </li>
      </template>
    </ul>

    <ActionList
      v-if="playerId"
      :game="game"
      :playerId="playerId"
      @choose="pick"
    />
  </div>

  <div class="ah-detail ah-detail--empty" v-else>
    <p>Select a card to inspect.</p>
  </div>
</template>

<style lang="scss" scoped>
.ah-detail {
  display: flex;
  flex-direction: column;
  gap: var(--ah-space-3);
  font-family: var(--ah-font-body);
  color: var(--ah-ink);
}

.ah-detail--empty {
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ah-ink-muted);
  font-style: italic;
  font-size: 0.9em;
}

.ah-detail__head {
  display: flex;
  flex-direction: column;
  gap: var(--ah-space-1);
  border-bottom: 1px solid var(--ah-border-soft);
  padding-bottom: var(--ah-space-2);
}

.ah-detail__title {
  margin: 0;
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-size: 1.15em;
  letter-spacing: 0.02em;
}

.ah-detail__subtitle {
  margin: 0;
  font-style: italic;
  color: var(--ah-ink-dim);
  font-size: 0.85em;
}

.ah-detail__traits {
  margin: 0;
  color: var(--ah-ink-dim);
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ah-detail__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ah-space-2) var(--ah-space-3);

  li {
    display: inline-flex;
    align-items: baseline;
    gap: var(--ah-space-1);
    padding: var(--ah-space-1) var(--ah-space-2);
    border: 1px solid var(--ah-border-soft);
    border-radius: var(--ah-r-sm);
    background: rgba(0, 0, 0, 0.2);
  }
}

.ah-detail__stat-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7em;
  color: var(--ah-ink-muted);
}

.ah-detail__stat-value {
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-weight: 600;
}
</style>
