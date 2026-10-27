// 5条链接配置
// subFolder: getGameUrl 中使用的子文件夹名
// gamesDir:  BASE_URL 中 datajson.pages.dev 后面的 gamesX 目录
// baseUrl:   游戏页面基础 URL
const LINK_CONFIGS = [
  { gamesDir: 'games6', subFolder: 'games2', baseUrl: 'https://games6-467.pages.dev' }, // 链接1
  { gamesDir: 'games5', subFolder: 'games1', baseUrl: 'https://games5-65b.pages.dev' }, // 链接2
  { gamesDir: 'games9', subFolder: 'games',  baseUrl: 'https://games9-4av.pages.dev' }, // 链接3
  { gamesDir: 'games8', subFolder: 'games',  baseUrl: 'https://games8-9t4.pages.dev' }, // 链接4
  { gamesDir: 'games7', subFolder: 'games',  baseUrl: 'https://games7.pages.dev' },      // 链接5
];

const LINK_COUNT = LINK_CONFIGS.length; // 5
const MAX_DB_NUM = 6;
const SWITCH_INTERVAL_MS = 2 * 7 * 24 * 60 * 60 * 1000; // 两周（14天）

// ---- 状态持久化 ----
const STORAGE_KEY = 'game_source_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Number.isInteger(s.linkIndex) && Number.isInteger(s.dbNum)) {
        return s;
      }
    }
  } catch (_) { /* ignore */ }
  return null;
}

function saveState(linkIndex, dbNum, lastSwitchTime) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ linkIndex, dbNum, lastSwitchTime }));
  } catch (_) { /* ignore */ }
}

// ---- 计算并调整状态（处理页面长时间未打开的情况）----
function computeInitialState() {
  const stored = loadState();
  let linkIndex = 0;
  let dbNum = 1;
  let lastSwitchTime = Date.now();

  if (stored) {
    linkIndex = stored.linkIndex;
    dbNum = stored.dbNum;
    lastSwitchTime = stored.lastSwitchTime || Date.now();

    // 根据已流逝的时间推进状态
    const elapsed = Date.now() - lastSwitchTime;
    if (elapsed > SWITCH_INTERVAL_MS) {
      const steps = Math.floor(elapsed / SWITCH_INTERVAL_MS);
      for (let i = 0; i < steps; i++) {
        linkIndex++;
        if (linkIndex >= LINK_COUNT) {
          linkIndex = 0;
          dbNum++;
          if (dbNum > MAX_DB_NUM) dbNum = 1;
        }
      }
      lastSwitchTime = stored.lastSwitchTime + steps * SWITCH_INTERVAL_MS;
    }
  }

  saveState(linkIndex, dbNum, lastSwitchTime);
  return { linkIndex, dbNum, lastSwitchTime };
}

// 当前状态
let { linkIndex: CURRENT_LINK_INDEX, dbNum: CURRENT_DB_NUM, lastSwitchTime } = computeInitialState();

// ---- 动态获取当前配置 ----
function getCurrentConfig() {
  return LINK_CONFIGS[CURRENT_LINK_INDEX];
}

function getBASE_URL() {
  const cfg = getCurrentConfig();
  return `https://datajson.pages.dev/${cfg.gamesDir}/db${CURRENT_DB_NUM}.json`;
}

function getBaseUrl() {
  return getCurrentConfig().baseUrl;
}

function getCurrentSubFolder() {
  return getCurrentConfig().subFolder;
}

// ---- 导出（保持外部接口兼容）----
// 外部没有直接 import BASE_URL / baseUrl，这里保留但它们只供内部使用
export const BASE_URL = getBASE_URL();

// ---- 游戏数据缓存 ----
let gameDetails = [];
let dataLoadPromise = null;

function invalidateCache() {
  gameDetails = [];
  dataLoadPromise = null;
}

export async function loadGameData() {
  if (dataLoadPromise) {
    const result = await dataLoadPromise;
    if (result && result.length > 0) {
      return result;
    }
    dataLoadPromise = null;
  }

  dataLoadPromise = (async () => {
    try {
      const url = getBASE_URL();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load game data: ${response.status}`);
      }
      const data = await response.json();
      const mappedData = data.map(game => ({
        ...game,
        image: getImgUrl(game)
      }));
      gameDetails = mappedData;
      return mappedData;
    } catch (error) {
      gameDetails = [];
      return [];
    }
  })();

  return dataLoadPromise;
}

loadGameData();

export function getGameDetail(id) {
  const numericId = parseInt(id, 10);
  return gameDetails.find(game => game.id === numericId) || null;
}

export function getGameUrl(gameId) {
  const subFolder = getCurrentSubFolder();
  const bUrl = getBaseUrl();
  return `${bUrl}/${subFolder}/${gameId}/index.html`;
}

const DEFAULT_CATEGORIES = [
  "puzzle",
  "action",
  "adventure",
  "racing",
  "sports",
  "kids",
  "girl",
];

export async function getCategoryOrder() {
  const infoType = 'info5';
  try {
    const data = await loadGameData();
    if (Array.isArray(data) && data.length > 0 && data[0] && data[0][infoType]) {
      const categories = data[0][infoType];
      if (Array.isArray(categories) && categories.length > 0) {
        return categories;
      }
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    return DEFAULT_CATEGORIES;
  }
}

export function getImgUrl(game) {
  const bUrl = getBaseUrl();
  if (!game.img && !game.image) {
    return `${bUrl}/icons/${game.id}.jpg`;
  }

  let imgFileName = game.img || game.image;
  if (imgFileName.includes("/")) {
    imgFileName = imgFileName.split("/").pop();
  }

  return `${bUrl}/icons/${imgFileName}`;
}

export { gameDetails };

// ---- 切换定时器 ----
function switchToNextLink() {
  CURRENT_LINK_INDEX++;
  if (CURRENT_LINK_INDEX >= LINK_COUNT) {
    CURRENT_LINK_INDEX = 0;
    CURRENT_DB_NUM++;
    if (CURRENT_DB_NUM > MAX_DB_NUM) CURRENT_DB_NUM = 1;
  }
  lastSwitchTime = Date.now();
  saveState(CURRENT_LINK_INDEX, CURRENT_DB_NUM, lastSwitchTime);

  // 清除数据缓存，让下次调用 loadGameData 重新请求新数据源
  invalidateCache();
  // 立即重新加载新数据
  loadGameData();
}

// 启动定时切换
setInterval(switchToNextLink, SWITCH_INTERVAL_MS);
