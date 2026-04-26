# Backend 业务逻辑总览

`backend/arkham-api` 是 Yesod 应用 + 整个游戏引擎一体的 Haskell 项目。本文按"从外到内"四层梳理它的业务逻辑：平台账号 → 卡库牌组 → 对局生命周期 → 游戏引擎核心，最后再补充横切关注点。

> 路由声明的事实来源：`backend/arkham-api/config/routes`
> 实现入口：`Api/Handler/Arkham/*`、`Base/Api/Handler/*`、`Arkham/*`

## 1. 平台 / 账号（与 Arkham 玩法无关）

实现在 `Base/Api/Handler/`，配套实体在 `Entity/User.hs`、`Entity/PasswordReset.hs`、`Entity/Notification.hs`，鉴权在 `Auth/JWT.hs`。

| 端点 | 功能 |
| --- | --- |
| `POST /api/v1/register` | 注册（bcrypt 哈希），颁发 JWT |
| `POST /api/v1/authenticate` | 登录，颁发 JWT |
| `POST /api/v1/password-reset` | 发起密码重置（生成 token） |
| `PUT  /api/v1/password-reset/:id` | 完成密码重置 |
| `GET  /api/v1/whoami` | 当前用户信息 |
| `PUT  /api/v1/settings` | 用户偏好（目前仅 `beta` 开关） |
| `GET  /api/v1/site-settings` | 站点配置（前端读取 `assetHost` 拼 CDN URL） |
| `GET  /api/v1/notifications` | 用户通知列表 |
| `DELETE /api/v1/account` | 销户 |

JWT 用 HS256 签名，secret 注入自 `config/settings.yml`。

## 2. 卡库 / 调查员 / 牌组

`Api/Handler/Arkham/{Cards,Investigators,Decks}.hs`。游戏开始前的"准备阶段"，与 ArkhamDB / arkham.build 互通。

| 端点 | 功能 |
| --- | --- |
| `GET  /api/v1/arkham/cards` | 全卡库 `CardDef` 列表 |
| `GET  /api/v1/arkham/card/:code` | 按 code 取单张 |
| `GET  /api/v1/arkham/investigators` | 调查员封面图列表 |
| `GET  /api/v1/arkham/decks` | 当前用户的牌组列表 |
| `POST /api/v1/arkham/decks` | 从 ArkhamDB / arkham.build URL 导入牌组 |
| `POST /api/v1/arkham/decks/validate` | 牌组合法性校验（不入库） |
| `GET/DELETE /api/v1/arkham/decks/:id` | 单个牌组 |
| `POST /api/v1/arkham/decks/:id/sync` | 重新拉取 ArkhamDB 同步 |

校验/构筑复用游戏引擎的 `Arkham.Decklist`、`Arkham.DeckBuilding`、`Arkham.Investigator.Deck`。

## 3. 对局生命周期

后端的"主战场"，分三块：房间管理、实时游玩、调试与导入导出。

### 3.1 房间 / 创建 / 加入

`Api/Handler/Arkham/Games.hs`、`PendingGames.hs`，配套实体 `Entity/Arkham/{Game,Player}.hs`。

| 端点 | 功能 |
| --- | --- |
| `GET  /api/v1/arkham/games` | 我参与的房间列表 |
| `POST /api/v1/arkham/games` | 新建对局（multiplayer variant、剧本配置） |
| `GET  /api/v1/arkham/games/:id` | 拉取最新游戏 JSON |
| `DELETE /api/v1/arkham/games/:id` | 解散房间 |
| `GET  /api/v1/arkham/games/:id/spectate` | 观战（只读） |
| `GET/PUT /api/v1/arkham/games/:id/join` | 待入座 / 加入 |
| `GET  /api/v1/arkham/games/:id/open-seats` | 列出空座位 |
| `POST /api/v1/arkham/games/:id/claim-seat` | 占座 |
| `PUT  /api/v1/arkham/games/:id/decks` | 给某个调查员选择牌组 |

### 3.2 实时游玩（WebSocket + Redis Pub/Sub）

核心实现在 `Api/Handler/Arkham/Games/Shared.hs` 的 `updateGame`。流程：

1. 客户端通过 WebSocket 发 `Answer`（玩家在 UI 做出的选择）。
2. `updateGame` 在 `atomicallyWithGame` 锁内运行游戏引擎，把 diff、log、queue 落库（`ArkhamGame` / `ArkhamStep` / `ArkhamLogEntry`）。
3. `publishToRoom` 通过 Redis 把 `GameUpdate` 广播给同房间的所有连接（保证多实例部署也能同步）。
4. 同房间的其他客户端从 WebSocket 收到 diff 后渲染。

Broker 在 `Application.hs` 启动时建立，`InMemory` 或 `RedisBroker` 二选一。

| 端点 | 功能 |
| --- | --- |
| `PUT  /api/v1/arkham/games/:id` | 提交 Answer（玩家选择）—— 真正的游戏推进入口 |
| `PUT  /api/v1/arkham/games/:id/raw` | 直接覆盖 game JSON（debug） |
| `PUT  /api/v1/arkham/games/:id/undo` | 回退一步 |
| `PUT  /api/v1/arkham/games/:id/undo/scenario` | 回退到本剧本起点 |
| `GET  /api/v1/arkham/games/:id/replay/:step` | 拉取指定步骤的快照（前端 Replay 视图） |
| `POST /api/v1/arkham/games/:id/playability` | 给某张牌做"现在能不能打"的可行性检查（每条限制 pass/fail） |
| `POST /api/v1/arkham/games/:id/file-bug` | 把当前 game state 上报为 bug |

落库结构：

- `ArkhamGame` —— 当前 game JSON + step 计数器。
- `ArkhamStep` —— 每一步的 choice / queue / diff（用于回放和撤销）。
- `ArkhamLogEntry` —— 玩家可见事件日志。

### 3.3 调试 / 导入 / 导出

`Api/Handler/Arkham/Game/Debug.hs`、`Old.hs`、`Game/Bug.hs`。

| 端点 | 功能 |
| --- | --- |
| `GET  /api/v1/arkham/games/:id/export` | 导出游戏（部分） |
| `GET  /api/v1/arkham/games/:id/scenario-export` | 仅导出当前剧本 |
| `GET  /api/v1/arkham/games/:id/full-export` | 完整导出 |
| `POST /api/v1/arkham/games/import` | 从 export 文件导入（用于复现 bug） |
| `POST /api/v1/arkham/games/fix` | 跑 migration 把旧格式 game JSON 升级到新版 |
| `GET  /api/v1/arkham/games/reload` / `:id/reload` | 重新加载房间内存 / 清缓存 |
| `GET  /api/v1/arkham/games/old` | 旧版本对局（archived） |

### 3.4 管理员

`Api/Handler/Arkham/Games/Admin.hs`，挂在 `/api/v1/admin/*`：列房间、按 player 找 game、覆盖 game raw、踢房间。

## 4. 游戏引擎核心

`library/Arkham/`（193 个子目录、顶层 ~120 个 `.hs`、`Arkham/Helpers/` 77 个），是整个 backend 真正的"业务逻辑"重心。

不是一组接口，而是一台**消息驱动的状态机**：`Arkham.Game.runMessages` 不断从消息队列取 `Message`、广播给所有相关实体让它们 `runMessage`、产出新消息塞回队列，直到清空。

### 4.1 数据规模（每张卡一个文件，自动 discovery）

| 类型 | 文件数 | 路径 |
| --- | --- | --- |
| Asset（道具/伙伴） | 1083 | `Arkham/Asset/Assets/*.hs` |
| Location | 1013 | `Arkham/Location/Locations/*.hs` |
| Treachery（诡计） | 612 | `Arkham/Treachery/Treacheries/*.hs` |
| Event | 519 | `Arkham/Event/Events/*.hs` |
| Enemy | 505 | `Arkham/Enemy/Enemies/*.hs` |
| Scenario（冒险/剧本） | 120 | `Arkham/Scenario/Scenarios/*.hs` |
| Investigator（调查员） | 104 | `Arkham/Investigator/Investigators/*.hs` |
| Campaign | 10 个大剧本 | `Arkham/Campaigns/{NightOfTheZealot,TheDunwichLegacy,…}` |

合计约 4000 个卡牌文件。新增一张卡只需放 `.hs` 文件 ── `backend/cards-discover` 这个独立可执行文件在编译期作为 build-tool 扫目录、自动生成 re-export 模块，无需手动改 cabal。

`Arkham/Game.hs` 单文件 6353 行，是这台状态机的中央调度。

### 4.2 横切机制（Helpers / 顶层模块）

具体卡牌都调用的"原语层"。

- **回合结构**：Phase（Mythos / Investigation / Enemy / Upkeep）、ActiveCost、Action（Investigate / Fight / Evade / Move / Resign / Parley / Engage）、Window（trigger 时机系统）。
- **检定**：SkillTest、Calculation（数值表达式 DSL）、ChaosBag、ChaosToken、Difficulty、CommitRestriction。
- **战斗**：Attack、Damage、DamageEffect、DamageAssignment、DefeatedBy、Healing。
- **资源/经济**：Cost、Discard、Draw、Discover、Exhaust、Effect / EffectMetadata、Customization。
- **能力 / 触发**：Ability、Capability、Criteria、Matcher、Source、Target。
- **状态**：Game、GameEnv、GameT、GameValue、Field、Entities、Modifier、History、CampaignLog（剧本日志）。
- **DSL / 工具**：Message（核心消息类型，几千个构造子）、Queue、Choose、Choice、ScenarioBuilder。
- **国际化**：`Arkham.I18n`（用 `scope` / `ikey` 拼 vue-i18n 的点号 key），`Arkham.Helpers.FlavorText`（剧情段落 builder）。后端不存任何剧情正文，只产出形如 `"$nightOfTheZealot.theGathering.intro.body"` 的 token，前端按当前语言查 `frontend/src/locales/<lang>/...json`。

### 4.3 周边模块

- **Taboo**：`Arkham.Taboo.*`，FFG 的卡牌平衡补丁。
- **Decklist 校验**：把 ArkhamDB JSON → `Decklist` → 跑一遍 `DeckBuilding` 规则。
- **Playability**：`Helpers.Playable.getPlayabilityChecks`，给一张卡返回每条限制的 pass / fail 详情，前端 hover 调试面板使用。

## 5. 横切关注点

- **持久化**：persistent + esqueleto。所有 SQL 模型在 `Entity/`（`User`、`PasswordReset`、`Notification`、`Answer`、`ArkhamDeck`、`ArkhamGame`、`ArkhamStep`、`ArkhamLogEntry`、`ArkhamPlayer`、`ArkhamDBDecklist`）。迁移走 `migrations/`（sqitch）。
- **Redis Pub/Sub**：`Application.hs` 启动时建 `MessageBroker`（`InMemory` 或 `RedisBroker`），`Games/Shared.hs` 借它在多实例间广播 `GameUpdate`。
- **JWT 鉴权**：`Auth/JWT.hs`，HS256，密钥由 settings 注入。
- **OpenTelemetry tracing**：`Application.hs` 启 SDK + WAI 中间件，`updateGame` 等关键函数显式带 tracer。
- **Bugsnag 错误上报**：使用 `bugsnag-yesod`，自动捕获 handler 异常。
- **`/file-bug`**：玩家碰到游戏 bug 一键打包当前 state 落库，方便 dev 用 `/import` 复现。

## 6. 一句话总览

后端 ＝ 一个普通的 **Yesod CRUD（账号 / 牌组 / 房间）** ＋ 一个 **WebSocket + Redis 实时同步层** ＋ 一台**几万行的消息驱动状态机**（`library/Arkham/` 实现 Arkham Horror LCG 的全部规则和约 4000 张卡牌）。前三层加起来不到 30 个 handler，最后一层占代码量 95% 以上。
