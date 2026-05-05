<template>
  <div v-if="!avifSupported" class="error-message container">
    <header><h2 class="title">Please update your browser</h2></header>
    <section class="box">
      <p>Your browser does not support AVIF images. Please update your browser or switch to a different one.</p>
    </section>
  </div>
  <template v-else>
    <NavBar/>
    <Suspense>
      <router-view v-slot="{ Component }" class="router-container">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
      <template #fallback>
        Loading...
      </template>
    </Suspense>
    <ModalsContainer />
  </template>
  <footer><a href="https://www.fantasyflightgames.com/en/products/arkham-horror-the-card-game/" rel="noreferrer" target="_blank" tabindex="-1">Arkham Horror: The Card Game™</a> and all related content © <a href="https://www.fantasyflightgames.com" rel="noreferrer" target="_blank" tabindex="-1">Fantasy Flight Games (FFG)</a>. This site is not produced, endorsed by or affiliated with FFG. <router-link to="/about">{{$t('nav.about')}}.</router-link></footer>
</template>

<script lang="ts" setup>
import { ModalsContainer } from 'vue-final-modal'
import { ref, onMounted } from 'vue'
import { useSiteSettingsStore } from '@/stores/site_settings'
import { useDbCardStore } from '@/stores/dbCards'
import { checkImageExists } from '@/arkham/helpers'
import NavBar from '@/components/NavBar.vue'
import 'floating-vue/dist/style.css'

const settingsStore = useSiteSettingsStore()

onMounted(async () => {
  await settingsStore.init()
  avifSupported.value = await checkAvifSupport();
  await useDbCardStore().initDbCards()
  await checkImageExists()
})
const avifSupported = ref(true);
const checkAvifSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.onerror = () => resolve(false)
    image.onload = () => resolve(true)
    image.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  })
};
</script>

<style>
:root {
  --nav-height: 36px;
}

html {
  color-scheme: dark;
  interpolate-size: allow-keywords;
}

/* New UI: hide global NavBar + footer while inside the new game shell.
   header#nav and the App-level footer live inside #app, so the > combinator
   used previously never matched. */
body.ah-newui-game header#nav,
body.ah-newui-game > #app > footer {
  display: none;
}

/* New UI: re-skin legacy "interactable" highlights from purple to gold.
   The legacy theme used --select (rebeccapurple-ish) for can-interact
   borders on Location, Treachery, AbilityButton, Question, etc. Override
   the variable inside the new UI body so every consumer flips to gold
   without per-component edits. */
body.ah-newui-game {
  --select: var(--ah-gold);
}

/* New UI: warm wood texture under the AppShell + candlelight vignette
   on the stage. Implements plan §1's "暖棕木纹 + 烛光晕" atmosphere. */
body.ah-newui-game .ah-shell {
  background-image: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
                    url('@/assets/textures/wood.png');
  background-size: auto, 320px;
  background-blend-mode: multiply;
}

body.ah-newui-game .ah-shell__stage::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 38%,
      rgba(232, 200, 120, 0.10) 0%,
      rgba(232, 200, 120, 0.04) 25%,
      rgba(0, 0, 0, 0.0) 55%,
      rgba(0, 0, 0, 0.45) 100%);
  z-index: 6;
}

/* New UI: gold connection lines on the location graph. Lives in this global
   stylesheet (rather than a non-scoped block inside Connections.vue) so the
   selector reliably wins against the scoped legacy rules. */
body.ah-newui-game svg.connections-svg .line {
  stroke: var(--ah-gold);
  stroke-width: 4px;
  opacity: 0.7;
}
body.ah-newui-game svg.connections-svg .line.active {
  stroke: var(--ah-gold-bright) !important;
  stroke-width: 5px;
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(232, 200, 120, 0.6));
}
body.ah-newui-game svg.connections-svg .enemy-line {
  stroke: var(--ah-damage);
  opacity: 0.75;
}

/* New UI: re-skin the legacy .game-bar when teleported into TopBar's actions slot.
   Strips its panel background and shrinks buttons to fit the topbar height. */
body.ah-newui-game .ah-actions-host > .game-bar {
  background: transparent;
  flex-wrap: wrap;
  align-items: center;
  font-size: 12px;
  color: var(--ah-ink-dim);
}
body.ah-newui-game .ah-actions-host > .game-bar button {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--ah-r-sm);
  padding: 4px 8px;
  height: auto;
  color: var(--ah-ink-dim);
  font-size: 12px;
  letter-spacing: 0.04em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
body.ah-newui-game .ah-actions-host > .game-bar button:hover {
  background: rgba(201, 162, 83, 0.10);
  border-color: var(--ah-border-soft);
  color: var(--ah-gold-bright);
}
body.ah-newui-game .ah-actions-host > .game-bar button svg {
  width: 14px;
  height: 14px;
}
body.ah-newui-game .ah-actions-host > .game-bar .game-bar-item.active,
body.ah-newui-game .ah-actions-host > .game-bar .game-bar-item:hover {
  background: transparent;
}
/* The .right div pushes the toggle-sidebar to the far end inside game-bar; in the
   new layout the topbar is grid-aligned so we just let it sit inline. */
body.ah-newui-game .ah-actions-host > .game-bar > div.right {
  margin-left: 0;
}
* {
  padding: 0;
  margin: 0;
  font: inherit;
  min-width: 0;
}
*, *::before, *::after{
  box-sizing: border-box;
}

b, strong {
  font-weight: bold;
}

img, svg {
  max-width: 100%;
  -webkit-touch-callout: none
}

button {
  padding: 0px 5px;
  font-family: Arial;
  font-size: 13.3px;
  i { display: contents; font-style: italic; }
}

@font-face {
  font-family: "Arkham";
  src: url("/fonts/arkham.ttf");
}

@font-face {
  font-family: "Typewriter";
  src: url("/fonts/typewriter.ttf");
}

@font-face {
  font-family: "MapTypewriter";
  src: url("/fonts/type.ttf");
}

@font-face {
  font-family: "Accountant";
  src: url("/fonts/accountant.ttf");
}

@font-face {
  font-family: "AboutDead";
  src: url("/fonts/AboutDead.ttf");
}

@font-face {
  font-family: "Arno";
  src: url("/fonts/ArnoPro-Regular.otf");
}

@font-face {
  font-family: "Albertus";
  src: url("/fonts/albertus.ttf");
}

.about-dead {
  font-family: "AboutDead";
  text-align: center;
  font-size: 1.5em;
}

@font-face {
  font-family: 'Materials';
  font-style: normal;
  font-weight: 200;
  src: url("/fonts/materials.ttf");
}

@font-face {
  font-family: "Noto Sans";
  src: url("/fonts/NotoSans.ttf");
}

@font-face {
  font-family: "Unquiet Spirits";
  src: url("/fonts/UnquietSpirits.ttf");
}

@font-face {
  font-family: "ArkhamIcons";
  src: url("/fonts/arkhamicons.ttf");
}

@font-face {
  font-family: "ArkhamEncounters";
  src: url("/fonts/encounters.woff2") format("woff2");
}

@font-face {
  font-family: "ArkhamSlim";
  src: url("/fonts/arkhamslim.ttf");
}

@font-face {
  font-family: "Teutonic";
  src: url("/fonts/teutonic.ttf");
}

@font-face {
  font-family: "ArkhamCursive";
  src: url("/fonts/AquilineTwo.ttf");
}

@font-face {
  font-family: "Wolgast";
  src: url("/fonts/WolgastScript.ttf");
}

@font-face {
  font-family: "Billenia";
  src: url("/fonts/billenia.ttf");
}

@font-face {
  font-family: "Anke";
  src: url("/fonts/ankecallig-fg.ttf");
}

@font-face {
  font-family: "ArkhamFlavor";
  src: url("/fonts/ArnoPro-ItalicCaption.ttf");
}

body {
  margin: 0;
  padding: 0;
  color: #222;
  min-height: 100vh;
  background: var(--background);
  font-size: min(16px, 2vw);
  @media (max-width: 800px) and (orientation: portrait) {
    font-size: initial;
  }
}

button {
  font-size: min(12px, 2vw);
}

#app {
  font-family: "Noto Sans", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.neutral-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0046";
  }
}

.guardian-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0051";
  }
}

.seeker-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0045";
  }
}

.rogue-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0054";
  }
}

.mystic-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0057";
  }
}

.survivor-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0052";
  }
}

.elder-sign {
  &:before {
    text-transform: none;
    font-weight: normal;
    font-size: 1.3em;
    font-family: "Arkham";
    content: "\0058";
  }
}

.auto-fail {
  &:before {
    text-transform: none;
    font-weight: normal;
    font-size: 1.3em;
    font-family: "Arkham";
    content: "\005A";
  }
}

.action-icon {
  &:before {
    text-transform: none;
    font-family: "arkham";
    content: "\0049";
    margin-right: 5px;
  }
}

.willpower-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0041";
    color: inherit;
  }
}

.intellect-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0046";
  }
}

.combat-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0044";
  }
}

.agility-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0053";
  }
}

.skull-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e910";
  }
}

.cultist-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e911";
  }
}

.tablet-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e912";
  }
}

.elder-thing-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e913";
  }
}

.curse-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e929";
  }
}

.bless-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\e92a";
  }
}

.frost-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0062";
  }
}

.seal-a-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0067";
  }
}

.seal-b-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0066";
  }
}

.seal-c-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0065";
  }
}

.seal-d-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0063";
  }
}

.seal-e-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0064";
  }
}

.codex-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0068";
  }
}

.day-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\0069";
  }
}

.night-icon {
  &:before {
    text-transform: none;
    font-family: "ArkhamSlim";
    content: "\006a";
  }
}

.wild-icon {
  &:before {
    text-transform: none;
    font-family: "Arkham";
    content: "\0047";
  }
}

.fast-icon {
  &:before {
    text-transform: none;
    font-family: "arkham";
    content: "\0075";
    margin-right: 5px;
  }
}

.free-icon {
  &:before {
    text-transform: none;
    font-family: "arkham";
    content: "\0075";
    margin-right: 5px;
  }
}

.reaction-icon {
  &:before {
    text-transform: none;
    font-family: "arkham";
    content: "\0079";
    margin-right: 5px;
  }
}

.per-player{
  &:before {
    text-transform: none;
    font-family: "ArkhamIcons";
    content: "\E915";
  }
}

:root {
  transition-behavior: allow-discrete;
  --willpower: #2c7fc0;
  --intellect: #7c3c85;
  --combat: #ae4236;
  --agility: #14854d;

  --willpower-light: #C5DEF2;
  --intellect-light: #EAD5EC;
  --combat-light: #F1D3D0;
  --agility-light: #8CEEBD;

  --important: rgba(212, 165, 10, 0.9);

  --wild: #8a7d5a;
  --guardian: #5cb4fd;
  --mystic: #ba81f2;
  --rogue: #48b14f;
  --seeker: #efa345;
  --survivor: #ee4a53;
  --multiclass: #e4d083;
  --mythos: #d8dee9;
  --neutral: #d8dee9;
  --guardian-dark: #1072c2;
  --guardian-extra-dark: #0c5693;
  --seeker-dark: #db7c07;
  --seeker-extra-dark: #aa6005;
  --seeker-text: #603603;
  --rogue-dark: #219428;
  --rogue-extra-dark: #186a1d;
  --mystic-dark: #7554ab;
  --mystic-extra-dark: #5e4389;
  --survivor-dark: #cc3038;
  --survivor-extra-dark: #a3262d;
  --neutral-dark: #333;
  --neutral-extra-dark: #222;
  --multiclass-dark: #a38c46;
  --mythos-dark: #434c5e;
  --taboo: #9869f5;
  --health: #ae4236;
  --sanity: #2c7fc0;

  --blessed: #6a5720;
  --cursed: #270F31;
  --frost: #39394C;
  --auto-fail: #4A1216;
  --elder-sign: #4A6973;
  --skull: #26110E;
  --cultist: #172615;
  --tablet: #1E2A3A;
  --elder-thing: #2D1F25;

  --delete: #c13131;
  --background: #2e3440;
  --background-dark: #242831;
  --background-mid: #515a68;
  --background-light: #c9ced8;
  --box-background: #353b49;
  --box-border: #434c5e;

  --title: #cecece;
  --green-title: #38615F;
  --text: white;
  --spooky-green: #879C5A;
  --spooky-green-dark: #3A5144;

  --button: #555;
  --button-highlight: #444;

  --button-1: #6E8640;
  --button-1-highlight: #5a6e34;

  --button-2: #532e61;
  --button-2-highlight: #4d2b61;

  --card-width: min(calc(2.5vw + 20px), 60px);
  --card-height: min(calc(3.545vw + 28.36px), 85.08px);
  --card-aspect: 0.705;
  --tarot-aspec: 0.571429;
  --card-sideways-aspect: 1.41844;
  --card-tarot-aspect: 0.571429;

  --card-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  --select: #ff00ff;
  --select-dark: #d400d4;
  --select-dark-20: #cc00cc;
  --select-dark-30: #b200b2;

  --highlight: #2dd4bf;

  --bullet-red: #391714;
  
  --pool-token-width: min(30px, 4vw);
  @media (max-width: 800px) and (orientation: portrait) {
    --pool-token-width: 24px;
  }

  /* === New UI theme tokens (ui-redesign-plan.md §6) ===
     New tokens use --ah- prefix to coexist with legacy vars during migration. */

  /* Surfaces — warm dark wood + parchment */
  --ah-bg-stage:     #1a1310;
  --ah-bg-panel:     #2a1f17;
  --ah-bg-panel-2:   #1f1610;
  --ah-bg-elevated:  #3a2a1d;

  /* Ink */
  --ah-ink:          #f0e6d2;
  --ah-ink-dim:      #b8a888;
  --ah-ink-muted:    #7a6a55;

  /* Brand gold */
  --ah-gold:         #c9a253;
  --ah-gold-bright:  #e8c878;
  --ah-gold-dim:     #6b4f24;

  /* Status colors (game tokens) */
  --ah-clue:         #6db5ff;
  --ah-horror:       #a48bd8;
  --ah-damage:       #d6443a;
  --ah-resource:     #d8b14a;
  --ah-threat:       #d96a2a;
  --ah-bless:        #f4e3a1;
  --ah-curse:        #6e3aa6;
  --ah-success:      #7dbf6e;
  --ah-danger:       #c0392b;

  /* Borders */
  --ah-border-soft:    rgba(201, 162, 83, 0.18);
  --ah-border:         rgba(201, 162, 83, 0.45);
  --ah-border-strong:  #c9a253;

  /* Shadows / glows */
  --ah-shadow-card:      0 4px 16px rgba(0, 0, 0, 0.55);
  --ah-shadow-panel:     0 6px 24px rgba(0, 0, 0, 0.65);
  --ah-glow-selected:    0 0 0 2px var(--ah-gold), 0 0 24px rgba(232, 200, 120, 0.35);
  --ah-glow-actionable:  0 0 16px rgba(109, 181, 255, 0.45);

  /* Radii */
  --ah-r-sm: 4px;
  --ah-r-md: 8px;
  --ah-r-lg: 14px;

  /* Spacing scale */
  --ah-space-1: 4px;
  --ah-space-2: 8px;
  --ah-space-3: 12px;
  --ah-space-4: 20px;
  --ah-space-5: 32px;

  /* Typography (project already loads Teutonic / Arno / Noto Sans;
     keep generic display/body stacks so we can swap later without churn) */
  --ah-font-display: "Teutonic", "Cinzel", "Trajan Pro", serif;
  --ah-font-body:    "Noto Sans", Inter, system-ui, sans-serif;
  --ah-font-log:     "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

h2.title {
  color: var(--title);
  font-size: 2em;
  text-transform: uppercase;
  font-family: Teutonic;
}

.box {
  background-color: var(--box-background);
  border: 1px solid var(--box-border);
  color: var(--title);
  padding: 10px;
  border-radius: 5px;
}

.page-container {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  margin-block: 10px;
}

.page-content {
  width: 70vw;
  margin: 0 auto;
  padding-bottom: 10px;
  @media (max-width: 800px) and (orientation: portrait) {
    width: fit-content;
  }
}

.fade-leave-active,
.fade-enter-active {
  transition: opacity 0.3s;
}

.fade-enter-active {
  transition-delay: 0.3s;
  position: absolute;
  inset: 0;
}

.fade-leave-to,
.fade-enter-from {
  opacity: 0;
}

.router-container {
  position: relative;
  overflow-x: clip;
  overflow-y: auto;
}

footer {
  margin: 0 auto;
  font-size: 0.5em;
  color: var(--title);
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  z-index: 100;
  @media (max-width: 800px) and (orientation: portrait) {
    display: none;
  }
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.card {
  user-select: none;
  box-shadow: var(--card-shadow);
}

:nth-child(1) {
  --index: 1;
}
:nth-child(2) {
  --index: 2;
}
:nth-child(3) {
  --index: 3;
}
:nth-child(4) {
  --index: 4;
}

:nth-last-child(1) {
  --rev-index: 1;
}
:nth-last-child(2) {
  --rev-index: 2;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.error-message {
  margin: 50px;
  header {
    text-align: center;
    margin-bottom: 10px;
  }
}

@property --glow-rotation {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes glow {
  from {
    --glow-rotation: 0deg;
  }
  to {
    --glow-rotation: 360deg;
  }
}


* {
  &.highlighted {
    border: 2px solid transparent;
    background: conic-gradient(from var(--glow-rotation), var(--gradient-glow)) border-box;
    border-style: inset;
    border-radius: 3px;
    position: relative;
    animation: glow 3s linear infinite;
  }
}

::view-transition-group(selected-game-box) {
  animation-duration: 280ms;
  animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

::view-transition-old(selected-game-box),
::view-transition-new(selected-game-box) {
  mix-blend-mode: normal;
}

::view-transition-group(main-header) {
  animation-duration: 280ms;
  animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

::view-transition-old(main-header),
::view-transition-new(main-header) {
  mix-blend-mode: normal;
}
</style>
