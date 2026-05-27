export const BASE_URL = "https://datajson.pages.dev/games9/db15.json";
const baseUrl = 'https://games9-4av.pages.dev';



let gameDetails = [];
let dataLoadPromise = null;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate() {
  const start = new Date(2026, 1, 1).getTime();
  const end = new Date(2026, 5, 5).getTime();
  const randomTime = start + Math.random() * (end - start);
  const date = new Date(randomTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to load game data: ${response.status}`);
      }
      const data = await response.json();
      const mappedData = data.map(game => ({
        ...game,
        image: getImgUrl(game),
        playedByCount: game.playedByCount || getRandomInt(800, 1000),
        update_time: game.update_time || getRandomDate()
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
  const infoType = 'info1';
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

