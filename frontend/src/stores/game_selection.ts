import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SelectionKind = 'location' | 'enemy' | 'asset'

export interface Selection {
  kind: SelectionKind
  id: string
}

export const useGameSelectionStore = defineStore('gameSelection', () => {
  const selection = ref<Selection | null>(null)

  const selectedId = computed(() => selection.value?.id ?? null)
  const selectedKind = computed(() => selection.value?.kind ?? null)

  function select(next: Selection) {
    if (
      selection.value &&
      selection.value.kind === next.kind &&
      selection.value.id === next.id
    ) {
      selection.value = null
    } else {
      selection.value = next
    }
  }

  function clear() {
    selection.value = null
  }

  function reset() {
    selection.value = null
  }

  return { selection, selectedId, selectedKind, select, clear, reset }
})
