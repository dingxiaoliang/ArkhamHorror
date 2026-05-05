<script lang="ts" setup>
import { computed, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    side?: 'right' | 'left'
    width?: string
    /** When false, hide the × button, ignore ESC, and ignore scrim clicks.
     *  Used for forced-open prompts where the player must address the
     *  drawer's content before continuing. */
    closable?: boolean
  }>(),
  { side: 'right', width: 'clamp(280px, 28vw, 420px)', closable: true }
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

function close() {
  if (!props.closable) return
  isOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value && props.closable) close()
}

watch(
  () => isOpen.value,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <!-- No <Teleport> + nested <Transition>: that combination clashed with
       App.vue's route-level <Transition name="fade"> during Game unmount,
       producing a "Cannot read properties of null (reading '__isMounted')"
       crash. The scrim uses position: fixed so it covers the viewport
       regardless of where in the tree this component renders. -->
  <div
    v-if="isOpen"
    class="ah-drawer__scrim"
    :class="`ah-drawer__scrim--${side}`"
    @click.self="close"
  >
    <aside
      class="ah-drawer"
      :class="`ah-drawer--${side}`"
      :style="{ width }"
      role="dialog"
      aria-modal="true"
      @click.stop
    >
      <header class="ah-drawer__head">
        <h3 v-if="title" class="ah-drawer__title">{{ title }}</h3>
        <button v-if="closable" class="ah-drawer__close" @click="close" aria-label="Close">×</button>
      </header>
      <div class="ah-drawer__body">
        <slot />
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.ah-drawer__scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1500;
  display: flex;
}
.ah-drawer__scrim--right { justify-content: flex-end; }
.ah-drawer__scrim--left  { justify-content: flex-start; }

.ah-drawer {
  height: 100%;
  background: var(--ah-bg-panel);
  color: var(--ah-ink);
  border-left: 1px solid var(--ah-border);
  box-shadow: var(--ah-shadow-panel);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ah-drawer--left {
  border-left: 0;
  border-right: 1px solid var(--ah-border);
}

.ah-drawer__head {
  display: flex;
  align-items: center;
  gap: var(--ah-space-2);
  padding: var(--ah-space-3) var(--ah-space-4);
  border-bottom: 1px solid var(--ah-border-soft);
}

.ah-drawer__title {
  margin: 0;
  flex: 1 1 auto;
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-size: 1.05em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ah-drawer__close {
  appearance: none;
  background: transparent;
  border: 1px solid var(--ah-border-soft);
  color: var(--ah-ink-dim);
  border-radius: var(--ah-r-sm);
  width: 28px;
  height: 28px;
  font-size: 1.2em;
  cursor: pointer;
  line-height: 1;
  &:hover {
    color: var(--ah-gold-bright);
    border-color: var(--ah-gold);
  }
}

.ah-drawer__body {
  flex: 1 1 auto;
  overflow: auto;
  padding: var(--ah-space-3) var(--ah-space-4);
}

</style>
