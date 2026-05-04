<script lang="ts">
export type TokenStripKind =
  | 'clue'
  | 'doom'
  | 'damage'
  | 'horror'
  | 'resource'
  | 'threat'
  | 'shroud'
  | 'fight'
  | 'health'
  | 'evade'

export interface TokenStripItem {
  kind: TokenStripKind
  amount: number | string
  /** When false the item is omitted from rendering (used for zero-value tokens). */
  show?: boolean
  label?: string
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    items: TokenStripItem[]
    size?: 'sm' | 'md'
    align?: 'start' | 'center' | 'end'
  }>(),
  { size: 'md', align: 'start' }
)

const visibleItems = computed(() =>
  props.items.filter((i) => (i.show ?? true) && i.amount !== 0 && i.amount !== '')
)
</script>

<template>
  <ul
    v-if="visibleItems.length > 0"
    class="ah-token-strip"
    :class="[`ah-token-strip--${size}`, `ah-token-strip--align-${align}`]"
  >
    <li
      v-for="(item, idx) in visibleItems"
      :key="`${item.kind}-${idx}`"
      class="ah-token-strip__item"
      :class="`ah-token-strip__item--${item.kind}`"
      :title="item.label ?? item.kind"
    >
      <span class="ah-token-strip__icon" :data-kind="item.kind" />
      <span class="ah-token-strip__count">{{ item.amount }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.ah-token-strip {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ah-space-1);

  &--align-start  { justify-content: flex-start; }
  &--align-center { justify-content: center; }
  &--align-end    { justify-content: flex-end; }
}

.ah-token-strip__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-sm);
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.85em;
  line-height: 1;
}

.ah-token-strip--sm .ah-token-strip__item {
  font-size: 0.75em;
  padding: 1px 4px;
}

.ah-token-strip__icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.4);
}

.ah-token-strip__icon[data-kind="clue"]     { background: var(--ah-clue); }
.ah-token-strip__icon[data-kind="doom"]     { background: var(--ah-curse); }
.ah-token-strip__icon[data-kind="damage"]   { background: var(--ah-damage); }
.ah-token-strip__icon[data-kind="horror"]   { background: var(--ah-horror); }
.ah-token-strip__icon[data-kind="resource"] { background: var(--ah-resource); }
.ah-token-strip__icon[data-kind="threat"]   { background: var(--ah-threat); }
.ah-token-strip__icon[data-kind="shroud"]   { background: var(--ah-ink-dim); }
.ah-token-strip__icon[data-kind="fight"]    { background: var(--ah-damage); }
.ah-token-strip__icon[data-kind="health"]   { background: var(--ah-success); }
.ah-token-strip__icon[data-kind="evade"]    { background: var(--ah-clue); }

.ah-token-strip__count {
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-weight: 600;
  min-width: 0.7em;
  text-align: right;
}
</style>
