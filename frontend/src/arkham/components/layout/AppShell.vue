<template>
  <div class="ah-shell" :class="{ 'no-rail': !$slots.rail, 'no-dock': !$slots.dock }">
    <header class="ah-shell__top">
      <slot name="top" />
    </header>

    <main class="ah-shell__stage">
      <slot name="stage" />
    </main>

    <aside v-if="$slots.rail" class="ah-shell__rail">
      <slot name="rail" />
    </aside>

    <footer v-if="$slots.dock" class="ah-shell__dock">
      <slot name="dock" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
// Pure layout container. Defines the four-region grid (TopBar / Stage / RightRail / Dock)
// described in docs/ui-redesign-plan.md §4. No game logic here.
</script>

<style lang="scss" scoped>
.ah-shell {
  width: 100%;
  height: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(280px, 25vw, 380px);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "top  top"
    "stage rail"
    "dock dock";
  background: var(--ah-bg-stage);
  color: var(--ah-ink);
  overflow: hidden;

  &.no-rail {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "top"
      "stage"
      "dock";
  }

  &.no-dock {
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      "top  top"
      "stage rail";

    &.no-rail {
      grid-template-areas:
        "top"
        "stage";
    }
  }
}

.ah-shell__top {
  grid-area: top;
  border-bottom: 1px solid var(--ah-border);
  background: var(--ah-bg-panel-2);
  box-shadow: var(--ah-shadow-panel);
  min-height: 0;
  z-index: 2;
}

.ah-shell__stage {
  grid-area: stage;
  position: relative;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  /* Sit above the dock in the stacking order so floating UI inside the
     stage (SkillTest modal, ChoiceModal, Revelation card view, etc.) is
     not painted over by the dock when the dock is tall enough to overlap
     them on small viewports. */
  z-index: 5;
}

.ah-shell__rail {
  grid-area: rail;
  border-left: 1px solid var(--ah-border-soft);
  background: var(--ah-bg-panel);
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 4;
}

.ah-shell__dock {
  grid-area: dock;
  border-top: 1px solid var(--ah-border-soft);
  background: var(--ah-bg-panel-2);
  min-height: 0;
  position: relative;
  z-index: 1;
}

/* Responsive: collapse rail under 1024px (plan §7 step 9) */
@media (max-width: 1023px) {
  .ah-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "top"
      "stage"
      "dock";
  }
  .ah-shell__rail {
    display: none;
  }
}
</style>
