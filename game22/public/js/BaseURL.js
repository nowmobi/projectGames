export const BASE_URL = "https://datajson.pages.dev/games5/db2.json";

const baseUrl = 'https://games5-65b.pages.dev';

export function getDataBaseUrl() {
  return baseUrl;
}

let gameDetails = [];
let categoryData = null;
let dataLoadPromise = null;

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
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to load game data: ${response.status}`);
      }
      const data = await response.json();
      

      if (data.length > 0 && typeof data[0] === 'object') {
        categoryData = data[0];
      }
      

      const gamesData = data.length > 1 ? data.slice(1) : data;
      const mappedData = gamesData.map(game => ({
        ...game,
        image: getImgUrl(game)
      }));
      gameDetails = mappedData;
      return mappedData;
    } catch (error) {
      gameDetails = [];
      categoryData = null;
      return [];
    }
  })();
  
  return dataLoadPromise;
}

export async function getCategoryData() {

  if (categoryData) {
    return categoryData;
  }
  

  await loadGameData();
  return categoryData;
}


loadGameData();

export function getGameDetail(id) {
  const numericId = parseInt(id, 10);
  return gameDetails.find(game => game.id === numericId) || null;
}

export function getGameUrl(gameId) {
  return `${baseUrl}/games1/${gameId}/index.html`;
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


export const INFO_TYPE = 'info5';

export async function getCategoryOrder() {
  const infoType = INFO_TYPE;
  try {
    const categoryInfo = await getCategoryData();
    
    if (categoryInfo && categoryInfo[infoType]) {
      const categories = categoryInfo[infoType];
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
  if (!game.img && !game.image) {
    return `${baseUrl}/icons/${game.id}.jpg`;
  }

  let imgFileName = game.img || game.image;
  if (imgFileName.includes("/")) {
    imgFileName = imgFileName.split("/").pop();
  }

  return `${baseUrl}/icons/${imgFileName}`;
}
export { gameDetails };

// ========== 公共分类工具函数 ==========
export const categoryIcons = {
  'action': '⚡',
  'racing': '🏎️',
  'puzzle': '🧩',
  'adventure': '🗺️',
  'sports': '⚽',
  'kids': '👶',
  'girl': '👑'
};

export function getCategoryName(category) {
  const categoryNames = {
    'action': 'Action Games',
    'racing': 'Racing Games',
    'puzzle': 'Puzzle Games',
    'adventure': 'Adventure Games',
    'sports': 'Sports Games',
    'kids': 'Kids Games',
    'girl': 'Girl Games'
  };
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + ' Games';
}

export const categoryConfig = {
  action: {
    name: 'Action Games',
    icon: '⚡'
  },
  racing: {
    name: 'Racing Games',
    icon: '🏎️'
  },
  puzzle: {
    name: 'Puzzle Games',
    icon: '🧩'
  },
  adventure: {
    name: 'Adventure Games',
    icon: '🗺️'
  },
  sports: {
    name: 'Sports Games',
    icon: '⚽'
  },
  kids: {
    name: 'Kids Games',
    icon: '👶'
  },
  girl: {
    name: 'Girl Games',
    icon: '👑'
  }
};

