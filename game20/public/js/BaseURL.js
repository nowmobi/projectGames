// 5条链接配置
// gamesDir:  BASE_URL 中 datajson.pages.dev 后面的 gamesX 目录
// subFolder: getGameUrl 中 baseUrl 后面的子文件夹名
// baseUrl:   去玩游戏的基础 URL
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

// ---- 动态状态（每次页面加载从链接1、db1开始）----
// 不使用 localStorage 持久化，确保每次都是全新从第一条开始
let CURRENT_LINK_INDEX = 0; // 默认链接1
let CURRENT_DB_NUM = 1;     // 默认 db1.json

// ---- 当前配置读取 ----
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

  // 清除数据缓存，重新加载新数据源
  invalidateCache();
  loadGameData();
}

// 启动定时切换：两周（14天）切一次
setInterval(switchToNextLink, SWITCH_INTERVAL_MS);
