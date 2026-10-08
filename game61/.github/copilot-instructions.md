本仓库概览与 AI 助手速查说明

目的：帮助 AI 编码代理（Copilot / 自动化助理）快速上手并生成准确、可合并的改动。

要点摘要
- 项目类型：静态前端网站（ES Modules），以远程 JSON 数据文件作为游戏数据源。
- 数据源位置：在 `public/js/BaseURL.js` 中的 `BASE_URL`（默认指向 `https://.../db.json`）。修改该常量可改变整个站点的数据来源。
- 游戏页面与路由：游戏访问路径格式为 `{base}/games/{id}/index.html`（参见 `getGameUrl`）。详情页通过 `detail.html?id={id}` 访问，支持 `channel` URL 参数（在 `detail.js` / `index.js` 中使用 `window.channel`）。

重要文件与示例引用
- `public/js/BaseURL.js` — 数据加载、图片 URL 规则、默认分类（`DEFAULT_CATEGORIES`）和 `getDataBaseUrl()` 的实现。
  - 示例：若要把图标地址改为 CDN，修改 `getImgUrl` 或 `BASE_URL`。
- `public/js/index.js` — 首页的游戏加载、分类展示与搜索过滤逻辑；使用 `getCategoryOrder()` 来决定分类顺序并在现有页面节（`.game-section`）上填充内容。
- `public/js/detail.js` — 游戏详情页的呈现逻辑、播放跳转（`getGameUrl`）以及推荐位生成逻辑。
- `config.json` — 主题颜色与 `domain` 字段（前端模板/脚本会读取此配置以调整主题色或域名相关行为）。
- `package.json` & Node 脚本 — 构建/打包相关脚本：
  - `node1`: `node node_templete.js` （模版处理/主题生成）
  - `node2`: `node node_compress.js` （压缩/混淆）
  - `batch`: `node node_batch.js` （批量任务）
 依赖示例：`canvas`, `javascript-obfuscator`, `archiver`, `xlsx` — 表明有图片处理、打包与混淆相关的自动化。

项目约定（可供 AI 遵循的规则）
- ES 模块：前端脚本使用 `import`/`export`（参见 `public/js/*.js`），因此修改脚本时保持模块导出/导入风格。
- 全局状态：`window.channel` 可被 URL 的 `channel` 参数设置；某些跳转会把该参数附加到 URL。生成跳转链接时保留 `&channel=...` 的行为。
- 数据加载缓存：`BaseURL.js` 使用 `dataLoadPromise` 缓存数据加载；不要重复触发多次 fetch，优先复用导出的加载函数 `loadGameData()`。
- 图片资源：图片路径通常通过 `getImgUrl(game)` 统一生成，文件名可能来自 `game.img` 或 `game.image` 字段，确保在处理图像名时考虑包含 `/` 的情况（已有实现示例）。

开发/调试提示（可直接用于生成 PR 的描述或改动）
- 更换数据源：编辑 `public/js/BaseURL.js` 的 `BASE_URL`。同时检查 `getDataBaseUrl()` 是否保持与图标/游戏路径匹配。
- 修改分类顺序逻辑：编辑 `getCategoryOrder()` 中读取 `info4` 的逻辑或 `DEFAULT_CATEGORIES`。
- 更新主题色与站点域：修改根目录 `config.json` 中的 `color`/`domain` 字段，前端模板会引用这些值。
- 本地调试：这是静态站点，可直接在浏览器打开 `index.html` 或通过静态服务器（例如 `live-server`）提供 `public/` 根目录。
- 构建脚本：如需运行自动化任务，使用 `npm run node1` / `npm run node2` / `npm run batch`（在 Windows PowerShell 下直接运行即可）。

生成改动时的安全与样式约定
- 优先保持现有导出/函数接口：如果改动会改变 `loadGameData()`、`getGameUrl()` 或 `getImgUrl()` 的签名，请在 PR 描述中列明兼容性影响并同时更新所有引用处。
- 不要删除 `window.channel` 相关逻辑：这是向外部渠道传参的约定。
- 若修改远程数据格式（db.json），在 `BaseURL.js` 中添加兼容适配层，保证旧字段（`img`/`image`、`info4`）仍能兼容一段时间。

检查点（AI 生成补丁前应验证）
1) 是否修改了 `BASE_URL` 或 `getImgUrl`？——在本地打开 `index.html` 检查图片与分类是否正常显示。
2) 是否改动了 `getCategoryOrder()` 或 `info4` 解析？——确认首页分类标题与 `pages/category.html` 链接一致。
3) 是否影响到 URL 参数（id/channel）传递？——手动在浏览器地址栏加 `?id=1&channel=test`，确认跳转与链接保留 `channel`。

如果需要我可以：
- 把这份说明改成英文版，或扩展为更详细的贡献指南（包含常用代码片段与 PR 模板）。
- 基于你想要的改动，直接修改 `public/js/BaseURL.js` 或生成一个小 PR 来修改 `BASE_URL` 或图片规则。

— 完 —
