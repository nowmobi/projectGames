export const BASE_URL = "https://datajson.pages.dev/games5/db1.json";


const baseUrl = 'https://games5-65b.pages.dev';

let gameDetails = [];
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


export async function getCategoryOrder() {
  const infoType = 'info3';
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

// Get sidebar menu data from remote info
export async function getSidebarMenuData() {
  try {
    const response = await fetch(Category_URL);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0]) {
    
      const menuData = data[0].info || data[0].info2 || data[0].menu || null;
      return menuData;
    }

    return null;
  } catch (error) {
    console.error("Failed to load sidebar menu data:", error);
    return null;
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

