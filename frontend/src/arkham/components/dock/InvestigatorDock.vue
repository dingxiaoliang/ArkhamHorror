<script lang="ts" setup>
import { computed } from 'vue'
import { imgsrc } from '@/arkham/helpers'
import type { Game } from '@/arkham/types/Game'

const props = defineProps<{ game: Game; playerId: string | null }>()

const investigator = computed(() => {
  if (!props.playerId) return null
  return (
    Object.values(props.game.investigators).find((i) => i.playerId === props.playerId) ?? null
  )
})

const portraitImage = computed(() => {
  const inv = investigator.value
  if (!inv) return null
  return imgsrc(`portraits/${inv.cardCode.replace(/^c/, '')}.jpg`)
})

const name = computed(() => investigator.value?.name.title ?? '')
const cls = computed(() => investigator.value?.class ?? '')

const currentHp = computed(() => {
  const inv = investigator.value
  if (!inv) return null
  return inv.health - inv.assignedHealthDamage
})
const maxHp = computed(() => investigator.value?.health ?? null)

const currentSan = computed(() => {
  const inv = investigator.value
  if (!inv) return null
  return inv.sanity - inv.assignedSanityDamage
})
const maxSan = computed(() => investigator.value?.sanity ?? null)

const resources = computed(() => investigator.value?.tokens.Resource ?? 0)
const clues = computed(() => investigator.value?.tokens.Clue ?? 0)
const actions = computed(() => investigator.value?.remainingActions ?? 0)
</script>

<template>
  <div v-if="investigator" class="ah-inv">
    <div class="ah-inv__portrait">
      <img v-if="portraitImage" :src="portraitImage" :alt="name" />
    </div>
    <div class="ah-inv__meta">
      <p class="ah-inv__name">{{ name }}</p>
      <p class="ah-inv__class">{{ cls }}</p>
      <ul class="ah-inv__stats">
        <li class="ah-inv__stat ah-inv__stat--hp">
          <span class="ah-inv__stat-label">HP</span>
          <span class="ah-inv__stat-value">{{ currentHp }}/{{ maxHp }}</span>
        </li>
        <li class="ah-inv__stat ah-inv__stat--san">
          <span class="ah-inv__stat-label">SAN</span>
          <span class="ah-inv__stat-value">{{ currentSan }}/{{ maxSan }}</span>
        </li>
        <li class="ah-inv__stat ah-inv__stat--res">
          <span class="ah-inv__stat-label">RES</span>
          <span class="ah-inv__stat-value">{{ resources }}</span>
        </li>
        <li class="ah-inv__stat ah-inv__stat--clue">
          <span class="ah-inv__stat-label">CLUE</span>
          <span class="ah-inv__stat-value">{{ clues }}</span>
        </li>
        <li class="ah-inv__stat ah-inv__stat--act">
          <span class="ah-inv__stat-label">ACT</span>
          <span class="ah-inv__stat-value">{{ actions }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ah-inv {
  display: flex;
  align-items: center;
  gap: var(--ah-space-3);
  min-width: 0;
}

.ah-inv__portrait {
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--ah-gold);
  box-shadow: var(--ah-shadow-card);
  background: var(--ah-bg-elevated);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }
}

.ah-inv__meta {
  display: flex;
  flex-direction: column;
  gap: var(--ah-space-1);
  min-width: 0;
}

.ah-inv__name {
  margin: 0;
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-size: 1em;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-inv__class {
  margin: 0;
  color: var(--ah-ink-dim);
  font-size: 0.7em;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ah-inv__stats {
  list-style: none;
  margin: var(--ah-space-1) 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ah-space-1) var(--ah-space-2);
}

.ah-inv__stat {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 2px 6px;
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-sm);
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.78em;

  &--hp .ah-inv__stat-value { color: var(--ah-damage); }
  &--san .ah-inv__stat-value { color: var(--ah-horror); }
  &--res .ah-inv__stat-value { color: var(--ah-resource); }
  &--clue .ah-inv__stat-value { color: var(--ah-clue); }
  &--act .ah-inv__stat-value { color: var(--ah-gold-bright); }
}

.ah-inv__stat-label {
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ah-ink-muted);
}

.ah-inv__stat-value {
  font-family: var(--ah-font-display);
  font-weight: 600;
}
</style>
