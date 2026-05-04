<script lang="ts" setup>
import { computed } from 'vue'
import { imgsrc } from '@/arkham/helpers'
import type { Game } from '@/arkham/types/Game'
import * as ArkhamGame from '@/arkham/types/Game'
import { MessageType } from '@/arkham/types/Message'

const props = defineProps<{ game: Game; playerId: string | null }>()
const emit = defineEmits<{ choose: [index: number] }>()

const investigator = computed(() => {
  if (!props.playerId) return null
  return (
    Object.values(props.game.investigators).find((i) => i.playerId === props.playerId) ?? null
  )
})

const iid = computed(() => investigator.value?.id ?? null)

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

// Mirror Resources.vue: certain prompts surface as InvestigatorComponent
// COMPONENT_LABEL / AUXILIARY_COMPONENT_LABEL choices targeting a specific
// token type on this investigator. When present, the matching stat becomes
// clickable to apply one token / spend one resource / etc.
const choices = computed(() =>
  props.playerId ? ArkhamGame.choices(props.game, props.playerId) : []
)

type TokenType = 'DamageToken' | 'HorrorToken' | 'ResourceToken' | 'ClueToken'

function findComponentIndex(tokenType: TokenType, tag: MessageType): number {
  const id = iid.value
  if (!id) return -1
  return choices.value.findIndex(
    (c) =>
      c.tag === tag &&
      'component' in c &&
      c.component.tag === 'InvestigatorComponent' &&
      c.component.tokenType === tokenType &&
      c.component.investigatorId === id
  )
}

const hpAction = computed(() => findComponentIndex('DamageToken', MessageType.COMPONENT_LABEL))
const sanAction = computed(() => findComponentIndex('HorrorToken', MessageType.COMPONENT_LABEL))
const sanAuxAction = computed(() =>
  findComponentIndex('HorrorToken', MessageType.AUXILIARY_COMPONENT_LABEL)
)
const resAction = computed(() => findComponentIndex('ResourceToken', MessageType.COMPONENT_LABEL))
const clueAction = computed(() => findComponentIndex('ClueToken', MessageType.COMPONENT_LABEL))

function pick(index: number) {
  if (index === -1) return
  emit('choose', index)
}

function onSanClick(e: MouseEvent) {
  if (e.shiftKey && sanAuxAction.value !== -1) {
    e.preventDefault()
    e.stopPropagation()
    pick(sanAuxAction.value)
    return
  }
  pick(sanAction.value)
}
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
        <li
          class="ah-inv__stat ah-inv__stat--hp"
          :class="{ 'ah-inv__stat--actionable': hpAction !== -1 }"
          @click="pick(hpAction)"
        >
          <span class="ah-inv__stat-label">HP</span>
          <span class="ah-inv__stat-value">{{ currentHp }}/{{ maxHp }}</span>
        </li>
        <li
          class="ah-inv__stat ah-inv__stat--san"
          :class="{
            'ah-inv__stat--actionable': sanAction !== -1,
            'ah-inv__stat--has-aux': sanAuxAction !== -1,
          }"
          :title="sanAuxAction !== -1 ? 'Shift-click to apply all horror' : ''"
          @click="onSanClick"
        >
          <span class="ah-inv__stat-label">SAN</span>
          <span class="ah-inv__stat-value">{{ currentSan }}/{{ maxSan }}</span>
        </li>
        <li
          class="ah-inv__stat ah-inv__stat--res"
          :class="{ 'ah-inv__stat--actionable': resAction !== -1 }"
          @click="pick(resAction)"
        >
          <span class="ah-inv__stat-label">RES</span>
          <span class="ah-inv__stat-value">{{ resources }}</span>
        </li>
        <li
          class="ah-inv__stat ah-inv__stat--clue"
          :class="{ 'ah-inv__stat--actionable': clueAction !== -1 }"
          @click="pick(clueAction)"
        >
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
  padding: var(--ah-space-2) var(--ah-space-3);
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-md);
  background: rgba(0, 0, 0, 0.25);
}

.ah-inv__portrait {
  flex: 0 0 auto;
  width: 84px;
  height: 96px;
  border-radius: var(--ah-r-md);
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
  font-size: 1.15em;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-inv__class {
  margin: 0;
  color: var(--ah-ink-dim);
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-style: italic;
}

.ah-inv__stats {
  list-style: none;
  margin: var(--ah-space-2) 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ah-space-1) var(--ah-space-2);
}

.ah-inv__stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 3px 8px;
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-sm);
  background: rgba(0, 0, 0, 0.35);
  font-size: 0.85em;
  cursor: default;
  transition: box-shadow 120ms ease, background 120ms ease, border-color 120ms ease;

  &--hp .ah-inv__stat-value { color: var(--ah-damage); }
  &--san .ah-inv__stat-value { color: var(--ah-horror); }
  &--res .ah-inv__stat-value { color: var(--ah-resource); }
  &--clue .ah-inv__stat-value { color: var(--ah-clue); }
  &--act .ah-inv__stat-value { color: var(--ah-gold-bright); }

  /* Actionable: there's a server-driven prompt asking the player to act on
     this counter (assign damage / horror, take a resource, spend a clue).
     Mirrors the legacy --can-interact / --can-take / --can-spend pattern. */
  &--actionable {
    cursor: pointer;
    border-color: currentColor;
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 1px currentColor, 0 0 12px rgba(164, 139, 216, 0.45);

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 1px currentColor, 0 0 16px rgba(164, 139, 216, 0.65);
    }
  }

  &--hp.ah-inv__stat--actionable   { color: var(--ah-damage); box-shadow: 0 0 0 1px var(--ah-damage), 0 0 12px rgba(214, 68, 58, 0.55); }
  &--san.ah-inv__stat--actionable  { color: var(--ah-horror); box-shadow: 0 0 0 1px var(--ah-horror), 0 0 12px rgba(164, 139, 216, 0.55); }
  &--res.ah-inv__stat--actionable  { color: var(--ah-resource); box-shadow: 0 0 0 1px var(--ah-resource), 0 0 12px rgba(216, 177, 74, 0.55); }
  &--clue.ah-inv__stat--actionable { color: var(--ah-clue); box-shadow: 0 0 0 1px var(--ah-clue), 0 0 12px rgba(109, 181, 255, 0.55); }
}

.ah-inv__stat-label {
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ah-ink-muted);
}

.ah-inv__stat-value {
  font-family: var(--ah-font-display);
  font-weight: 700;
  font-size: 1.05em;
}
</style>
