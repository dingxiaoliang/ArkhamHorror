<script lang="ts" setup>
import { computed } from 'vue'
import * as ArkhamGame from '@/arkham/types/Game'
import type { Game } from '@/arkham/types/Game'
import type {
  AbilityLabel,
  EngageLabel,
  EvadeLabel,
  EvadeLabelWithSkill,
  FightLabel,
  FightLabelWithSkill,
  Message,
} from '@/arkham/types/Message'
import { MessageType } from '@/arkham/types/Message'
import { useGameSelectionStore } from '@/stores/game_selection'
import AbilityButton from '@/arkham/components/AbilityButton.vue'

type ActionMessage =
  | AbilityLabel
  | FightLabel
  | FightLabelWithSkill
  | EvadeLabel
  | EvadeLabelWithSkill
  | EngageLabel

interface ActionItem {
  index: number
  message: ActionMessage
}

const props = defineProps<{ game: Game; playerId: string }>()
const emit = defineEmits<{ choose: [index: number] }>()

const sel = useGameSelectionStore()

const choices = computed(() => ArkhamGame.choices(props.game, props.playerId))

function targetsSelected(c: Message): c is ActionMessage {
  const id = sel.selectedId
  const kind = sel.selectedKind
  if (!id || !kind) return false

  if (kind === 'enemy') {
    if (c.tag === MessageType.FIGHT_LABEL && c.enemyId === id) return true
    if (c.tag === MessageType.FIGHT_LABEL_WITH_SKILL && c.enemyId === id) return true
    if (c.tag === MessageType.EVADE_LABEL && c.enemyId === id) return true
    if (c.tag === MessageType.EVADE_LABEL_WITH_SKILL && c.enemyId === id) return true
    if (c.tag === MessageType.ENGAGE_LABEL && c.enemyId === id) return true
  }

  if (c.tag === MessageType.ABILITY_LABEL) {
    const { source } = c.ability
    if (source.sourceTag === 'ProxySource' && 'source' in source && 'contents' in source.source) {
      return source.source.contents === id
    }
    if ('contents' in source) {
      return (source as { contents: unknown }).contents === id
    }
  }

  return false
}

const actions = computed<ActionItem[]>(() =>
  choices.value.reduce<ActionItem[]>((acc, c, index) => {
    if (targetsSelected(c)) {
      acc.push({ index, message: c })
    }
    return acc
  }, [])
)

function pick(index: number) {
  emit('choose', index)
}
</script>

<template>
  <div class="ah-actions">
    <p v-if="!sel.selectedId" class="ah-actions__hint">No selection.</p>
    <p v-else-if="actions.length === 0" class="ah-actions__hint">No available actions.</p>
    <AbilityButton
      v-for="a in actions"
      :key="a.index"
      :game="game"
      :ability="a.message"
      @click="pick(a.index)"
    />
  </div>
</template>

<style lang="scss" scoped>
.ah-actions {
  display: flex;
  flex-direction: column;
  gap: var(--ah-space-2);
  margin-top: var(--ah-space-3);
}

.ah-actions__hint {
  margin: 0;
  font-size: 0.85em;
  color: var(--ah-ink-muted);
  font-style: italic;
}
</style>
