# 大啥杯 DA SHA CUP · 赛事记录站

《明日方舟》集成战略（肉鸽）民间自办赛事的**记录与展示**单页站点。
纯静态、零依赖、零构建、可离线：**双击 `index.html` 就能看**。

- 介绍：大啥杯是什么、怎么打、历届赛制有什么区别
- 记录：两届比赛的全部名次、总分、队员定位标签、个人分、完成结局、官方得分截图
- 名片：全部选手的个人名片原样留存，可搜索、可筛选、可放大，并关联跨届参赛记录

> 本站为民间爱好者作品，与鹰角网络（Hypergryph）无关。
> 《明日方舟》《集成战略》及相关名称、素材版权归鹰角网络所有。

---

## 1. 目录结构

**仓库根目录 = 网站根目录**（直接丢进 nginx / 静态托管即可，无需构建）：

```
dashabei/                   ← 本仓库（线上目录）
├─ index.html               # 页面骨架（五个板块 + 灯箱容器）
├─ styles.css               # 全部样式（主题变量在文件顶部 :root）
├─ app.js                   # 全部逻辑 + FALLBACK_DATA 兜底数据
├─ README.md                # 本文档
├─ .nojekyll                # 让 GitHub Pages 跳过 Jekyll 处理
├─ .gitignore
├─ data/
│  └─ site-data.json        # ★ 唯一数据源
├─ assets/
│  ├─ members/*.jpg         # 11 张个人名片截图
│  └─ cups/*.png            # 2 张杯赛队伍得分截图
├─ deploy/
│  └─ nginx-dashabei.conf   # 云服务器 nginx 站点配置样例
└─ tools/
   ├─ inject-fallback.mjs   # 把 site-data.json 注入 app.js 的 FALLBACK_DATA（幂等）
   └─ deploy.ps1            # scp 一键上线 / 更新（Windows 本地 → 服务器）
```

## 2. 打开方式

| 方式 | 说明 |
| --- | --- |
| 双击 `index.html` | 直接可用。`file://` 下浏览器禁止 `fetch` 本地文件，页面会自动使用 `app.js` 顶部的 `FALLBACK_DATA`，功能完全一致，且不会产生控制台报错 |
| 本地静态服务器（可选） | 在仓库根目录执行 `python -m http.server 8000`，访问 `http://localhost:8000/`，此时会真正读取 `data/site-data.json` |
| 线上 | GitHub Pages：`https://wei-duanmu.github.io/dashabei/`；云服务器：见第 11 节 |

两条路径的数据内容必须一致 —— `tools/inject-fallback.mjs` 就是干这个的（见第 4 节）。

## 3. 数据源字段

`data/site-data.json` 顶层两个数组：`members`（选手名片）、`cups`（届次赛事）。

### members[]（每位选手一条；同一选手多张截图就写多条，靠 `id` 归并）

| 字段 | 说明 | 缺省表现 |
| --- | --- | --- |
| `id` | 唯一标识，`cups` 里的 `memberRef` 指回它 | 必填 |
| `name` | 昵称 | 必填 |
| `code` | 编号（显示为 `#2233`） | — |
| `gameId` | 游戏内 ID | — |
| `title` / `titleEn` | 名片职业标签（助理 / Assistant） | — |
| `operator` / `operatorEn` | 助理干员（蛇屠箱 / Cuora） | — |
| `joinDate` | 入职日（截图没有就写 `null`） | — |
| `birthday` | 生日（仅「溦」有：`11-14`） | — |
| `theme` / `themeEn` | 名片主题中英文（戏中身 / The Scripted） | — |
| `outfitCount` | 时装保有数 | — |
| `recruitProgress` | 雇佣干员进度 | — |
| `signature` | 个性签名（可为 `null`） | — |
| `shot` | 名片截图路径，如 `assets/members/02-lengyiw-2233-battle.jpg` | 占位框（暗色底 + 名片首字） |
| `shotType` | `card`（个人名片页）或 `battle`（战斗结算页） | `card` |

> **同一成员多张截图**：写多条同 `id` 的记录即可（例：冷依w 的 battle + card）。
> 卡片主图自动取 `shotType === 'card'` 的那张，没有 `card` 时回退 `battle`；
> 卡片右上角显示「N 张截图」，灯箱里可以用缩略图 / ← → 切换，主图为 `card` 页。

### cups[]（每届一条）

| 字段 | 说明 |
| --- | --- |
| `index` | 届次序号（决定 Tab 顺序与 `CUP #N` 标签） |
| `name` / `date` / `format` | 届次名 / 日期 / 赛制一句话（显示在 Tab、冠军横幅、赛制对比卡） |
| `shot` | 该届官方队伍得分截图（可选，没有就显示「—」） |
| `teams[]` | 队伍数组：`rank`（名次，决定排序与徽章）、`name`、`total`（总分）、`endings[]`（完成结局）、`members[]` |
| `teams[].members[]` | 队员：`name`、`role`（定位标签，原样显示）、`score`（个人分）、`lane`（赛道，第 2 届那种赛制才有）、`memberRef`（指向 `members[].id`，填了才能关联名片与跨届记录） |

> 第 1 届的队伍位次以 `rank` 为准；两届冠军分差、前两名 10 分分差等文案都由数据实时算出。

## 4. 改完数据后：重新注入 FALLBACK_DATA（重要）

```bash
node tools/inject-fallback.mjs
```

它会把 `data/site-data.json` 原样写进 `app.js` 的 `FALLBACK_DATA` 常量（幂等，重复运行不会叠加），
并回读校验「注入内容 ≡ JSON 文件」。**只改 JSON 不重新注入的话，双击打开（file://）看到的还是旧数据。**

## 5. 新增一届赛事（比如第三届）

1. 把该届的队伍得分截图放进 `assets/cups/`（例如 `cup3-team-scores.png`）。
2. 在 `data/site-data.json` 的 `cups` 数组**末尾追加一个对象**：

```json
{
  "index": 3,
  "name": "大啥杯 #3",
  "date": "2026-xx-xx",
  "format": "赛制一句话，例如 小队赛 · 六赛道各占一人",
  "shot": "assets/cups/cup3-team-scores.png",
  "teams": [
    {
      "rank": 1,
      "name": "队名",
      "total": 12345.6,
      "endings": ["结局A", "结局B"],
      "members": [
        { "lane": "赛道名（没有赛道就省略）", "name": "选手名", "role": "定位标签", "score": 3000, "memberRef": "该选手在 members 里的 id（可选）" }
      ]
    }
  ]
}
```

3. 运行 `node tools/inject-fallback.mjs`。

UI 会自动适配，**不需要改任何代码**：新 Tab、冠军横幅、名次卡片、分数条、结局 chip、统计条、
词云、对比条全部按数据重算。队伍数量、每队人数、`lane` / `endings` 的有无都不影响渲染
（`app.js` 顶部注释里也写了这个扩展点）。

## 6. 新增一位选手 / 一张名片

1. 截图丢进 `assets/members/`，文件名建议 `序号-昵称-id.jpg`（与现有风格一致即可）。
2. 在 `members` 数组追加一条（字段见第 3 节；某一选手的第二张截图就用**同一个 `id`** 再写一条）。
3. 如果这位选手有参赛成绩，在该届的 `teams[].members[]` 里加上 `memberRef` 指向他的 `id` ——
   这样选手页才会显示「参赛 N 次 / 累计 X 分」以及灯箱里的跨届参赛记录。
4. 运行 `node tools/inject-fallback.mjs`。

## 7. 补充「关于赛事」里的 `待补充` 字段

你（组织者）才知道的赛事起源、发起人、报名方式、计分细则等，刻意没有编造，都留成了占位：

- 打开 `index.html`，搜索 `待补充`（约 6 处）。
- 直接改写对应文本即可，例如把
  `<span class="tbd" data-field="赛事发起人">待补充</span>` 换成 `老王`；
- 想整段换掉可以直接删掉 `<span class="tbd">` 只保留文字，或把整个 `<dl class="tbd-list">` 换成自由段落。
- 样式表里 `.tbd` 控制占位符外观（琥珀色虚线框），不再需要时可以从 CSS 里一起删掉。

## 8. 视觉规范速查（`styles.css` 顶部 `:root`）

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--bg` / `--bg-1` / `--bg-2` | `#0a0c10` / `#11151c` / `#161b24` | 深黑蓝底色分层 |
| `--amber` | `#e8a33d` | 主强调：分数、冠军、高亮 |
| `--cyan` | `#4fc3d9` | 次强调：链接、数据、交互态 |
| `--rust` | `#c8443c` | 危险 / 届次区分色（#1 用锈红、#2 用冷青） |
| `--tx` / `--tx-2` / `--tx-3` | `#e8e6e1` / `#8b8f96` / `#4a4f57` | 主文本 / 次文本 / 禁用 |
| `--cut` / `--cut-sm` | `14px` / `8px` | 45° 切角尺寸（`clip-path`） |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | 统一缓动（分数条 800ms） |

其他约定：标题用 `--font-cn` 粗体大字距，数字/ID 用 `--font-mono` + `tabular-nums`；
细噪点与扫描线是 `body::before/::after` 的内联 SVG / repeating-gradient；
`@media (prefers-reduced-motion: reduce)` 下所有动画与轮播关闭。

## 9. 交互一览

- 滚动入场：`IntersectionObserver`（无 scroll 事件轮询）；分数条 0 → 目标值 800ms 生长
- 榜单：届次 Tab 切换（`←/→` 键也可切换、翻转动效）、冠军横幅光扫过、卡片点击展开官方得分截图与队员明细、截图点击放大
- 选手：昵称 / 编号 / ID / 定位 实时模糊搜索；美愿 / 死仇 / 新能开 / 其他 分组筛选；卡片回车或点击打开灯箱
- 灯箱：`Esc` 关闭、点遮罩关闭、`←/→` 切换同成员多图、缩略图直达、焦点可回退
- 响应式：≥1200 四列 / 768–1199 三列 / 480–767 两列 / <480 单列；移动端榜单自动变紧凑纵向
- 图片：首屏 `loading="eager"`，其余 `loading="lazy"`；加载失败显示暗色占位框 + 名片首字，不出现破图图标

## 10. 交付前自检结果

在 Edge（Chromium 154）无头浏览器中以 `file://` 打开真实页面、逐条断言，共 **90 项全部通过、控制台 0 报错**，
包含：两届 7 支队伍与 28 条个人分逐条比对、特殊字符昵称（`Jiu.`、`~~`、`Pλn!!`）完整渲染、
`#5895` 昵称为「溦」且全站不再出现「漱」、
冷依w 双截图与「参赛 2 次 / 累计 6318 分」、千分位与小数（`12,062.8`、`6,184.6`）、
搜索/筛选、灯箱开关与 `Esc`、375px 无横向滚动、`prefers-reduced-motion` 降级、四种宽度列数。
验收脚本与截图存档在仓库外的 `_verify/`（不属于本仓库内容，可删）。

> 关于首屏数字：三个数据块全部由数据实时统计 —— **2 届 / 7 支队伍 / 11 张名片**
> （`members.length` = 11；其中冷依w 一人两张，去重后为 10 位选手）。
> 连同 2 张官方队伍得分截图，本站共收录 13 张图，首屏第三块的小字会写明
> `10 PLAYERS · 11 CARDS · 2 SCORE SHOTS`，新增数据后自动更新，不会写死。

## 11. 部署

### 11.1 GitHub（代码托管 + Pages 备用入口）

- 仓库：<https://github.com/Wei-DuanMu/dashabei>
- 线上（GitHub Pages，分支 `main` 根目录，`.nojekyll` 已就位）：<https://wei-duanmu.github.io/dashabei/>
- 更新即上线：`git push` 后 Pages 会在 1 分钟内自动重建，无需任何构建步骤。

```bash
git add -A
git commit -m "data: 更新赛事数据"
git push
```

### 11.2 云服务器（nginx，首次部署）

1. **装公钥**（本地生成 `~/.ssh/dashabei_deploy`，把 `.pub` 内容装到服务器）：

   ```bash
   ssh -p <端口> <用户>@<服务器IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && \
     echo '<把 dashabei_deploy.pub 的内容贴在这里>' >> ~/.ssh/authorized_keys && \
     chmod 600 ~/.ssh/authorized_keys"
   ```

2. **建站点目录**：

   ```bash
   sudo mkdir -p /var/www/dashabei && sudo chown -R $USER /var/www/dashabei
   ```

3. **放 nginx 配置**：把 `deploy/nginx-dashabei.conf` 传到 `/etc/nginx/conf.d/dashabei.conf`，
   改掉里面的 `server_name`（你的域名/IP）与 `root`，然后：

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **上传站点文件**（Windows 本地，只传站点需要的文件，不传 tools/deploy/README/.git）：

   ```powershell
   pwsh -File tools/deploy.ps1 -Server <服务器IP> -User root -Target /var/www/dashabei
   pwsh -File tools/deploy.ps1 -Server <服务器IP> -Target /var/www/dashabei -DryRun   # 只看要传什么
   ```

5. **上 HTTPS**（有域名的前提下）：

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d 你的域名
   ```

### 11.3 日常更新（一条龙）

```bash
# 1) 改数据：data/site-data.json（新增一届 / 新增名片，字段见第 3、5、6 节）
# 2) 重新注入兜底数据（★ 必做，否则 file:// 打开看到的还是旧数据）
node tools/inject-fallback.mjs
# 3) 本地双击 index.html 确认无误
# 4) 提交并推送（GitHub Pages 自动更新）
git add -A && git commit -m "data: 新增第三届" && git push
# 5) 同步到云服务器
pwsh -File tools/deploy.ps1 -Server <服务器IP> -User root -Target /var/www/dashabei
```
