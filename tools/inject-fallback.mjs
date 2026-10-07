/* 构建脚本：把 dashabei/data/site-data.json 原样注入 dashabei/app.js 的 FALLBACK_DATA 常量。
   注入是幂等的：用 START / END 标记定位，重复运行不会叠加、不会破坏语法。
   用法：node tools/inject-fallback.mjs                                        */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const START = '/*' + '__FB_START__' + '*/';
const END = '/*' + '__FB_END__' + '*/';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const jsonPath = join(root, 'data', 'site-data.json');
const appPath = join(root, 'app.js');

const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const literal = JSON.stringify(data, null, 2);

let app = readFileSync(appPath, 'utf8');
const i0 = app.indexOf(START);
const i1 = app.indexOf(END);
if (i0 < 0 || i1 < 0 || i1 < i0) {
  console.error('未找到 FALLBACK_DATA 注入标记，请检查 app.js。');
  process.exit(1);
}
const before = app.length;
app = app.slice(0, i0 + START.length) + literal + app.slice(i1);
writeFileSync(appPath, app, 'utf8');

// 回读自检：注入的内容必须与 site-data.json 语义完全一致
const injected = JSON.parse(app.slice(app.indexOf(START) + START.length, app.indexOf(END)));
const same = JSON.stringify(injected) === JSON.stringify(data);
console.log('injected chars: ' + literal.length + '  (app.js ' + before + ' -> ' + app.length + ')');
console.log('FALLBACK_DATA deep-equals data/site-data.json : ' + same);
if (!same) process.exit(2);
