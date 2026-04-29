# 本地前端 + 远端 Docker 后端开发流程

本文档记录如何在本机跑 Vite 前端、连接远端机器（192.168.7.4）上的 Docker 后端进行开发调试。

## 前置条件

- 远端机器（192.168.7.4）已经跑起 `docker compose up -d db web`
- 本机能 SSH 到远端：`ssh root@192.168.7.4`
- 本机已装 Node.js（推荐 v18+）

---

## 一次性准备（首次或依赖变更时）

```bash
cd /Users/asd/work/github/ArkhamHorror/frontend
npm install
```

---

## 每次开发时的启动流程

### 1. 确认远端 Docker 服务在跑

在**本机**终端执行：

```bash
ssh root@192.168.7.4 'cd ~/arkham-horror && docker compose ps'
```

期望看到 `db` 和 `web` 都是 `Up` 状态。如果没起，远端执行：

```bash
ssh root@192.168.7.4 'cd ~/arkham-horror && docker compose up -d db web'
```

### 2. 开 SSH 隧道（常驻窗口）

新开一个**本机终端窗口**，执行：

```bash
ssh -N -L 3002:localhost:3000 root@192.168.7.4
```

- `-N` 只开隧道、不开 shell
- `-L 3002:localhost:3000` 把本机 `:3002` 转发到远端 `localhost:3000`（Docker web 容器端口）
- 命令无输出，**保持窗口开着**；要断开按 `Ctrl-C`

> **验证隧道通了**（另开终端）：
> ```bash
> curl -i http://localhost:3002/health
> ```
> 应返回 `HTTP/1.1 200 OK`。

### 3. 启动 Vite 前端

新开一个**本机终端窗口**，执行：

```bash
cd /Users/asd/work/github/ArkhamHorror/frontend
npm run serve
```

启动成功后会看到：

```
  VITE v5.x  ready in xxx ms
  ➜  Local:   http://localhost:8080/
```

### 4. 浏览器访问

1. 打开 `http://localhost:8080`
2. 注册账号 → 登录 → 新建战役 → 进入游戏画面
3. **查看新 UI**：在 URL 末尾加 `?newui=1`（如 `http://localhost:8080/game/<id>?newui=1`）

---

## 常见问题

| 现象 | 原因 | 解决 |
|------|------|------|
| `curl localhost:3002/health` 连不上 | SSH 隧道没开或断了 | 检查步骤 2 的终端窗口是否还在；重新执行 `ssh -N -L ...` |
| Vite 启动报 `EADDRINUSE :8080` | 8080 端口被占 | `lsof -ti:8080 \| xargs kill` 或换端口 `npm run serve -- --port 8081` |
| 游戏页 WebSocket 连不上 | vite.config.js 的 proxy 配置有问题 | 确认 `vite.config.js` 里 `proxy` 的 `target` 是 `http://127.0.0.1:3002`（不是 3000） |
| 远端 Docker 容器挂了 | 数据库初始化失败 / 密码文件权限问题 | 远端执行 `docker compose logs web` 查看日志；如需重置：`docker compose down -v && docker compose up -d` |

---

## 关闭流程

1. **Vite 窗口**：按 `Ctrl-C` 停止
2. **SSH 隧道窗口**：按 `Ctrl-C` 断开
3. **远端 Docker**（可选，如果不想一直跑）：
   ```bash
   ssh root@192.168.7.4 'cd ~/arkham-horror && docker compose down'
   ```

---

## 为什么用 SSH 隧道而不是直接连远端 IP

| 方案 | 优点 | 缺点 |
|------|------|------|
| SSH 隧道（推荐） | 不用改代码、不用开防火墙、流量加密 | 多开一个终端窗口 |
| 直接连远端 IP | 少一个窗口 | 要改 `vite.config.js`、要开防火墙 3000 端口、明文传输 |

---

## 附：远端 Docker 初始化（仅首次）

如果远端还没部署过，在**远端机器**执行：

```bash
mkdir -p ~/arkham-horror/config
cd ~/arkham-horror
curl -fsSL https://raw.githubusercontent.com/halogenandtoast/ArkhamHorror/main/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/halogenandtoast/ArkhamHorror/main/setup.sql -o setup.sql
openssl rand -hex 32 > config/postgres_password.txt
chmod 644 config/postgres_password.txt
docker compose up -d db web
```

验证：

```bash
docker compose ps
docker compose logs --tail=20 web
curl -i http://localhost:3000/health
```

应看到 `db` 和 `web` 都 `Up`，`/health` 返回 200。
