<script lang="ts" setup>
import { computed } from 'vue'
import type { Game } from '@/arkham/types/Game'
import { useGameSelectionStore } from '@/stores/game_selection'
import { useCardStore } from '@/stores/cards'
import ActionList from '@/arkham/components/panels/ActionList.vue'
import TokenStrip, {
  type TokenStripItem,
} from '@/arkham/components/tokens/TokenStrip.vue'

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

const tokens = computed<TokenStripItem[]>(() => {
  if (location.value) {
    const loc = location.value
    return [
      { kind: 'shroud', amount: loc.shroud ?? 0, show: loc.shroud !== null, label: 'Shroud' },
      { kind: 'clue', amount: loc.tokens.Clue ?? 0, label: 'Clues' },
      { kind: 'doom', amount: loc.tokens.Doom ?? 0, label: 'Doom' },
    ]
  }
  if (enemy.value) {
    const e = enemy.value
    const items: TokenStripItem[] = []
    if (enemyFight.value !== null) items.push({ kind: 'fight', amount: enemyFight.value, label: 'Fight' })
    if (enemyHealth.value !== null) {
      const remaining = enemyHealth.value - e.assignedDamage
      items.push({ kind: 'health', amount: `${remaining}/${enemyHealth.value}`, label: 'Health' })
    }
    if (enemyEvade.value !== null) items.push({ kind: 'evade', amount: enemyEvade.value, label: 'Evade' })
    if ((e.tokens.Doom ?? 0) > 0) items.push({ kind: 'doom', amount: e.tokens.Doom!, label: 'Doom' })
    if ((e.tokens.Clue ?? 0) > 0) items.push({ kind: 'clue', amount: e.tokens.Clue!, label: 'Clues' })
    return items
  }
  if (asset.value) {
    const a = asset.value
    const items: TokenStripItem[] = []
    if (a.health !== null) items.push({ kind: 'health', amount: a.health, label: 'Health' })
    if (a.sanity !== null) items.push({ kind: 'horror', amount: a.sanity, label: 'Sanity' })
    if ((a.tokens.Resource ?? 0) > 0) items.push({ kind: 'resource', amount: a.tokens.Resource!, label: 'Resources' })
    if ((a.tokens.Charge ?? 0) > 0) items.push({ kind: 'resource', amount: a.tokens.Charge!, label: 'Charges' })
    if ((a.tokens.Damage ?? 0) > 0) items.push({ kind: 'damage', amount: a.tokens.Damage!, label: 'Damage' })
    if ((a.tokens.Horror ?? 0) > 0) items.push({ kind: 'horror', amount: a.tokens.Horror!, label: 'Horror' })
    return items
  }
  return []
})

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

    <TokenStrip :items="tokens" />

    <p v-if="(enemy && enemy.exhausted) || (asset && asset.exhausted)" class="ah-detail__flag">
      Exhausted
    </p>

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

.ah-detail__flag {
  margin: 0;
  font-size: 0.75em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ah-ink-muted);
  font-style: italic;
}
</style>
