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
│  ├─ nginx-dashabei.conf   # 云服务器 nginx 站点配置样例
│  ├─ setup-ubuntu.sh       # 服务器初始化（装 nginx + 配站点，幂等）
│  └─ enable-https.sh       # 域名解析后一键上 HTTPS（certbot + 80→443）
└─ tools/
   ├─ inject-fallback.mjs   # 把 site-data.json 注入 app.js 的 FALLBACK_DATA（幂等）
   └─ deploy.ps1            # scp 一键上线 / 更新 + 远端权限修正（Windows 本地 → 服务器）
```

## 2. 打开方式

| 方式 | 说明 |
| --- | --- |
| 双击 `index.html` | 直接可用。`file://` 下浏览器禁止 `fetch` 本地文件，页面会自动使用 `app.js` 顶部的 `FALLBACK_DATA`，功能完全一致，且不会产生控制台报错 |
| 本地静态服务器（可选） | 在仓库根目录执行 `python -m http.server 8000`，访问 `http://localhost:8000/`，此时会真正读取 `data/site-data.json` |
| 线上 | 云服务器：<http://47.242.90.95/>；GitHub Pages 备用：<https://wei-duanmu.github.io/dashabei/>（详见第 11 节） |

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
| `teams[].members[]` | 队员：`name`、`role`（定位标签，原样显示）、`score`（个人分）、`lane`（赛道，四条赛道那种赛制才有，可省略）、`memberRef`（指向 `members[].id`，填了才能关联名片与跨届记录） |

> 队伍位次以 `rank` 字段为准（`#0` / `#1` 两届都是）；两届冠军分差、前两名 10 分分差等文案都由数据实时算出。
> **届次号从 `#0` 开始**是有意为之（第 0 届 = 最初那届），`index` 字段就是届次号，所以排序与显示都用 0/1；
> 不要假设它是 1 起的，代码里也没有任何「index === 1」之类的判断。

## 4. 改完数据后：重新注入 FALLBACK_DATA（重要）

```bash
node tools/inject-fallback.mjs
```

它会把 `data/site-data.json` 原样写进 `app.js` 的 `FALLBACK_DATA` 常量（幂等，重复运行不会叠加），
并回读校验「注入内容 ≡ JSON 文件」。**只改 JSON 不重新注入的话，双击打开（file://）看到的还是旧数据。**

## 5. 新增一届赛事（当前收录 `#0` / `#1`，下一届就是 `#2`）

1. 把该届的队伍得分截图放进 `assets/cups/`（例如 `cup2-team-scores.png`）。
2. 在 `data/site-data.json` 的 `cups` 数组**末尾追加一个对象**（`index` 就是届次号，从 0 起，界面上显示为 `大啥杯 #N`）：

```json
{
  "index": 2,
  "name": "大啥杯 #2",
  "date": "2025 年春节",
  "format": "赛制一句话，例如 小队赛 · 六赛道各占一人",
  "shot": "assets/cups/cup2-team-scores.png",
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

## 7. 「关于赛事」信息的修改位置（已由组织者填好）

`index.html` 的 `.tbd-list` 里现在填的是组织者提供的真实信息（改写就改这几行）：

| 字段 | 当前值 |
| --- | --- |
| 赛事发起人 | 溦 和 冷依w |
| 首届开赛日期 | 2023 年寒假 |
| 赛事群 / 报名方式 | 大啥杯内部报名微信群 |
| 举办频率 | 一年两到三次 |
| 计分与判定规则 | 以当期大啥杯比赛规则为准 |

「怎么打」面板底部的「详细规则文本」同样是「以当期大啥杯比赛规则为准」。

「赛事发起人」里的 **溦** 和 **冷依w** 是可点链接，点击直接打开对应选手的名片灯箱
（HTML 里写成 `href="#players"` + `data-member-link="选手id"`，所以没有 JS 时会退化为跳到选手名录，不会变死链；
新增发起人只要照抄这个格式，`data-member-link` 填 `members[].id`）。

> 以后再有不确定、需要留白的字段，把那行写成 `<span class="tbd" data-field="字段名">待补充</span>`
> 就会自动套上琥珀色虚线占位样式（`.tbd`，样式在 `styles.css` 里，规则说明小字用 `.note-rule`）。

## 8. 视觉规范速查（`styles.css` 顶部 `:root`）

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--bg` / `--bg-1` / `--bg-2` | `#0a0c10` / `#11151c` / `#161b24` | 深黑蓝底色分层 |
| `--amber` | `#e8a33d` | 主强调：分数、冠军、高亮 |
| `--cyan` | `#4fc3d9` | 次强调：链接、数据、交互态 |
| `--rust` | `#c8443c` | 危险 / 届次区分色（第 1 张赛制卡用锈红、第 2 张用冷青，按展示顺序交替） |
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

用 Edge（Chromium 154）无头浏览器跑了**两种环境的完整验收**：本地 `file://`（双击打开、走 `FALLBACK_DATA`）
与线上 `http://47.242.90.95/`（走真实 `fetch('data/site-data.json')`），两遍均**全部通过、控制台 0 报错**，
覆盖：两届 7 支队伍与 28 条个人分逐条比对、特殊字符昵称（`Jiu.`、`~~`、`Pλn!!`）完整渲染、
`#5895` 昵称为「溦」且全站不再出现「漱」、组织者信息（发起人/首届/报名方式/频率/规则）已填入页面且无残留「待补充」、
冷依w 双截图与「参赛 2 次 / 累计 6318 分」、千分位与小数（`12,062.8`、`6,184.6`）、
搜索/筛选、灯箱开关与 `Esc`、375px 无横向滚动、`prefers-reduced-motion` 降级、四种宽度列数。
线上还额外比对了 9 个资源的 **SHA256 与本地逐字节一致**。

> 关于首屏数字：三个数据块全部由数据实时统计 —— **2 届 / 7 支队伍 / 11 张名片**
> （`members.length` = 11；其中冷依w 一人两张，去重后为 10 位选手）。
> 连同 2 张官方队伍得分截图，本站共收录 13 张图，首屏第三块的小字会写明
> `10 PLAYERS · 11 CARDS · 2 SCORE SHOTS`，新增数据后自动更新，不会写死。

## 11. 部署

### 11.1 线上地址

| 入口 | 地址 | 说明 |
| --- | --- | --- |
| 云服务器（主） | <http://47.242.90.95/> | 阿里云香港 · Ubuntu 22.04 · nginx 1.18 · 站点目录 `/var/www/dashabei` |
| GitHub 仓库 | <https://github.com/Wei-DuanMu/dashabei> | 代码托管（public） |
| GitHub Pages（备用） | <https://wei-duanmu.github.io/dashabei/> | 分支 `main` 根目录，`.nojekyll` 已就位，`git push` 后 1 分钟内自动重建 |

### 11.2 服务器是怎么装起来的（可复现）

服务器初始化脚本已进仓库：`deploy/setup-ubuntu.sh`（幂等，可反复执行）。在一台新的 Ubuntu 22.04/24.04 上：

```bash
# 传上去后执行（root 直接 bash，非 root 用 sudo bash）
bash setup-ubuntu.sh
```

它会：装 nginx（默认源不可用时自动切阿里云内网镜像）→ 建 `/var/www/dashabei` →
写 `/etc/nginx/sites-available/dashabei`（作为 80 的 `default_server`，所以**用 IP 也能直接访问**）→
关掉发行版默认站点 → 放行 ufw 的 80/443（如启用）→ `nginx -t` 校验并启动 → 本机 curl 自检。

> 有域名后：把配置里的 `server_name _;` 改成域名，再执行
> `sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d 你的域名` 即可上 HTTPS。

### 11.3 上传 / 更新站点文件

```powershell
powershell -File tools\deploy.ps1 -Server 47.242.90.95 -User root -Target /var/www/dashabei
powershell -File tools\deploy.ps1 -Server 47.242.90.95 -Target /var/www/dashabei -DryRun   # 只看要传什么
```

脚本做三件事：`mkdir -p` 站点目录 → `scp` 上传（只传站点需要的 6 项，不传 tools/deploy/README/.git）→
**修正远端权限（目录 755 / 文件 644）并自检**。

两个已经踩过、并已写进脚本的坑：

1. **`pwsh` 不在 PATH** —— 用 Windows 自带的 `powershell`（脚本存为 UTF-8 **with BOM**，5.1 才会正确读中文）。
2. **`scp -r` 从 Windows 上传的目录默认是 `drwx------`** —— nginx 的 `www-data` 进不去，
   `try_files` 会返回 404（现象：文件明明传上去了却打不开）。脚本第 3 步会统一 `chmod 755` 目录、`chmod 644` 文件。

### 11.5 上 HTTPS（等域名解析生效后，一条命令）

域名还在申请中。拿到域名后：先把 A 记录指向 `47.242.90.95`（阿里云安全组已放行 80/443），然后：

```bash
# 在服务器上执行（把脚本传上去：scp deploy/enable-https.sh root@47.242.90.95:/tmp/）
sudo bash /tmp/enable-https.sh 你的域名.com 你的邮箱@example.com
```

脚本会：校验域名解析 → 把 nginx 的 `server_name _;` 改成你的域名 → 装 certbot →
申请 Let's Encrypt 证书 → 自动改写为 443 并把 80 跳转到 443 → curl 自检 → 打印证书到期日与续期定时器。
（不想填邮箱就去掉第二个参数。）完成后把本文档第 11.1 节的地址换成 `https://你的域名/`。

### 11.6 日常更新（一条龙）

```bash
# 1) 改数据：data/site-data.json（新增一届 / 新增名片，字段见第 3、5、6 节）
# 2) 重新注入兜底数据（★ 必做，否则 file:// 打开看到的还是旧数据）
node tools/inject-fallback.mjs
# 3) 本地双击 index.html 确认无误
# 4) 提交并推送（GitHub Pages 自动更新）
git add -A && git commit -m "data: 新增第三届" && git push
# 5) 同步到云服务器（自动修权限 + 自检）
powershell -File tools\deploy.ps1 -Server 47.242.90.95 -User root -Target /var/www/dashabei
```
