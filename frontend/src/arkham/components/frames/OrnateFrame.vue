<script lang="ts" setup>
withDefaults(
  defineProps<{
    title?: string
    /** Subtle parchment-tinted background under the frame. */
    parchment?: boolean
    /** Visually compact variant: thinner padding and shorter title divider. */
    compact?: boolean
  }>(),
  { parchment: false, compact: false }
)
</script>

<template>
  <section class="ah-frame" :class="{ 'ah-frame--parchment': parchment, 'ah-frame--compact': compact }">
    <span class="ah-frame__corner ah-frame__corner--tl" aria-hidden="true" />
    <span class="ah-frame__corner ah-frame__corner--tr" aria-hidden="true" />
    <span class="ah-frame__corner ah-frame__corner--bl" aria-hidden="true" />
    <span class="ah-frame__corner ah-frame__corner--br" aria-hidden="true" />
    <header v-if="title || $slots.title" class="ah-frame__head">
      <h3 class="ah-frame__title">
        <slot name="title">{{ title }}</slot>
      </h3>
      <span class="ah-frame__divider" aria-hidden="true" />
    </header>
    <div class="ah-frame__body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ah-frame {
  position: relative;
  border: 1px solid var(--ah-border-soft);
  border-radius: var(--ah-r-md);
  padding: var(--ah-space-3) var(--ah-space-4);
  background: rgba(0, 0, 0, 0.25);
  color: var(--ah-ink);

  &--parchment {
    background-image: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
                      url('@/assets/textures/parchment.png');
    background-size: auto, 320px;
    background-blend-mode: multiply;
    background-color: rgba(40, 28, 18, 0.85);
  }

  &--compact {
    padding: var(--ah-space-2) var(--ah-space-3);
  }
}

/* Gold corner ornaments. Use the bundled ornate-corner.png as a mask so we
   can tint the original art via background-color (gold) without shipping a
   pre-coloured asset. The PNG is the top-left orientation; the other three
   corners mirror via transform. */
.ah-frame__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
  background-color: var(--ah-gold);
  filter: drop-shadow(0 0 3px rgba(232, 200, 120, 0.45));
  -webkit-mask: url('@/assets/frames/ornate-corner.png') top left / contain no-repeat;
          mask: url('@/assets/frames/ornate-corner.png') top left / contain no-repeat;

  &--tl { top: -3px;    left: -3px; }
  &--tr { top: -3px;    right: -3px;  transform: scaleX(-1); }
  &--bl { bottom: -3px; left: -3px;   transform: scaleY(-1); }
  &--br { bottom: -3px; right: -3px;  transform: scale(-1, -1); }
}

.ah-frame__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ah-space-1);
  margin: 0 0 var(--ah-space-2);
  padding-bottom: var(--ah-space-2);
}

.ah-frame__title {
  margin: 0;
  font-family: var(--ah-font-display);
  color: var(--ah-gold-bright);
  font-size: 1.05em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}

/* Divider uses the bundled ornate-divider PNG as a mask so we can recolor
   the original art via background-color rather than ship a gold-coloured
   image. Falls back to a 1px gold line if mask-image isn't supported. */
.ah-frame__divider {
  display: block;
  width: 80%;
  max-width: 240px;
  height: 12px;
  background-color: var(--ah-gold);
  -webkit-mask: url('@/assets/frames/ornate-divider.png') center / contain no-repeat;
          mask: url('@/assets/frames/ornate-divider.png') center / contain no-repeat;
  opacity: 0.85;
}

.ah-frame--compact .ah-frame__divider {
  height: 8px;
  max-width: 180px;
}

.ah-frame__body {
  position: relative;
}
</style>
