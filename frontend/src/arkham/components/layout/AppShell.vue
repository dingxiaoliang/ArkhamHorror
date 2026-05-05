<template>
  <div
    class="ah-shell"
    :class="{
      'no-rail': !$slots.rail || !railOpen,
      'no-dock': !$slots.dock,
      'rail-collapsed': $slots.rail && !railOpen,
    }"
  >
    <header class="ah-shell__top">
      <slot name="top" />
    </header>

    <main class="ah-shell__stage">
      <slot name="stage" />
    </main>

    <aside v-if="$slots.rail && railOpen" class="ah-shell__rail">
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
withDefaults(
  defineProps<{
    /** When false (and the parent provided a rail slot) the rail collapses
     *  off-screen. Used to honour the "展开/收起侧边栏" toggle from the
     *  top game-bar so players can reclaim screen real estate at narrow
     *  widths or when they don't want the DetailPanel/GameLog visible. */
    railOpen?: boolean
  }>(),
  { railOpen: true }
)
</script>

<style lang="scss" scoped>
.ah-shell {
  /* Rail width tier: tuned per breakpoint by media queries below.
     Defaults to the desktop tier; smaller tiers shrink further down. */
  --ah-rail-width: 320px;

  width: 100%;
  height: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--ah-rail-width);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "top  top"
    "stage rail"
    "dock dock";
  /* Use longhand so consumers (e.g. App.vue body.ah-newui-game block) can
     layer a background-image (wood texture) without the shorthand here
     resetting image to none. */
  background-color: var(--ah-bg-stage);
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

/* Responsive tiers (plan §7 step 9):
   - ≥1440px: --ah-rail-width = 380px (default tier on extra-wide displays)
   - ≥1280px: --ah-rail-width = 320px
   - ≥1024px: --ah-rail-width = 280px (rail starts feeling tight)
   - <1024px: rail hidden by default; the "展开/收起侧边栏" toggle in the
              top game-bar can summon it back as a temporary overlay. */
@media (min-width: 1440px) { .ah-shell { --ah-rail-width: 380px; } }
@media (min-width: 1280px) and (max-width: 1439px) {
  .ah-shell { --ah-rail-width: 320px; }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .ah-shell { --ah-rail-width: 280px; }
}

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
