<template>
  <div class="ah-rail">
    <section class="ah-rail__detail">
      <slot name="detail" />
    </section>
    <section class="ah-rail__log">
      <slot name="log" />
    </section>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.ah-rail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.ah-rail__detail {
  flex: 0 1 auto;
  max-height: 60%;
  overflow: auto;
  border-bottom: 1px solid var(--ah-border-soft);
  padding: var(--ah-space-3);
  color: var(--ah-ink);
}

.ah-rail__log {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
