export const BASE_URL = "https://datajson.pages.dev/games5/db5.json";
const baseUrl = 'https://games5-65b.pages.dev';

let gameDetails = [];
let dataLoadPromise = null;

export async function loadGameData() {
  if (dataLoadPromise) {
    const result = await dataLoadPromise;
    return result && result.length > 0 ? result : [];
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
      return [];
    }
  })();
  
  return dataLoadPromise;
}

export function getGameDetail(id) {
  return gameDetails.find(game => game.id === parseInt(id, 10)) || null;
}

export function getGameUrl(gameId) {
  return `${baseUrl}/games1/${gameId}/index.html`;
}

const DEFAULT_CATEGORIES = ["puzzle", "action", "adventure", "racing", "sports", "kids", "girl"];

export async function getCategoryOrder() {
  try {
    const data = await loadGameData();
    const infoType = 'info3';
    return data[0] && data[0][infoType] ? data[0][infoType] : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function getImgUrl(game) {
  if (!game.img && !game.image) {
    return `${baseUrl}/icons/${game.id}.jpg`;
  }
  const imgFileName = (game.img || game.image).split("/").pop();
  return `${baseUrl}/icons/${imgFileName}`;
}

export { gameDetails };

