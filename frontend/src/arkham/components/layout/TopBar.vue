<template>
  <div class="ah-topbar">
    <div class="ah-topbar__left">
      <slot name="brand">
        <div class="ah-topbar__title">
          <span v-if="campaignName" class="ah-topbar__campaign">{{ campaignName }}</span>
          <span v-if="scenarioTitle" class="ah-topbar__scenario">{{ scenarioTitle }}</span>
          <span v-if="scenarioSubtitle" class="ah-topbar__subtitle">{{ scenarioSubtitle }}</span>
        </div>
      </slot>
    </div>

    <div class="ah-topbar__center">
      <slot name="center">
        <div v-if="phaseLabel" class="ah-topbar__phase">
          <span class="ah-topbar__phase-dot" :data-phase="phase" />
          <span class="ah-topbar__phase-label">{{ phaseLabel }}</span>
        </div>
      </slot>
    </div>

    <div class="ah-topbar__right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Game } from '@/arkham/types/Game'
import type { Phase } from '@/arkham/types/Phase'

const props = defineProps<{ game: Game | null }>()

const scenario = computed(() => props.game?.scenario ?? null)
const campaign = computed(() => props.game?.campaign ?? null)

const campaignName = computed(() => campaign.value?.name ?? null)
const scenarioTitle = computed(() => scenario.value?.name.title ?? null)
const scenarioSubtitle = computed(() => scenario.value?.name.subtitle ?? null)
const phase = computed<Phase | null>(() => props.game?.phase ?? null)

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'MythosPhase':        return 'Mythos'
    case 'InvestigationPhase': return 'Investigation'
    case 'EnemyPhase':         return 'Enemy'
    case 'UpkeepPhase':        return 'Upkeep'
    case 'CampaignPhase':      return 'Campaign'
    default:                   return null
  }
})
</script>

<style lang="scss" scoped>
.ah-topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--ah-space-3);
  padding: var(--ah-space-2) var(--ah-space-4);
  min-height: 56px;
  font-family: var(--ah-font-display);
  color: var(--ah-ink);
  position: relative;
}

/* Inset gold hairlines top + bottom for the parchment-banner feel */
.ah-topbar::before,
.ah-topbar::after {
  content: "";
  position: absolute;
  left: var(--ah-space-3);
  right: var(--ah-space-3);
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--ah-gold-dim) 20%,
    var(--ah-gold) 50%,
    var(--ah-gold-dim) 80%,
    transparent 100%);
  opacity: 0.45;
}
.ah-topbar::before { top: 2px; }
.ah-topbar::after  { bottom: 2px; }

.ah-topbar__left   { justify-self: start;  min-width: 0; }
.ah-topbar__center { justify-self: center; min-width: 0; }
.ah-topbar__right  { justify-self: end;    min-width: 0; display: flex; align-items: center; gap: var(--ah-space-2); }

.ah-topbar__title {
  display: flex;
  align-items: baseline;
  gap: var(--ah-space-2);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.ah-topbar__campaign {
  color: var(--ah-ink-dim);
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::after {
    content: "·";
    margin-left: var(--ah-space-2);
    color: var(--ah-gold-dim);
  }
}

.ah-topbar__scenario {
  color: var(--ah-gold-bright);
  font-size: 1.1em;
  letter-spacing: 0.04em;
}

.ah-topbar__subtitle {
  color: var(--ah-ink-muted);
  font-size: 0.85em;
  font-style: italic;
}

.ah-topbar__phase {
  display: inline-flex;
  align-items: center;
  gap: var(--ah-space-2);
  padding: var(--ah-space-1) var(--ah-space-3);
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-sm);
  background: rgba(0, 0, 0, 0.25);
}

.ah-topbar__phase-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ah-gold-dim);
  box-shadow: 0 0 8px currentColor, inset 0 0 0 1px rgba(0, 0, 0, 0.4);
  outline: 1px solid var(--ah-border);
  outline-offset: 2px;

  &[data-phase="MythosPhase"]        { background: var(--ah-curse); color: var(--ah-curse); }
  &[data-phase="InvestigationPhase"] { background: var(--ah-clue); color: var(--ah-clue); }
  &[data-phase="EnemyPhase"]         { background: var(--ah-damage); color: var(--ah-damage); }
  &[data-phase="UpkeepPhase"]        { background: var(--ah-success); color: var(--ah-success); }
  &[data-phase="CampaignPhase"]      { background: var(--ah-resource); color: var(--ah-resource); }
}

.ah-topbar__phase-label {
  font-size: 0.85em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ah-ink-dim);
}
</style>
