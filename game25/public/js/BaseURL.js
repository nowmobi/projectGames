export const BASE_URL = "https://datajson.pages.dev/games5/db4.json";

export const Category_URL = BASE_URL;

const baseUrl = 'https://games5-65b.pages.dev';


let gameDetails = [];
let categoryDetails = [];
// 使用Map来缓存基于URL的fetch请求结果
const fetchCache = new Map();

export async function loadGameData() {
 
  if (fetchCache.has(BASE_URL)) {
   
    const cachedData = await fetchCache.get(BASE_URL);
    const mappedData = cachedData.map(game => ({
      ...game,
      image: getImgUrl(game)
    }));
    gameDetails = mappedData;
    return mappedData;
  }
  
 
  const fetchPromise = (async () => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to load game data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  })();
  
 
  fetchCache.set(BASE_URL, fetchPromise);
  
 
  try {
    const data = await fetchPromise;
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
}

export async function loadCategoryData() {
 
  if (fetchCache.has(Category_URL)) {
   
    const cachedData = await fetchCache.get(Category_URL);
    categoryDetails = cachedData;
    return cachedData;
  }
  
 
  const fetchPromise = (async () => {
    try {
      const response = await fetch(Category_URL);
      if (!response.ok) {
        throw new Error(`Failed to load category data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  })();
  
 
  fetchCache.set(Category_URL, fetchPromise);
  
 
  try {
    const data = await fetchPromise;
    categoryDetails = data;
    return data;
  } catch (error) {
    categoryDetails = [];
    return [];
  }
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



export const getInfoType = () => {
  return 'info3'; 
};

export async function getCategoryOrder() {
  const infoType = getInfoType();
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

