/* =============================================================================
   大啥杯 DA SHA CUP · app.js
   -----------------------------------------------------------------------------
   ★ 扩展点（新增一届赛事）★
   新增一届赛事只需在 data/site-data.json 的 `cups` 数组中追加一个对象，
   字段结构如下（缺字段自动显示为 —，UI 会自动适配不同队伍数 / 成员数 / 字段）：
     {
       "index": 3,                          // 届次序号，用于 Tab 排序与 #CUP 标签
       "name": "大啥杯 #3",                  // 届次名
       "date": "2026-xx-xx",                // 比赛日期
       "format": "赛制一句话描述",
       "shot": "assets/cups/cup3-team-scores.png",   // 官方队伍得分截图（可省略）
       "teams": [
         { "rank": 1, "name": "队名", "total": 12345.6,
           "endings": ["结局A", "结局B"],
           "members": [
             { "lane": "赛道名（第 2 届那种赛制才有，可省略）",
               "name": "选手名", "role": "定位标签", "score": 3000,
               "memberRef": "members 里的 id（可选，填了就能关联到选手名片）" }
           ] }
       ]
     }
   同时把新增的队伍得分截图放进 assets/cups/，把新增选手名片与条目加进 members 即可。
   本文件顶部的 FALLBACK_DATA 是 data/site-data.json 的完整副本，
   用于 file:// 协议下（浏览器禁止 fetch 本地文件）离线打开时兜底 —— 两者内容必须一致。
   ============================================================================= */
'use strict';

/* ========================== 1. 兜底数据（与 data/site-data.json 完全一致） ========================== */
/* 该常量由构建脚本（tools/inject-fallback.mjs）从 data/site-data.json 原样注入，勿手改；改数据请改 JSON 后重新注入。 */
const FALLBACK_DATA = /*__FB_START__*/{
  "site": {
    "name": "大啥杯",
    "subtitle": "DA SHA CUP",
    "tagline": "方舟肉鸽非官方自娱自乐赛事",
    "description": "大啥杯是民间自发组织的《明日方舟》集成战略（肉鸽）赛事，记录队伍成绩、参赛选手与个人名片。",
    "version": "1.0.0"
  },
  "members": [
    {
      "id": "daoyangbang",
      "name": "道安杨",
      "code": "#3734",
      "gameId": "779443278",
      "title": "助理",
      "titleEn": "Assistant",
      "operator": "蛇屠箱",
      "operatorEn": "Cuora",
      "joinDate": "2019-07-31",
      "theme": "FLOT",
      "outfitCount": 124,
      "recruitProgress": 325,
      "signature": "不想玩啦",
      "shot": "assets/members/01-daoyangbang-3734.jpg",
      "shotType": "card"
    },
    {
      "id": "lengyiw",
      "name": "冷依w",
      "code": "#2233",
      "gameId": "384614923",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2020-01-14",
      "theme": "戏中身",
      "themeEn": "The Scripted",
      "outfitCount": 232,
      "recruitProgress": 403,
      "signature": "弦宝",
      "shot": "assets/members/02-lengyiw-2233-battle.jpg",
      "shotType": "battle"
    },
    {
      "id": "lengyiw",
      "name": "冷依w",
      "code": "#2233",
      "gameId": "384614923",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2020-01-14",
      "theme": "戏中身",
      "themeEn": "The Scripted",
      "outfitCount": 232,
      "recruitProgress": 403,
      "signature": "弦宝",
      "shot": "assets/members/07-lengyiw-2233-card.jpg",
      "shotType": "card"
    },
    {
      "id": "yancheng",
      "name": "言诚",
      "code": "#2427",
      "gameId": "58787918",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2019-05-30",
      "theme": "永恒的演出",
      "themeEn": "The Eternal Show",
      "outfitCount": 254,
      "recruitProgress": 405,
      "signature": "此处并无正义，唯有前路。",
      "shot": "assets/members/03-yancheng-2427.jpg",
      "shotType": "card"
    },
    {
      "id": "shanluan",
      "name": "山峦为晴雪所洗",
      "code": "#8648",
      "gameId": "260769724",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": null,
      "theme": "冰纹玉袖",
      "themeEn": "Glazed Grace",
      "outfitCount": 170,
      "recruitProgress": 379,
      "signature": "天长地久有时尽",
      "shot": "assets/members/04-shanluan-8648.jpg",
      "shotType": "card"
    },
    {
      "id": "guzhang",
      "name": "骨杖技师人宿逻",
      "code": "#7171",
      "gameId": "839632868",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2021-05-09",
      "theme": "永恒的演出",
      "themeEn": "The Eternal Show",
      "outfitCount": 177,
      "recruitProgress": 391,
      "signature": null,
      "shot": "assets/members/05-guzhang-7171.jpg",
      "shotType": "card"
    },
    {
      "id": "qiongyang",
      "name": "琼羊",
      "code": "#0255",
      "gameId": "368018874",
      "title": "助理",
      "titleEn": "Assistant",
      "operator": "蕾缪安",
      "operatorEn": "Lemuen",
      "joinDate": "2021-02-15",
      "theme": null,
      "themeEn": null,
      "outfitCount": 173,
      "recruitProgress": 382,
      "signature": "人心，向背无常",
      "shot": "assets/members/06-qiongyang-0255.jpg",
      "shotType": "card"
    },
    {
      "id": "shaoyafan",
      "name": "烧鸭饭",
      "code": "#5483",
      "gameId": "14745955",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2019-05-13",
      "theme": "永恒的演出",
      "themeEn": "The Eternal Show",
      "outfitCount": 204,
      "recruitProgress": 387,
      "signature": "天地让我形色！",
      "shot": "assets/members/08-shaoyafan-5483.jpg",
      "shotType": "card"
    },
    {
      "id": "hanyushiqi",
      "name": "涵与十七",
      "code": "#6154",
      "gameId": "532963658",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2022-08-24",
      "theme": "时序花园",
      "themeEn": "Blooms of Time",
      "outfitCount": 193,
      "recruitProgress": 375,
      "signature": "来了！",
      "shot": "assets/members/09-hanyushiqi-6154.jpg",
      "shotType": "card"
    },
    {
      "id": "jay",
      "name": "Jay",
      "code": "#8562",
      "gameId": "5296623599",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": "2021-01-09",
      "theme": "一起去狩猎啦！",
      "themeEn": "Happy Hunting!",
      "outfitCount": 284,
      "recruitProgress": 402,
      "signature": "我是老醋的狗",
      "shot": "assets/members/10-jay-8562.jpg",
      "shotType": "card"
    },
    {
      "id": "shu",
      "name": "溦",
      "code": "#5895",
      "gameId": "663235928",
      "title": null,
      "titleEn": null,
      "operator": null,
      "operatorEn": null,
      "joinDate": null,
      "birthday": "11-14",
      "theme": "渡星客",
      "themeEn": "Night Watcher",
      "outfitCount": 190,
      "recruitProgress": 363,
      "signature": "随风入夜，润物无声",
      "shot": "assets/members/11-shu-5895.jpg",
      "shotType": "card"
    }
  ],
  "cups": [
    {
      "index": 1,
      "name": "大啥杯 #1",
      "date": "2026-06-08",
      "format": "4 人小队 · 同一剧本分工",
      "shot": "assets/cups/cup1-team-scores.png",
      "teams": [
        {
          "rank": 1,
          "name": "四不过四队",
          "total": 12062.8,
          "endings": [
            "紧急授课",
            "朝竭",
            "圣域",
            "不容拒绝"
          ],
          "members": [
            {
              "name": "百川之海",
              "role": "高规格美愿",
              "score": 1966
            },
            {
              "name": "林锣绸缎",
              "role": "祖医美愿",
              "score": 1560
            },
            {
              "name": "先志",
              "role": "点刺死仇",
              "score": 3527
            },
            {
              "name": "团队位",
              "role": "蓝图死仇",
              "score": 3546
            }
          ]
        },
        {
          "rank": 2,
          "name": "只因酒之杯队",
          "total": 12052.8,
          "endings": [
            "紧急授课",
            "朝竭",
            "授法"
          ],
          "members": [
            {
              "name": "冷依w",
              "role": "木特美愿",
              "score": 3170,
              "memberRef": "lengyiw"
            },
            {
              "name": "Oblivionis",
              "role": "蓝图死仇",
              "score": 3427
            },
            {
              "name": "道安杨",
              "role": "神人美愿",
              "score": 1677,
              "memberRef": "daoyangbang"
            },
            {
              "name": "团队位",
              "role": "拟态涂鸦",
              "score": 2676
            }
          ]
        },
        {
          "rank": 3,
          "name": "以大翔击碎奎隆队",
          "total": 8411.3,
          "endings": [
            "紧急授课",
            "朝竭",
            "圣域",
            "别无所求"
          ],
          "members": [
            {
              "name": "Ayanami",
              "role": "祖医美愿",
              "score": 1981
            },
            {
              "name": "哀珐迩尔的骨笔",
              "role": "蓝图死仇",
              "score": 2036
            },
            {
              "name": "落叶解三秋",
              "role": "木特美愿",
              "score": 2277
            },
            {
              "name": "团队位",
              "role": "近锋皇冠",
              "score": 1321
            }
          ]
        },
        {
          "rank": 4,
          "name": "Ciallo猫懿锣队",
          "total": 6184.6,
          "endings": [
            "紧急授课",
            "圣域"
          ],
          "members": [
            {
              "name": "Pλn!!",
              "role": "祖医死仇",
              "score": 2128
            },
            {
              "name": "7929",
              "role": "木特死仇",
              "score": 1387
            },
            {
              "name": "倒春仰寒",
              "role": "近锋美愿",
              "score": 517
            },
            {
              "name": "团队位",
              "role": "蓝图美愿",
              "score": 1502
            }
          ]
        }
      ]
    },
    {
      "index": 2,
      "name": "大啥杯 #2",
      "date": "2026-06-09",
      "format": "小队赛 · 四条赛道各占一人",
      "shot": "assets/cups/cup2-team-scores.png",
      "teams": [
        {
          "rank": 1,
          "name": "冠军厨小队",
          "total": 11477,
          "endings": [
            "认知即重担",
            "虚无不俱",
            "时光之沙",
            "朝竭",
            "圣域",
            "不容拒绝",
            "别无所求"
          ],
          "members": [
            {
              "lane": "水月与深蓝之树",
              "name": "激什戴尔",
              "role": "心胜维开",
              "score": 2260
            },
            {
              "lane": "探索者的根松止境",
              "name": "冷依w",
              "role": "木特新能开",
              "score": 3148,
              "memberRef": "lengyiw"
            },
            {
              "lane": "萨卡兹的无终奇语",
              "name": "归化方人迦",
              "role": "点刺死仇新能开",
              "score": 3408
            },
            {
              "lane": "倪影与猩红孤钻",
              "name": "啊噗嚕苹果香蕉派",
              "role": "木特新能开",
              "score": 2311
            }
          ]
        },
        {
          "rank": 2,
          "name": "不会为时代儿队",
          "total": 10728,
          "endings": [
            "命运的宠儿",
            "深寒造像",
            "迈入永恒",
            "别无所求"
          ],
          "members": [
            {
              "lane": "水月与深蓝之树",
              "name": "静谧的星之森",
              "role": "人本新能开",
              "score": 2303
            },
            {
              "lane": "探索者的根松止境",
              "name": "Jiu.",
              "role": "科学新能开",
              "score": 3605
            },
            {
              "lane": "萨卡兹的无终奇语",
              "name": "那一天的松鼠，掉构想求~~",
              "role": "拟态死仇新能开",
              "score": 2058
            },
            {
              "lane": "倪影与猩红孤钻",
              "name": "ihtw",
              "role": "祖医谜迭香岳",
              "score": 2562
            }
          ]
        },
        {
          "rank": 3,
          "name": "甜品咕SP+1队",
          "total": 9701,
          "endings": [
            "深寒造像",
            "时光之沙",
            "朝竭",
            "别无所求"
          ],
          "members": [
            {
              "lane": "水月与深蓝之树",
              "name": "咕咕嘎嘎",
              "role": "心胜维开",
              "score": 1376
            },
            {
              "lane": "探索者的根松止境",
              "name": "px",
              "role": "科学新能开",
              "score": 3475
            },
            {
              "lane": "萨卡兹的无终奇语",
              "name": "Sunriser05",
              "role": "神人美愿",
              "score": 2325
            },
            {
              "lane": "倪影与猩红孤钻",
              "name": "比起大锁更爱吃甜品的教宗阁下",
              "role": "木特水月开",
              "score": 2157
            }
          ]
        }
      ]
    }
  ]
}/*__FB_END__*/;

const SITE_DATA_URL = 'data/site-data.json';

/* ========================== 2. 小工具 ========================== */
const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/** 缺字段统一显示为 —，绝不写死占位文字 */
const dash = (v) => (v == null || v === '' ? '—' : String(v));
/** 数字格式化：整数加千分位，小数保留原样（最多一位）并加千分位 */
function fmtNum(n) {
  if (n == null || n === '' || isNaN(Number(n))) return '—';
  const num = Number(n);
  const hasFrac = Math.abs(num % 1) > 1e-9;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: hasFrac ? 1 : 0,
    maximumFractionDigits: hasFrac ? 1 : 0
  });
}
/** 取首字（中文取第一个字，拉丁取首字母大写）用于图片兜底占位 */
function firstChar(name) {
  const s = String(name || '◤').trim();
  return s ? s.charAt(0).toUpperCase() : '◤';
}
const reducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* ========================== 3. 数据装载 ========================== */
async function loadData() {
  // file:// 协议下浏览器会禁止 fetch 本地文件（CORS），此时直接使用内置兜底数据，
  // 这样双击 index.html 打开时既不会报错、也不会在控制台留下失败的请求记录。
  if (location.protocol === 'file:') return FALLBACK_DATA;
  try {
    const res = await fetch(SITE_DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (!json || !Array.isArray(json.members) || !Array.isArray(json.cups)) {
      throw new Error('数据结构不符合预期');
    }
    return json;
  } catch (err) {
    console.info('[大啥杯] data/site-data.json 不可用，已切换至内置 FALLBACK_DATA：', err && err.message);
    return FALLBACK_DATA;
  }
}

/* ========================== 4. 数据整理 ========================== */
function prepare(raw) {
  const site = raw.site || {};
  const cups = (raw.cups || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0));
  cups.forEach(c => {
    c.teams = (c.teams || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));
  });

  // 同一成员可能有多条记录（例如 冷依w 的 battle 结算页 + card 个人名片页），按 id 归并
  const order = [];
  const byId = Object.create(null);
  (raw.members || []).forEach((m, i) => {
    if (!m || !m.id) return;
    if (!byId[m.id]) {
      const merged = Object.assign({}, m);
      merged.shots = [];
      merged.records = [];
      merged.roles = [];
      merged.lanes = [];
      merged.totalScore = 0;
      byId[m.id] = merged;
      order.push(m.id);
    }
    byId[m.id].shots.push({
      src: m.shot,
      type: m.shotType || 'card',
      order: i
    });
  });

  const members = order.map(id => byId[id]);
  members.forEach(m => {
    // 主图优先 card（个人名片页），没有 card 时回退 battle（战斗结算页）
    m.shots.sort((a, b) => (a.type === 'card' ? 0 : 1) - (b.type === 'card' ? 0 : 1) || a.order - b.order);
    const card = m.shots.find(s => s.type === 'card');
    m.primaryShot = (card || m.shots[0] || {}).src || '';
    m.primaryShotType = card ? 'card' : ((m.shots[0] || {}).type || 'card');
  });

  // 参赛记录（通过 memberRef 关联回成员）
  cups.forEach(cup => {
    cup.teams.forEach(team => {
      (team.members || []).forEach(entry => {
        if (!entry || !entry.memberRef) return;
        const m = byId[entry.memberRef];
        if (!m) return;
        m.records.push({
          cupIndex: cup.index,
          cupName: cup.name,
          cupDate: cup.date,
          teamName: team.name,
          teamRank: team.rank,
          role: entry.role || null,
          lane: entry.lane || null,
          score: entry.score == null ? null : Number(entry.score)
        });
        if (entry.role && m.roles.indexOf(entry.role) < 0) m.roles.push(entry.role);
        if (entry.lane && m.lanes.indexOf(entry.lane) < 0) m.lanes.push(entry.lane);
      });
    });
  });
  members.forEach(m => {
    m.records.sort((a, b) => a.cupIndex - b.cupIndex);
    m.totalScore = m.records.reduce((s, r) => s + (r.score || 0), 0);
  });

  // 统计
  const allTeams = cups.reduce((arr, c) => arr.concat(c.teams), []);
  const totals = allTeams.map(t => Number(t.total) || 0);
  const allEntries = cups.reduce((arr, c) => arr.concat(c.teams.reduce((a, t) => a.concat(t.members || []), [])), []);
  const personalScores = allEntries.map(e => Number(e.score)).filter(v => !isNaN(v));
  const endings = Object.create(null);
  allTeams.forEach(t => (t.endings || []).forEach(e => { endings[e] = (endings[e] || 0) + 1; }));
  const roleCount = Object.create(null);
  allEntries.forEach(e => { if (e.role) roleCount[e.role] = (roleCount[e.role] || 0) + 1; });

  const stats = {
    cupCount: cups.length,
    teamCount: allTeams.length,
    memberCount: members.length,             // 去重后的选手数
    shotCount: (raw.members || []).length,   // 名片截图数（含同一成员的多张）
    entryCount: allEntries.length,           // 个人成绩条数
    totalSum: totals.reduce((a, b) => a + b, 0),
    maxTeam: totals.length ? Math.max.apply(null, totals) : 0,
    maxPersonal: personalScores.length ? Math.max.apply(null, personalScores) : 0,
    avgTeam: totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0,
    endings: endings,
    roleCount: roleCount,
    crossCup: members.filter(m => m.records.length > 1).length
  };

  // 定位标签分组：美愿 / 死仇 / 新能开 / 其他
  const GROUP_ORDER = ['美愿', '死仇', '新能开', '其他'];
  function groupOf(role) {
    if (!role) return null;
    if (role.indexOf('新能开') >= 0) return '新能开';
    if (role.indexOf('美愿') >= 0) return '美愿';
    if (role.indexOf('死仇') >= 0) return '死仇';
    return '其他';
  }
  members.forEach(m => {
    const set = [];
    m.roles.forEach(r => {
      const g = groupOf(r);
      if (g && set.indexOf(g) < 0) set.push(g);
    });
    m.groups = set.length ? set : ['其他'];
  });

  return { site, cups, members, byId, stats, groupOf, GROUP_ORDER };
}

/* ========================== 5. 滚动入场 & 分数条（IntersectionObserver） ========================== */
const animIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    if (el.classList.contains('reveal')) el.classList.add('in');
    const w = el.getAttribute('data-w');
    if (w != null) {
      const fill = el.matches('i') ? el : el.querySelector('i');
      if (fill) fill.style.width = w + '%';
    }
    animIO.unobserve(el);
  });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

/** 注册元素：.reveal 淡入、[data-w] 分数条生长 */
function observeAll(root) {
  const scope = root || document;
  $$('.reveal:not(.in)', scope).forEach(el => animIO.observe(el));
  $$('[data-w]', scope).forEach(el => animIO.observe(el));
}

/* ========================== 6. 图片兜底 ========================== */
document.addEventListener('error', ev => {
  const img = ev.target;
  if (!img || img.tagName !== 'IMG' || img.dataset.phDone === '1') return;
  img.dataset.phDone = '1';
  const holder = img.parentElement;
  if (!holder) { img.style.display = 'none'; return; }
  // HERO 背景只需静默隐藏（后面还有蒙版与渐变兜底）
  if (holder.id === 'heroBg') { img.style.display = 'none'; return; }
  const ph = document.createElement('div');
  ph.className = 'img-ph';
  ph.innerHTML = '<span>' + esc(img.dataset.initial || '◤') + '</span>' +
                 '<span class="ph-note mono">IMAGE UNAVAILABLE</span>';
  holder.appendChild(ph);
  img.style.display = 'none';
}, true);

/* ========================== 7. HERO ========================== */
const HERO_QUOTES = []; // 由数据签名填充

function renderHero(ctx) {
  const bg = $('#heroBg');
  const picks = ctx.members.filter(m => m.primaryShot).slice(0, 6);
  bg.innerHTML = picks.map((m, i) => (
    '<img src="' + esc(m.primaryShot) + '" alt="" aria-hidden="true" ' +
    'data-initial="' + esc(firstChar(m.name)) + '" ' +
    (i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="eager"') + ' decoding="async">'
  )).join('');

  const imgs = $$('img', bg);
  if (imgs.length) {
    let idx = 0;
    imgs[0].classList.add('on');
    // Ken Burns 轮播：每 7s 交叉淡入下一张（reduced-motion 时完全不动）
    if (!reducedMotion && imgs.length > 1) {
      setInterval(() => {
        imgs[idx].classList.remove('on');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('on');
      }, 7000);
    }
  }

  // 三个数据块：全部由数据实时统计
  const s = ctx.stats;
  const scoreShots = ctx.cups.filter(c => c.shot).length;   // 官方成绩截图张数
  const blocks = [
    { n: s.cupCount, unit: '届', l: '已收录赛事', le: 'CUPS' },
    { n: s.teamCount, unit: '支', l: '参赛队伍', le: 'TEAMS' },
    { n: s.shotCount, unit: '张', l: '名片留存',
      le: s.memberCount + ' PLAYERS · ' + s.shotCount + ' CARDS · ' + scoreShots + ' SCORE SHOTS' }
  ];
  $('#heroStats').innerHTML = blocks.map(b => (
    '<div class="hstat cut-tr">' +
      '<span class="n">' + esc(b.n) + '<small>' + esc(b.unit) + '</small></span>' +
      '<span class="l">' + esc(b.l) + '</span>' +
      '<span class="le mono">' + esc(b.le) + '</span>' +
    '</div>'
  )).join('');

  // 氛围文案：取数据里最长的个性签名（更中二的那句）
  const sigs = ctx.members.map(m => ({ name: m.name, sig: m.signature })).filter(x => x.sig);
  const heroSig = sigs.slice().sort((a, b) => b.sig.length - a.sig.length)[0];
  if (heroSig) $('#heroQuote').textContent = '“' + heroSig.sig + '”　—— ' + heroSig.name;
}

/* ========================== 8. 关于赛事 ========================== */
function renderFormats(ctx) {
  const grid = $('#formatGrid');
  grid.innerHTML = ctx.cups.map(cup => {
    const cls = cup.index === 1 ? 'fmt-rust' : 'fmt-cyan';
    const teamSize = cup.teams[0] ? cup.teams[0].members.length : 0;
    const hasLane = cup.teams.some(t => (t.members || []).some(m => m.lane));
    const totals = cup.teams.map(t => Number(t.total) || 0);
    const range = totals.length ? fmtNum(Math.min.apply(null, totals)) + ' ~ ' + fmtNum(Math.max.apply(null, totals)) : '—';
    const lanes = [];
    cup.teams.forEach(t => (t.members || []).forEach(m => { if (m.lane && lanes.indexOf(m.lane) < 0) lanes.push(m.lane); }));
    return '' +
      '<article class="fmt ' + cls + ' cut reveal">' +
        '<span class="fmt-no mono">CUP #' + esc(cup.index) + '</span>' +
        '<h4>' + esc(cup.name) + '</h4>' +
        '<p class="fmt-meta">' + esc(dash(cup.date)) + ' · ' + cup.teams.length + ' 支队伍</p>' +
        '<div class="fmt-line"><b>赛制</b><span>' + esc(dash(cup.format)) + '</span></div>' +
        '<div class="fmt-line"><b>队伍编制</b><span>' + (teamSize ? '每队 ' + teamSize + ' 人' : '—') + '</span></div>' +
        '<div class="fmt-line"><b>队伍总分区间</b><span class="mono">' + range + '</span></div>' +
        (hasLane
          ? '<div class="fmt-line"><b>赛道</b><span>' + lanes.map(esc).join(' / ') + '</span></div>'
          : '<div class="fmt-line"><b>剧本</b><span>全队同一剧本，按位置分工结算</span></div>') +
        '<p class="fmt-desc">每名选手独立结算个人分，队伍总分 = 队内个人分合计；记录完成结局。第 ' + esc(cup.index) + ' 届完整榜单见「历届战报」。</p>' +
      '</article>';
  }).join('');
}

/* ========================== 9. 历届战报 ========================== */
function memberRowHTML(entry, maxScore, showLane) {
  const score = Number(entry.score);
  const pct = maxScore > 0 && !isNaN(score) ? Math.max(2, Math.round(score / maxScore * 100)) : 0;
  const isTop = maxScore > 0 && score === maxScore;
  return '' +
    '<div class="mrow">' +
      '<span class="chip chip-role cut-chip">' + esc(dash(entry.role)) + '</span>' +
      '<span class="m-name">' + esc(dash(entry.name)) +
        (showLane && entry.lane ? '<span class="m-lane mono">' + esc(entry.lane) + '</span>' : '') +
      '</span>' +
      '<span class="m-score mono' + (isTop ? ' top' : '') + '">' + fmtNum(entry.score) + '</span>' +
      '<div class="bar" data-w="' + pct + '"><i class="' + (isTop ? 'lead' : '') + '"></i></div>' +
    '</div>';
}

function teamCardHTML(team, cup) {
  const rank = Number(team.rank) || 99;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
  const rankCls = rank <= 4 ? ' rank' + rank : '';
  const scores = (team.members || []).map(m => Number(m.score) || 0);
  const maxScore = scores.length ? Math.max.apply(null, scores) : 0;
  const showLane = (team.members || []).some(m => m.lane);
  const endings = (team.endings || []);
  const total = Number(team.total);
  const members = (team.members || []).map(m => memberRowHTML(m, maxScore, showLane)).join('');
  const laneHead = showLane ? '<th>赛道</th>' : '';
  const rows = (team.members || []).map(m => (
    '<tr>' +
      (showLane ? '<td class="nm">' + esc(dash(m.lane)) + '</td>' : '') +
      '<td class="nm">' + esc(dash(m.role)) + '</td>' +
      '<td class="nm">' + esc(dash(m.name)) + '</td>' +
      '<td class="num">' + fmtNum(m.score) + '</td>' +
    '</tr>'
  )).join('');

  return '' +
  '<article class="team-card cut' + rankCls + '" data-rank="' + rank + '">' +
    '<div class="tc-head" role="group">' +
      '<div class="rank-badge' + (medal ? '' : ' cut-chip') + '">' +
        (medal ? '<span class="rb-medal">' + medal + '</span>' : '') +
        '<span class="rb-no">NO.' + rank + '</span>' +
      '</div>' +
      '<div class="tc-title">' +
        '<h3 class="tc-name"><span class="rank-tag mono">RANK ' + String(rank).padStart(2, '0') + ' // ' + esc(cup.name) + '</span>' + esc(dash(team.name)) + '</h3>' +
        '<div class="tc-endings">' + (endings.length
          ? endings.map((e, i) => '<span class="chip chip-end cut-chip" style="animation-delay:' + (i * 45) + 'ms">' + esc(e) + '</span>').join('')
          : '<span class="chip cut-chip">结局记录 —</span>') + '</div>' +
      '</div>' +
      '<div class="tc-score">' +
        '<span class="tc-total">' + fmtNum(team.total) + '<small class="mono">TOTAL SCORE</small></span>' +
        '<button class="tc-toggle" type="button" aria-expanded="false">队伍详情<span class="caret">▾</span></button>' +
      '</div>' +
    '</div>' +
    '<div class="tc-members">' + (members || '<p class="dim">队员明细 —</p>') + '</div>' +
    '<div class="tc-detail">' +
      '<div class="detail-grid">' +
        '<div>' +
          '<p class="detail-sub mono">OFFICIAL SCORE SHOT // 官方成绩截图</p>' +
          (cup.shot
            ? '<div class="shot-thumb cut-sm" data-shot="' + esc(cup.shot) + '" data-shot-label="' + esc(cup.name + ' · ' + team.name + ' 得分截图') + '" role="button" tabindex="0">' +
                '<img src="' + esc(cup.shot) + '" alt="' + esc(cup.name + ' ' + team.name + ' 官方队伍得分截图') + '" loading="lazy" decoding="async" data-initial="' + esc(firstChar(cup.name)) + '">' +
                '<span class="zoom-hint">点击放大 ⤢</span>' +
              '</div>'
            : '<p class="dim">该届成绩截图 —</p>') +
        '</div>' +
        '<div>' +
          '<p class="detail-sub mono">ROSTER // 队员明细</p>' +
          '<table class="dtable"><thead><tr>' + laneHead + '<th>定位</th><th>昵称</th><th style="text-align:right">个人分</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="4" class="dim">—</td></tr>') + '</tbody></table>' +
          '<p class="compare-note mono">队伍总分 ' + fmtNum(total) + ' · 个人分合计 ' + fmtNum(scores.reduce((a, b) => a + b, 0)) + ' · ' + scores.length + ' 个位置</p>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</article>';
}

function renderCupPanel(ctx, cupIndex) {
  const cup = ctx.cups.find(c => c.index === cupIndex) || ctx.cups[0];
  const host = $('#cupPanels');
  if (!cup) { host.innerHTML = '<p class="dim">暂无赛事数据。</p>'; return; }
  const champ = cup.teams.find(t => Number(t.rank) === 1) || cup.teams[0];
  const totalTeams = cup.teams.length;
  const personalMax = cup.teams.reduce((max, t) => Math.max(max, ...(t.members || []).map(m => Number(m.score) || 0)), 0);

  const championHTML = champ ? (
    '<section class="champion cut" aria-label="本届冠军">' +
      '<p class="crown mono"><span class="medal">🥇</span> CHAMPION // 本届冠军</p>' +
      '<h3 class="cname">' + esc(dash(champ.name)) + '</h3>' +
      '<div class="crow">' +
        '<span class="ctotal">' + fmtNum(champ.total) + '<small>TOTAL</small></span>' +
        '<span class="cmeta">' + esc(dash(cup.date)) + '<br>' + esc(dash(cup.format)) + '<br>' +
          totalTeams + ' 支队伍 · 单届最高个人分 ' + fmtNum(personalMax) + '</span>' +
        '<span class="cbtns">' +
          (cup.shot ? '<button class="btn cut-btn" type="button" data-open-shot="' + esc(cup.shot) + '" data-shot-label="' + esc(cup.name + ' 官方队伍得分截图') + '">官方成绩截图 ⤢</button>' : '') +
          '<button class="btn btn-cyan cut-btn" type="button" data-expand-all>展开全部队伍</button>' +
        '</span>' +
      '</div>' +
      '<div class="tc-endings" style="margin-top:18px">' + (champ.endings || []).map(e =>
        '<span class="chip chip-end cut-chip">' + esc(e) + '</span>').join('') + '</div>' +
    '</section>'
  ) : '';

  host.innerHTML = '<div class="cup-panel">' + championHTML +
    '<div class="team-list">' + cup.teams.map(t => teamCardHTML(t, cup)).join('') + '</div>' +
  '</div>';

  // 名次卡片交互：点击头部 / “队伍详情”按钮展开；成绩截图可点开放大
  const panel = $('.cup-panel', host);
  panel.addEventListener('click', ev => {
    const shot = ev.target.closest('[data-shot]');
    if (shot) {
      openLightbox({ images: [{ src: shot.getAttribute('data-shot'), label: shot.getAttribute('data-shot-label') || '' }], index: 0, kicker: 'SCORE SHOT', title: shot.getAttribute('data-shot-label') || '官方成绩截图' });
      return;
    }
    const toggle = ev.target.closest('.tc-toggle');
    const head = ev.target.closest('.tc-head');
    if (toggle || head) {
      const card = (toggle || head).closest('.team-card');
      if (!card) return;
      const open = !card.classList.contains('is-open');
      card.classList.toggle('is-open', open);
      const btn = $('.tc-toggle', card);
      if (btn) btn.setAttribute('aria-expanded', String(open));
      if (open) observeAll(card);
    }
  });
  panel.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const shot = ev.target.closest('[data-shot]');
    if (shot) { ev.preventDefault(); shot.click(); }
  });
  const expandAll = $('[data-expand-all]', panel);
  if (expandAll) {
    expandAll.addEventListener('click', () => {
      const cards = $$('.team-card', panel);
      const anyClosed = cards.some(c => !c.classList.contains('is-open'));
      cards.forEach(c => {
        c.classList.toggle('is-open', anyClosed);
        const btn = $('.tc-toggle', c);
        if (btn) btn.setAttribute('aria-expanded', String(anyClosed));
      });
      expandAll.textContent = anyClosed ? '收起全部队伍' : '展开全部队伍';
      if (anyClosed) observeAll(panel);
    });
  }
  observeAll(panel);
}

function renderCupTabs(ctx, active) {
  const tabs = $('#cupTabs');
  tabs.innerHTML = ctx.cups.map(cup => {
    const champ = cup.teams.find(t => Number(t.rank) === 1);
    return '<button class="cup-tab cut-btn" role="tab" type="button" data-cup="' + esc(cup.index) + '"' +
      ' aria-selected="' + (cup.index === active ? 'true' : 'false') + '"' +
      ' aria-controls="cupPanels" id="cupTab' + esc(cup.index) + '">' +
      esc(cup.name) +
      '<span class="d mono">' + esc(dash(cup.date)) + '</span>' +
      '<span class="en">' + esc(champ ? 'CHAMPION ' + champ.name : '') + '</span>' +
    '</button>';
  }).join('');

  tabs.addEventListener('click', ev => {
    const tab = ev.target.closest('.cup-tab');
    if (!tab) return;
    const idx = Number(tab.getAttribute('data-cup'));
    if (idx === state.activeCup) return;
    state.activeCup = idx;
    $$('.cup-tab', tabs).forEach(t => t.setAttribute('aria-selected', String(Number(t.getAttribute('data-cup')) === idx)));
    renderCupPanel(ctx, idx);
    const host = $('#cupPanels');
    const panel = $('.cup-panel', host);
    if (panel) { panel.classList.add('flip'); }  // 切换动效：翻动 / 滑入
    renderCompare(ctx);
    observeAll(document);
  });
  tabs.addEventListener('keydown', ev => {
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
    const list = $$('.cup-tab', tabs);
    const cur = list.indexOf(document.activeElement);
    if (cur < 0) return;
    ev.preventDefault();
    const next = (cur + (ev.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length;
    list[next].focus();
    list[next].click();
  });
}

function renderCompare(ctx) {
  const host = $('#compareBars');
  const note = $('#compareNote');
  const champs = ctx.cups.map(cup => ({ cup: cup, team: cup.teams.find(t => Number(t.rank) === 1) })).filter(x => x.team);
  const max = champs.reduce((m, x) => Math.max(m, Number(x.team.total) || 0), 0) || 1;
  host.innerHTML = champs.map((x, i) => {
    const pct = Math.max(2, Math.round((Number(x.team.total) || 0) / max * 100));
    return '<div class="cbar-row">' +
      '<span class="cbar-label">' + esc(x.team.name) + '<span class="en">' + esc(x.cup.name) + ' · ' + esc(dash(x.cup.date)) + '</span></span>' +
      '<span class="cbar-track" data-w="' + pct + '"><i class="c' + (i % 2 === 0 ? '1' : '2') + '"></i></span>' +
      '<span class="cbar-val">' + fmtNum(x.team.total) + '</span>' +
    '</div>';
  }).join('');

  // 自动找出分差极小的相邻名次（第 1 届前两名只差 10 分这种细节）
  const tight = [];
  ctx.cups.forEach(cup => {
    const teams = cup.teams.slice().sort((a, b) => a.rank - b.rank);
    for (let i = 1; i < teams.length; i++) {
      const gap = (Number(teams[i - 1].total) || 0) - (Number(teams[i].total) || 0);
      if (gap > 0 && gap <= 20) tight.push({ cup: cup, gap: gap, a: teams[i - 1], b: teams[i] });
    }
  });
  const base = champs.length === 2
    ? '两届冠军分差 ' + fmtNum(Math.abs((Number(champs[0].team.total) || 0) - (Number(champs[1].team.total) || 0))) + ' 分。'
    : '';
  note.textContent = base + (tight.length
    ? tight.map(t => t.cup.name + ' 的 ' + t.a.name + ' 与 ' + t.b.name + ' 只差 ' + fmtNum(t.gap) + ' 分 —— 一个决策的距离，就是两个名字。').join(' ')
    : '目前没有分差在 20 分以内的相邻名次，说明大家都打得挺开。');
  observeAll(host);
}

/* ========================== 10. 选手名录 ========================== */
function playerCardHTML(m) {
  const tags = m.roles.length
    ? m.roles.map(r => '<span class="chip chip-role cut-chip">' + esc(r) + '</span>').join('')
    : '<span class="chip cut-chip">未参赛</span>';
  const sig = m.signature ? '“' + esc(m.signature) + '”' : '—';
  return '' +
  '<article class="pcard cut" data-member="' + esc(m.id) + '" tabindex="0" role="button" ' +
    'aria-label="' + esc(m.name) + ' 的名片，共 ' + m.shots.length + ' 张截图，回车查看详情">' +
    '<div class="pcard-media">' +
      '<img src="' + esc(m.primaryShot) + '" alt="' + esc(m.name) + ' 的个人名片截图" ' +
        'loading="lazy" decoding="async" data-initial="' + esc(firstChar(m.name)) + '">' +
      (m.shots.length > 1 ? '<span class="shot-count mono">' + m.shots.length + ' 张截图</span>' : '') +
    '</div>' +
    '<div class="pcard-body">' +
      '<h3 class="pcard-name"><span>' + esc(dash(m.name)) + '</span><span class="pcard-code">' + esc(dash(m.code)) + '</span></h3>' +
      '<p class="pcard-sub">' + esc(dash(m.title)) + '<span class="dim">/</span>' + esc(dash(m.operator)) + '</p>' +
      '<div class="pcard-tags">' + tags + '</div>' +
      '<p class="pcard-id">ID ' + esc(dash(m.gameId)) + ' · 参赛 ' + m.records.length + ' 次' +
        (m.records.length ? ' · 累计 ' + fmtNum(m.totalScore) + ' 分' : '') + '</p>' +
    '</div>' +
    '<div class="pcard-overlay">' +
      '<div class="ov-row"><span class="ov-k">昵称</span><span class="ov-v">' + esc(dash(m.name)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">编号</span><span class="ov-v mono">' + esc(dash(m.code)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">定位标签</span><span class="ov-v">' + (m.roles.length ? m.roles.map(esc).join(' / ') : '—') + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">游戏 ID</span><span class="ov-v mono">' + esc(dash(m.gameId)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">入职日</span><span class="ov-v mono">' + esc(dash(m.joinDate)) + '</span></div>' +
      (m.birthday ? '<div class="ov-row"><span class="ov-k">生日</span><span class="ov-v mono">' + esc(m.birthday) + '</span></div>' : '') +
      '<div class="ov-row"><span class="ov-k">助理干员</span><span class="ov-v">' + esc(dash(m.operator)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">时装保有数</span><span class="ov-v mono">' + (m.outfitCount == null ? '—' : esc(m.outfitCount)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">雇佣进度</span><span class="ov-v mono">' + (m.recruitProgress == null ? '—' : esc(m.recruitProgress)) + '</span></div>' +
      '<div class="ov-row"><span class="ov-k">签名</span><span class="ov-v' + (m.signature ? ' sig' : '') + '">' + sig + '</span></div>' +
      '<p class="ov-hint mono">CLICK / ENTER → DETAIL</p>' +
    '</div>' +
  '</article>';
}

/** 模糊匹配：子串命中，或按顺序的子序列命中（比如 "lyw" 也能命中 "冷依w" 的拼音场景） */
function fuzzyHit(haystack, needle) {
  const h = String(haystack || '').toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return true;
  if (h.indexOf(n) >= 0) return true;
  let i = 0;
  for (let k = 0; k < h.length && i < n.length; k++) {
    if (h.charAt(k) === n.charAt(i)) i++;
  }
  return i === n.length;
}

function memberMatches(m, query) {
  if (!query) return true;
  const fields = [
    m.name, m.code, String(m.code || '').replace('#', ''), m.gameId, m.title, m.operator,
    m.theme, m.themeEn, m.signature, m.joinDate, m.birthday
  ].concat(m.roles, m.lanes, m.records.map(r => r.teamName + ' ' + r.cupName + ' ' + r.role));
  return fields.some(f => fuzzyHit(f, query));
}

function renderFilters(ctx) {
  const counts = {};
  ctx.GROUP_ORDER.forEach(g => { counts[g] = 0; });
  ctx.members.forEach(m => m.groups.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
  const items = [{ key: 'all', label: '全部', en: 'ALL', count: ctx.members.length }].concat(
    ctx.GROUP_ORDER.map(g => ({ key: g, label: g, en: '', count: counts[g] || 0 }))
  );
  $('#roleFilters').innerHTML = items.map(it => (
    '<button class="fbtn cut-btn" type="button" data-filter="' + esc(it.key) + '" ' +
      'aria-pressed="' + (state.roleFilter === it.key ? 'true' : 'false') + '">' +
      esc(it.label) + (it.en ? '<span class="c mono">' + esc(it.en) + '</span>' : '') +
      '<span class="c mono">' + it.count + '</span>' +
    '</button>'
  )).join('');
}

function applyPlayerFilter(ctx) {
  const q = state.query.trim();
  const f = state.roleFilter;
  const list = ctx.members.filter(m => {
    if (f !== 'all' && m.groups.indexOf(f) < 0) return false;
    return memberMatches(m, q);
  });
  $('#playerGrid').innerHTML = list.map(playerCardHTML).join('');
  $('#playerEmpty').hidden = list.length > 0;
  const shownShots = list.reduce((s, m) => s + m.shots.length, 0);
  $('#playerCount').textContent =
    '显示 ' + list.length + ' / ' + ctx.members.length + ' 位选手（' + shownShots + ' 张名片）' +
    (q || f !== 'all' ? ' · 筛选：' + (q ? '“' + q + '” ' : '') + (f !== 'all' ? f : '') : '') +
    ' · 全部 ' + ctx.stats.shotCount + ' 张截图已收录';
  observeAll($('#playerGrid'));
  return list;
}

function renderPlayers(ctx) {
  renderFilters(ctx);
  applyPlayerFilter(ctx);

  const input = $('#playerSearch');
  const clear = $('#searchClear');
  input.addEventListener('input', () => {
    state.query = input.value;
    clear.hidden = !state.query;
    applyPlayerFilter(ctx);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    state.query = '';
    clear.hidden = true;
    applyPlayerFilter(ctx);
    input.focus();
  });
  $('#roleFilters').addEventListener('click', ev => {
    const btn = ev.target.closest('.fbtn');
    if (!btn) return;
    state.roleFilter = btn.getAttribute('data-filter');
    $$('.fbtn').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    applyPlayerFilter(ctx);
  });
  // 卡片：点击 / 回车 / 空格打开灯箱
  $('#playerGrid').addEventListener('click', ev => {
    const card = ev.target.closest('.pcard');
    if (card) openMemberLightbox(ctx, card.getAttribute('data-member'));
  });
  $('#playerGrid').addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const card = ev.target.closest('.pcard');
    if (!card) return;
    ev.preventDefault();
    openMemberLightbox(ctx, card.getAttribute('data-member'));
  });
}

/* ========================== 11. 灯箱 ========================== */
const lb = { images: [], index: 0, opener: null };

function openLightbox(opts) {
  const box = $('#lightbox');
  lb.images = (opts.images || []).filter(x => x && x.src);
  if (!lb.images.length) return;
  lb.index = Math.min(Math.max(opts.index || 0, 0), lb.images.length - 1);
  lb.opener = document.activeElement;
  $('#lbKicker').textContent = opts.kicker || 'PLAYER CARD';
  $('#lbTitle').textContent = opts.title || '—';
  $('#lbInfo').innerHTML = opts.infoHTML || '';
  box.hidden = false;
  document.body.classList.add('lb-open');
  paintLightbox();
  $('.lb-close', box).focus();
}

function paintLightbox() {
  const img = $('#lbImg');
  const cur = lb.images[lb.index];
  img.src = cur.src;
  img.alt = cur.label || '放大查看';
  img.dataset.initial = firstChar(cur.label || '◤');
  $('#lbCaption').textContent = (cur.label || '') + '　[' + (lb.index + 1) + ' / ' + lb.images.length + ']';
  const many = lb.images.length > 1;
  $('#lbPrev').hidden = !many;
  $('#lbNext').hidden = !many;
  $('#lbThumbs').innerHTML = many ? lb.images.map((im, i) => (
    '<span class="lb-thumb" role="button" tabindex="0" aria-current="' + (i === lb.index ? 'true' : 'false') +
      '" data-i="' + i + '" aria-label="查看第 ' + (i + 1) + ' 张"><img src="' + esc(im.src) + '" alt="" loading="lazy" data-initial="' + esc(firstChar(im.label || '◤')) + '"></span>'
  )).join('') : '';
}

function stepLightbox(delta) {
  if (lb.images.length < 2) return;
  lb.index = (lb.index + delta + lb.images.length) % lb.images.length;
  paintLightbox();
}

function closeLightbox() {
  const box = $('#lightbox');
  if (box.hidden) return;
  box.hidden = true;
  document.body.classList.remove('lb-open');
  $('#lbImg').removeAttribute('src');
  if (lb.opener && lb.opener.focus) lb.opener.focus();
  lb.opener = null;
}

function memberInfoHTML(m) {
  const row = (k, v) => '<tr><th>' + esc(k) + '</th><td>' + v + '</td></tr>';
  const theme = m.theme
    ? esc(m.theme) + (m.themeEn ? ' <span class="en">' + esc(m.themeEn) + '</span>' : '')
    : '—';
  const op = m.operator
    ? esc(m.operator) + (m.operatorEn ? ' <span class="en">' + esc(m.operatorEn) + '</span>' : '')
    : '—';
  const title = m.title
    ? esc(m.title) + (m.titleEn ? ' <span class="en">' + esc(m.titleEn) + '</span>' : '')
    : '—';
  const records = m.records.length
    ? m.records.map(r => (
        '<div class="lb-rec cut-chip">' +
          '<div class="r1"><span class="rn">' + esc(r.cupName) + ' · ' + esc(r.teamName) +
            ' <span class="dim">（第 ' + esc(r.teamRank) + ' 名）</span></span>' +
            '<span class="rs">' + fmtNum(r.score) + '</span></div>' +
          '<div class="r2">定位：' + esc(dash(r.role)) + (r.lane ? ' · 赛道：' + esc(r.lane) : '') +
            ' · ' + esc(dash(r.cupDate)) + '</div>' +
        '</div>'
      )).join('')
    : '<p class="dim">这位选手暂未出现在已收录届次的队伍成绩中，名片先行留存。</p>';

  return '' +
    '<table class="lb-table">' +
      row('昵称', esc(dash(m.name))) +
      row('编号', esc(dash(m.code))) +
      row('游戏 ID', '<span class="num">' + esc(dash(m.gameId)) + '</span>') +
      row('定位标签', m.roles.length ? m.roles.map(esc).join(' / ') : '—') +
      row('名片职业', title) +
      row('助理干员', op) +
      row('名片主题', theme) +
      row('入职日', '<span class="num">' + esc(dash(m.joinDate)) + '</span>') +
      row('生日', m.birthday ? '<span class="num">' + esc(m.birthday) + '</span>' : '—') +
      row('时装保有数', '<span class="num">' + (m.outfitCount == null ? '—' : esc(m.outfitCount)) + '</span>') +
      row('雇佣干员进度', '<span class="num">' + (m.recruitProgress == null ? '—' : esc(m.recruitProgress)) + '</span>') +
      row('参赛次数', '<span class="num">' + m.records.length + '</span> 次') +
      row('累计分', m.records.length ? '<span class="num">' + fmtNum(m.totalScore) + '</span>' : '—') +
      row('名片截图', m.shots.length + ' 张（' + m.primaryShotType + ' 主图）') +
    '</table>' +
    '<div class="lb-sec">' +
      '<p class="lb-sec-t mono"><span>参赛记录 // RECORDS</span><span>' + (m.records.length ? fmtNum(m.totalScore) + ' TOTAL' : '—') + '</span></p>' +
      records +
    '</div>' +
    (m.signature ? '<p class="lb-quote">“' + esc(m.signature) + '”</p>' : '');
}

function openMemberLightbox(ctx, id) {
  const m = ctx.byId[id];
  if (!m) return;
  const images = m.shots.map(s => ({
    src: s.src,
    label: m.name + ' · ' + (s.type === 'card' ? '个人名片页' : '战斗结算页')
  }));
  openLightbox({
    images: images,
    index: 0,
    kicker: 'PLAYER CARD // 选手名片',
    title: m.name + ' ' + dash(m.code),
    infoHTML: memberInfoHTML(m)
  });
}

function initLightbox() {
  const box = $('#lightbox');
  box.addEventListener('click', ev => {
    if (ev.target.closest('[data-lb-close]')) { closeLightbox(); return; }
    if (ev.target.closest('#lbPrev')) { stepLightbox(-1); return; }
    if (ev.target.closest('#lbNext')) { stepLightbox(1); return; }
    const th = ev.target.closest('.lb-thumb');
    if (th) { lb.index = Number(th.getAttribute('data-i')) || 0; paintLightbox(); }
  });
  box.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      const th = ev.target.closest('.lb-thumb');
      if (th) { ev.preventDefault(); lb.index = Number(th.getAttribute('data-i')) || 0; paintLightbox(); }
    }
  });
  document.addEventListener('keydown', ev => {
    if (box.hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeLightbox(); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); stepLightbox(-1); }
    else if (ev.key === 'ArrowRight') { ev.preventDefault(); stepLightbox(1); }
  });
}

/* ========================== 12. 统计 / 页脚 ========================== */
function renderStats(ctx) {
  const s = ctx.stats;
  const cards = [
    { v: s.teamCount, l: '累计队伍数', le: 'TOTAL TEAMS', d: s.cupCount + ' 届赛事 · 平均 ' + (s.cupCount ? (s.teamCount / s.cupCount).toFixed(1) : '—') + ' 支/届' },
    { v: fmtNum(s.totalSum), l: '总分总和', le: 'SUM OF TOTALS', d: '两届所有队伍总分相加' },
    { v: fmtNum(s.maxTeam), l: '最高单队分', le: 'TOP TEAM', d: '由冠军队伍拿下' },
    { v: fmtNum(s.maxPersonal), l: '单届最高个人分', le: 'TOP PLAYER', d: '单届个人结算最高值' },
    { v: fmtNum(Math.round(s.avgTeam * 10) / 10), l: '队伍平均分', le: 'AVG PER TEAM', d: '总分总和 ÷ 队伍数' }
  ];
  $('#statStrip').innerHTML = cards.map(c => (
    '<div class="scard cut-tr reveal">' +
      '<span class="sv">' + esc(c.v) + '</span>' +
      '<span class="sl">' + esc(c.l) + '</span>' +
      '<span class="sle mono">' + esc(c.le) + '</span>' +
      '<span class="sd">' + esc(c.d) + '</span>' +
    '</div>'
  )).join('');

  // 结局词云：字号 = 频次
  const ends = Object.keys(s.endings).map(k => ({ t: k, f: s.endings[k] })).sort((a, b) => b.f - a.f || a.t.localeCompare(b.t));
  const maxF = ends.length ? ends[0].f : 1;
  const minF = ends.length ? ends[ends.length - 1].f : 1;
  $('#endingsCloud').innerHTML = ends.length ? ends.map(e => {
    const size = maxF === minF ? 22 : 14 + (e.f - minF) / (maxF - minF) * 30;
    return '<span class="wc-item cut-chip" style="font-size:' + size.toFixed(1) + 'px" title="' + esc(e.t) + '：' + e.f + ' 次">' +
      esc(e.t) + '<span class="wc-n">×' + e.f + '</span></span>';
  }).join('') : '<p class="dim">暂无结局数据。</p>';

  // 定位标签图鉴
  const roles = Object.keys(s.roleCount).map(k => ({ t: k, f: s.roleCount[k] })).sort((a, b) => b.f - a.f || a.t.localeCompare(b.t));
  $('#roleCloud').innerHTML = roles.length ? roles.map(r =>
    '<span class="chip chip-role cut-chip">' + esc(r.t) + ' <span class="mono" style="opacity:.7">×' + r.f + '</span></span>'
  ).join('') : '<p class="dim">暂无定位标签数据。</p>';
}

function renderFooter(ctx) {
  const s = ctx.stats;
  const sigs = ctx.members.map(m => ({ name: m.name, sig: m.signature })).filter(x => x.sig);
  const bang = sigs.find(x => /[!！]$/.test(x.sig)) || sigs[0];
  if (bang) {
    $('#footerQuote').innerHTML = '<p>“' + esc(bang.sig) + '”</p><cite>—— ' + esc(bang.name) + ' 的个人签名</cite>';
  }
  $('#footerFine').textContent = 'SITE v' + (ctx.site.version || '1.0.0') +
    ' · ' + s.cupCount + ' CUPS · ' + s.teamCount + ' TEAMS · ' + s.shotCount + ' CARDS · ' + s.entryCount + ' SCORE ENTRIES' +
    ' · ' + (ctx.site.tagline || '');
  $('#navTag').textContent = 'PRTS // ' + s.cupCount + ' CUPS';
  document.title = (ctx.site.name || '大啥杯') + ' ' + (ctx.site.subtitle || '') + ' · 集成战略民间赛事记录站';
}

/* ========================== 13. 导航高亮 & 吸顶 ========================== */
function initNav() {
  const sections = $$('main section[id]');
  const links = $$('.nav-links a');
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => navIO.observe(s));

  // 用哨兵 + IntersectionObserver 代替 scroll 事件
  const nav = $('#siteNav');
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:8px;left:0;width:1px;height:1px;';
  $('#hero').appendChild(sentinel);
  const stuckIO = new IntersectionObserver(entries => {
    entries.forEach(en => nav.classList.toggle('is-stuck', !en.isIntersecting));
  }, { threshold: 0 });
  stuckIO.observe(sentinel);
}

/* ========================== 14. 启动 ========================== */
const state = { activeCup: 1, query: '', roleFilter: 'all' };

function fatal(message) {
  const host = $('#cupPanels');
  if (host) host.innerHTML = '<p class="dim">数据不可用：' + esc(message) + '</p>';
  console.info('[大啥杯] ' + message);
}

(async function main() {
  const raw = await loadData();
  if (!raw) { fatal('缺少 data/site-data.json，且内置 FALLBACK_DATA 为空。'); return; }
  let ctx;
  try {
    ctx = prepare(raw);
  } catch (err) {
    fatal('数据解析失败：' + (err && err.message)); return;
  }
  if (!ctx.cups.length || !ctx.members.length) { fatal('数据为空。'); return; }

  state.activeCup = ctx.cups[0].index;
  renderHero(ctx);
  renderFormats(ctx);
  renderCupTabs(ctx, state.activeCup);
  renderCupPanel(ctx, state.activeCup);
  renderCompare(ctx);
  renderPlayers(ctx);
  renderStats(ctx);
  renderFooter(ctx);
  initLightbox();
  initNav();
  observeAll(document);
  document.documentElement.setAttribute('data-app-ready', '1');
})();
