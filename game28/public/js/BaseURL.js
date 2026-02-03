export const BASE_URL = "https://games-9ds.pages.dev/Game1/db.json";


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
  const baseUrl = getDataBaseUrl();
  return `${baseUrl}/games/${gameId}/index.html`;
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
  const infoType = 'info2';
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      return DEFAULT_CATEGORIES;
    }
    const data = await response.json();

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

export function getDataBaseUrl() {
  return BASE_URL.replace('/db.json', '');
}

export function getImgUrl(game) {
  const baseUrl = getDataBaseUrl();

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

