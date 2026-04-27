# 主界面 UI 改版计划

> 参考目标：`docs/img/newui.png`
> 当前现状：`docs/img/screenshot.png`
> 范围：游戏内主界面（`frontend/src/arkham/views/Game.vue` 及其相关组件）
> 状态：待实施

---

## 1. 从目标稿提炼的布局规律

- **三段式骨架**：顶部信息栏（高度约 6%）/ 中部主战场（约 70%）/ 底部玩家坞（约 24%）。
- **右侧固定上下文栏**：宽度约 25%，上半是「当前选中实体的详细面板」（标题 + 描述 + 代币数 + 特性 + 行动按钮），下半是「Game Log」时间戳列表，可独立滚动。
- **顶栏三段式分布**：左 = 剧本/战役标题；中 = 全局回合状态（ROUND X of Y + 阶段图标）；右 = 全局资源/状态徽章 + 设置/菜单。
- **场地卡是节点**：位置卡固定为「上栏标题条 + 中部美术 + 下栏代币条」三层结构，节点之间用金色实线/虚线连接，**连接线绘制在卡片之下**，选中态有金色描边光晕。
- **代币始终可视化**：clues / horror / damage / threat 用统一的小图标徽章贴在卡片下沿，数字直接读，不用 hover。
- **行动入口集中在右栏**：玩家不是点击场地中央的悬浮菜单，而是通过右栏的「Investigate / Move / Explore」大按钮触发，一次只暴露当前可做的动作。
- **底部坞分四段**：调查员头像区 / PLAY AREA / HAND / 终止回合区，段与段之间有装饰隔断；PLAY AREA 与 HAND 视觉上明显区分（HAND 卡更亮、靠下）。
- **视觉语言**：暖棕木纹 + 烛光晕 + 金色描边 + 衬线大写字。任何浮层/面板都装在「带角花纹的框」里，没有裸 div。
- **状态色稳定**：clues = 蓝、horror = 紫、damage = 红、resources = 金、agenda/threat = 红橙。

---

## 2. 当前界面最需要修改的地方（按优先级）

1. **顶栏信息密度过低**：仅有路由链接 + 用户名，没有回合数、阶段、剧本标题、全局资源——玩家时刻需要的信息都缺。
2. **右侧旋转 90° 的牌堆标签**严重破坏沉浸感且不可读，应改为图标化的牌堆条或收纳进右栏抽屉。
3. **没有「选中实体详情面板」**：当前所有交互信息都堆在场地卡上的浮窗或日志里，缺一个稳定的右上详情区。
4. **Game Log 区域过宽且无样式**：占据右上一大块灰绿空白，应压缩成右下时间线列表。
5. **Debug 按钮（View Log / Toggle Debug / Debug Export）暴露在主 UI 右下角**，应收进设置菜单或开发者抽屉。
6. **场地连接线是紫色虚线**，缺乏方向感与层级感；卡片与连接线层级混乱。
7. **底部分区不清**：投资员卡、资产、手牌之间没有视觉分隔，容易误读哪些是已打出、哪些在手。
8. **整体配色是冷紫蓝 flat**，缺少 AHTCG 的暖色基调和材质感，导致氛围跟原作完全脱节。
9. **END TURN 不显眼**：当前 "End turn" 是个普通灰色小按钮，在右下角的小卡片里——核心高频操作应有最强视觉权重。
10. **没有响应式布局策略**：旋转标签、固定面板宽度暗示当前是为某一种屏宽硬写的。

---

## 3. 新主界面线框图

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  TopBar                                                                         │
│  [☾ Logo] The Drowned City · Campaign 1   │  ◇ ◇ ◇  ROUND 3/8  │  ⓘ 🩸 🧠 ⚡ ⚙ │
├──────────────────────────────────────────────────────────┬─────────────────────┤
│                                                          │  ┌───────────────┐  │
│                                                          │  │ DetailPanel   │  │
│                                                          │  │  Sunken Chapel│  │
│                                                          │  │  ─ 描述 ─     │  │
│                  PlayArea (LocationGraph)                │  │  ◆2  ⚒1  ⚠2  │  │
│       ┌─────┐    ┌─────┐    ┌─────┐                      │  │  Traits...    │  │
│       │ Loc │────│ Loc │────│ Loc │                      │  │ ┌───┬───┬───┐ │  │
│       └─────┘    └─────┘    └─────┘                      │  │ │調查│移動│探索│ │  │
│          │         │         │                           │  │ └───┴───┴───┘ │  │
│       ┌─────┐    ┌─────┐    ┌─────┐                      │  └───────────────┘  │
│       │ Loc │════│ Loc │════│ Loc │  ← 选中态金色描边     │  ┌───────────────┐  │
│       └─────┘    └─────┘    └─────┘                      │  │ GameLog       │  │
│                                                          │  │  ▸ 12:31 ...  │  │
│                                                          │  │  ▸ 12:30 ...  │  │
│                                                          │  │  ▸ 12:28 ...  │  │
│                                                          │  └───────────────┘  │
├────────┬─────────────────────────┬───────────────────────┴──┬──────────────────┤
│ Invest.│ PLAY AREA               │ HAND                     │   ┌────────────┐ │
│ ┌────┐ │ [asset][asset][asset]   │ [card][card][card][card] │   │ END TURN   │ │
│ │ 👤 │ │                         │                          │   └────────────┘ │
│ └────┘ │                         │                          │   3 actions left │
│ HP/SAN │                         │                          │   [DISCARD]      │
└────────┴─────────────────────────┴──────────────────────────┴──────────────────┘
```

抽屉 / 浮层（按需显示，不占主版位）：
- ChaosBag、Encounter Deck 预览、Out of Play 牌堆、CampaignLog、ChoiceModal、SkillTest、Revelation 大图——全部走右侧抽屉或居中模态，**不再占用主布局格子**。

---

## 4. 区域划分与职责说明

| 区域 | 职责 | 不该放什么 |
|------|------|-----------|
| **TopBar** | 战役/剧本标题、回合数与阶段、全局徽章（clues 总数、伤害/恐惧/资源汇总）、设置/菜单入口 | 玩家牌、行动按钮 |
| **PlayArea (中心)** | LocationGraph（节点 + 连接线）、敌人 token 叠在场地上、SkillTest 时居中弹出 | 详情文字、日志 |
| **RightRail / DetailPanel (右上)** | 选中实体的详细信息 + 当前玩家可执行的行动按钮（Investigate / Fight / Evade / Move / Play / Activate） | 全局菜单、设置 |
| **RightRail / GameLog (右下)** | 时间戳事件流，可滚动、可折叠、可 "View Older" | 行动按钮 |
| **Dock / InvestigatorCard (左下)** | 当前玩家头像 + 名字 + 职业、HP/SAN、resources/clues/actions | 抽牌堆 |
| **Dock / PlayArea (中下)** | 已打出的资产、事件常驻物 | 手牌 |
| **Dock / Hand (中下偏右)** | 手牌列表，hover 放大 | 资产 |
| **Dock / TurnControls (右下)** | END TURN、剩余 action 数、DISCARD | 日志 |
| **Drawers** | ChaosBag、EncounterDeck、Discard、OutOfPlay、CampaignLog、Settings、Debug | 高频操作 |
| **Modals** | ChoiceModal、Revelation、SkillTest、UpgradeDeck | 长驻信息 |

---

## 5. 组件清单：复用 vs 新建

**可直接复用（保持 API，可能重写样式）**
- `Investigator.vue`、`Asset.vue`、`Enemy.vue`、`Location.vue`、`Treachery.vue`、`Event.vue`、`Skill.vue`
- `Card.vue` / `CardImage.vue` / `CardOverlay.vue` / `HandCard.vue`
- `GameLog.vue`、`GameMessage.vue`、`FormattedEntry.vue`、`LogIcons.vue`
- `ChaosBag.vue`、`Discard.vue`、`EncounterDeck.vue`、`EncounterDiscard.vue`
- `Modifier(s).vue`、`Token.vue`、`Resources.vue`、`PoolItem.vue`
- `ChoiceModal.vue`、`Question(s).vue`、`SkillTest.vue`
- `Connections.vue`、`Locus.vue`（连接线绘制可保留几何，重做样式）

**需要重写样式但保留逻辑**
- `GameBar.vue` → 改为新 `TopBar`
- `Player.vue` → 拆成 `InvestigatorDock` + `PlayedAssetsRow` + `HandRow` + `TurnControls`
- `Scenario.vue` → 仅留"舞台容器"职责，把右侧旋转标签栏拆走
- `AbilitiesMenu.vue` → 从浮窗改为右栏 `ActionList`

**新建**
- `layout/AppShell.vue`：定义新 grid 骨架（TopBar / Stage / RightRail / Dock）
- `layout/TopBar.vue`：标题区 + 回合区 + 徽章区
- `layout/RightRail.vue`：上下分栏容器，管 `DetailPanel` 与 `GameLog` 的折叠/分割
- `layout/Dock.vue`：底部坞容器
- `panels/DetailPanel.vue`：根据 `selectedEntity` 渲染场地/敌人/资产的详细信息 + 行动按钮组
- `panels/ActionList.vue`：竖排大按钮（Investigate / Move / Explore...）
- `dock/InvestigatorDock.vue`：左下投资员卡
- `dock/PlayedAssetsRow.vue`、`dock/HandRow.vue`、`dock/TurnControls.vue`
- `stage/LocationGraph.vue`：包装 `Connections + Location` 节点 + 自动布局
- `tokens/TokenStrip.vue`：卡片下沿统一的图标+数字徽章条
- `drawers/Drawer.vue`：通用右抽屉（替代当前旋转标签的牌堆面板）
- `frames/OrnateFrame.vue`：所有面板的"带角花纹"边框组件
- `theme/Icon.vue`：统一图标包装（clue/horror/damage/resource/action）

---

## 6. 主题变量

放在 `frontend/src/assets/main.scss`（目前接近空文件）或新增 `theme.scss`：

```scss
// 基底色：暖棕木纹 + 烛光
--bg-stage:        #1a1310;   // 主舞台底
--bg-panel:        #2a1f17;   // 面板底
--bg-panel-2:      #1f1610;   // 面板深底（log 行）
--bg-elevated:     #3a2a1d;   // hover/选中
--ink:             #f0e6d2;   // 主文字（米色羊皮）
--ink-dim:         #b8a888;   // 次文字
--ink-muted:       #7a6a55;   // 时间戳/占位

// 品牌色
--gold:            #c9a253;   // 金色描边/数字
--gold-bright:     #e8c878;   // 金色高光
--gold-dim:        #6b4f24;

// 状态色
--clue:            #6db5ff;   // 蓝
--horror:          #a48bd8;   // 紫
--damage:          #d6443a;   // 红
--resource:        #d8b14a;   // 金
--threat:          #d96a2a;   // 橙
--bless:           #f4e3a1;
--curse:           #6e3aa6;
--success:         #7dbf6e;
--danger:          #c0392b;

// 描边/分隔
--border-soft:     rgba(201,162,83,0.18);
--border:          rgba(201,162,83,0.45);
--border-strong:   #c9a253;

// 阴影
--shadow-card:     0 4px 16px rgba(0,0,0,0.55);
--shadow-panel:    0 6px 24px rgba(0,0,0,0.65);
--glow-selected:   0 0 0 2px var(--gold), 0 0 24px rgba(232,200,120,0.35);
--glow-actionable: 0 0 16px rgba(109,181,255,0.45);

// 圆角与节奏
--r-sm: 4px;  --r-md: 8px;  --r-lg: 14px;
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 20px; --space-5: 32px;

// 排版
--font-display: 'Cinzel', 'Trajan Pro', serif;  // 标题/数字
--font-body:    'Inter', system-ui, sans-serif; // 正文
--font-log:     'IBM Plex Mono', monospace;     // 时间戳
```

---

## 7. 实施顺序

按"骨架 → 容器 → 内容 → 装饰"四层推进，每层结束都能跑：

1. **(0.5d) 主题变量层**：写 `theme.scss`，在现有组件里替换硬编码颜色。不改结构，保证可回退。
2. **(1d) AppShell 骨架**：新建 `layout/AppShell.vue`，用 CSS Grid 定义 TopBar / Stage / RightRail / Dock 四区。`Game.vue` 内只做"在 AppShell 的插槽里塞旧组件"——验证骨架不破坏功能。
3. **(1d) TopBar**：把 `GameBar` 的菜单按钮迁进 TopBar 的右菜单；中部加回合/阶段；左侧加战役标题。删除原页面顶部路由条在游戏页的可见性。
4. **(2d) RightRail + DetailPanel + GameLog**：把右侧旋转标签的牌堆面板挪到抽屉；新建 DetailPanel，订阅"当前选中实体"；GameLog 收纳到右下。
5. **(2d) Dock 重组**：拆 `Player.vue` 成 InvestigatorDock / PlayedAssetsRow / HandRow / TurnControls；END TURN 大按钮化。
6. **(1d) Stage / LocationGraph 重做**：金色连接线、卡片三段式、TokenStrip。选中态金色光晕。
7. **(1d) Drawers**：把 ChaosBag、Discards、OutOfPlay、Debug 全部统一进 Drawer。
8. **(1d) OrnateFrame & 装饰层**：统一面板边框/角花，烛光氛围（vignette 滤镜）。
9. **(0.5d) 响应式**：定义 ≥1440 / ≥1280 / ≥1024 三档断点，1024 以下右栏可折叠。
10. **(0.5d) 走查 & 微调**：跑一局完整流程，对比 newui 截图调间距/字号/颜色。

预计总量约 10 人日。第 1–2 步就能验证方向，不需要等到全部做完。

---

## 8. 美术资源清单（精简版）

约定：所有位图优先 PNG（带透明），可平铺的纹理用小尺寸；图标全部 SVG 单色（颜色靠 CSS 控制）。文件名建议放在 `frontend/src/assets/` 下对应子目录。

> 暗角 vignette、烛光暖晕、剧本切换的冷光全部用 CSS `radial-gradient` 实现，**不需要出图**。

### A. 背景与材质（2 张）

| 文件名 | 类型 | 规格 | 说明 |
|--------|------|------|------|
| `textures/wood.jpg` | 可平铺位图 | 512×512，JPG | 深棕木板，**无明显接缝**，不带光照（光由 CSS 加）。亮度偏暗（接近 #1a1310） |
| `textures/parchment.png` | 可平铺位图 | 512×512，PNG | 旧羊皮纸纤维，半透明叠在面板底色上即可。**不要带边缘破损/卷边**（边缘由角花组件画） |

### B. 装饰边框（1 套 9-slice）

| 文件名 | 类型 | 规格 | 说明 |
|--------|------|------|------|
| `frames/ornate-corner.svg` | SVG，单色金 | 64×64 视窗 | **只画左上角一个角花** + 上边/左边的延伸纹路。代码里通过镜像生成 4 角 + 4 边。颜色用 `currentColor`，方便主题化 |
| `frames/ornate-divider.svg` | SVG，单色金 | 320×16 视窗 | 横向分隔花纹（用于 DetailPanel 段落分隔、TopBar 上下沿） |

### C. 关键按钮装饰（1 张，可选）

| 文件名 | 类型 | 规格 | 说明 |
|--------|------|------|------|
| `ui/end-turn-frame.svg` | SVG，单色金 | 240×72 视窗 | END TURN 按钮的金属铭牌外框。**只要外框**，文字和底色由 CSS 渲染。如果暂时没有，可以先用 `ornate-corner` 拼，所以这张是 **nice-to-have** |

### D. 图标（SVG 单色，统一 24×24 视窗）

放 `icons/` 下，全部 `currentColor` 描边/填充。**总数约 36 个**。

**资源 / 代币**（10）
`clue.svg` `horror.svg` `damage.svg` `resource.svg` `action.svg` `doom.svg` `threat.svg` `charge.svg` `ammo.svg` `secret.svg`

**调查员属性**（4）
`willpower.svg` `intellect.svg` `combat.svg` `agility.svg`

**Chaos token**（8）
`bless.svg` `curse.svg` `frost.svg` `cultist.svg` `skull.svg` `tablet.svg` `elder-thing.svg` `elder-sign.svg`（auto-fail 用 ✗ 字符即可）

**阶段**（4）
`phase-mythos.svg` `phase-investigation.svg` `phase-enemy.svg` `phase-upkeep.svg`

**牌堆**（5）
`deck-encounter.svg` `deck-discard.svg` `deck-out-of-play.svg` `deck-chaos-bag.svg` `deck-player.svg`

**通用 UI**（5）
`menu.svg` `settings.svg` `undo.svg` `close.svg` `bug.svg`

> 已经有 Heroicons 在用的（如 `BoltIcon`、`BackwardIcon`），**继续用 Heroicons，不需要重画**。上面的清单只覆盖游戏专属图标。

### E. 字体（免费，可直接打包，无需出图）

| 用途 | 字体 | 来源 |
|------|------|------|
| 标题 / 数字 | **Cinzel**（含 Regular/Bold） | Google Fonts，OFL |
| 正文 | **Inter**（Regular/500/600） | Google Fonts，OFL |
| 等宽（log 时间戳） | **JetBrains Mono** Regular | Google Fonts，OFL |

字体放 `frontend/src/assets/fonts/`，`@font-face` 本地化，避免运行时拉 CDN。

### F. Logo（1 张，可选）

| 文件名 | 类型 | 规格 | 说明 |
|--------|------|------|------|
| `logo-gold.svg` 或 `logo-gold.png` | SVG / PNG 透明 | 高度 40px 渲染清晰即可 | TopBar 左上的小标志。如果暂时没有，复用现有 `logo.png` 也行 |

### 汇总：实际需要准备的图

**必交：**
1. `textures/wood.jpg`（512×512，可平铺，深棕无接缝）
2. `textures/parchment.png`（512×512，可平铺，半透明纤维）
3. `frames/ornate-corner.svg`（一个角花）
4. `frames/ornate-divider.svg`（一条分隔花纹）
5. `icons/` 下约 36 个 SVG（按 D 节列表）

**可选 / 可后补：**
- `ui/end-turn-frame.svg`
- `logo-gold.svg`

字体从 Google Fonts 下载，无需准备。
