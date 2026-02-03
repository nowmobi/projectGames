import {
  loadGameData,
  getGameDetail,
  getGameUrl,
  getDataBaseUrl,
  getImgUrl,
} from './BaseURL.js';

function getGameIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function createDefaultGameDetail(gameId) {
  const baseUrl = getDataBaseUrl();
  return {
    id: parseInt(gameId, 10),
    name: "Game " + gameId,
    description: "Experience exciting gameplay in this amazing game!",
    rating: 4,
    downloads: "214.0K",
    image: `${baseUrl}/icons/${gameId}.jpg`,
    category: "action",
  };
}

function renderGameDetail(game, recommendedGames = []) {
  const gameDetailContainer = document.getElementById("gameDetail");
  const gameUrl = getGameUrl(game.id);
  const baseUrl = getDataBaseUrl();

 
  let recommendedGamesHTML = "";
  if (recommendedGames.length > 0) {
    recommendedGamesHTML = recommendedGames.map(recGame => {
      const recGameUrl = getImgUrl(recGame);
      return `
        <div class="more-game-card" onclick="window.location.href='detail.html?id=${recGame.id}${
        window.channel ? "&channel=" + window.channel : ""
      }'">
            <div class="more-game-icon">
                <img src="${recGameUrl}" alt="${recGame.name}" onerror="this.src='${baseUrl}/icons/${recGame.id}.jpg'">
            </div>
            <div class="more-game-name">${recGame.name}</div>
        </div>
      `;
    }).join("");
  }
  
 
  const moreGamesSectionHTML = recommendedGames.length > 0 ? `
    <div class="more-games-section">
        <h3 class="more-games-title">Play More Games</h3>
        <div class="more-games-grid">
            ${recommendedGamesHTML}
        </div>
    </div>
  ` : "";

  gameDetailContainer.innerHTML = `
          
          <div class="game-main-content">                    
              
              <div class="game-title-section">
                  <p class="game-title-subtitle">${game.name}</p>
              </div>

              <div class="game-card-container">
                  <img src="${game.image}" alt="${
    game.name
  }" class="game-thumbnail" onerror="this.onerror=null; this.src='${baseUrl}/icons/${game.id}.jpg';" onload="this.style.opacity='1'" style="opacity: 0; transition: opacity 0.3s ease;">
                  
                  <a href="${gameUrl}${
    window.channel ? "?channel=" + window.channel : ""
  }" class="play-now-btn">
                      Play Now!
                  </a>
              </div>

              <div class="advertisement-container">
                  <div class="advertisement-label">HAPPY GAME!</div>
              </div>

              <div class="description-section">
                  <h3 class="section-title">Description</h3>
                  <p class="description-text">${game.description || "Experience exciting gameplay in this amazing game!"}</p>
                  
                  <div class="game-info-grid">
                      <div class="info-item">
                          <span class="info-label">Rating:</span>
                          <svg class="star-icon" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                          <span class="info-value">${game.rating || 4}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Play Count:</span>
                          <span class="info-value">${game.downloads || "214.0K"}</span>
                      </div>
                  </div>
              </div>

              ${moreGamesSectionHTML}
          </div>
      `;
}

function showError(message) {
  const gameDetailContainer = document.getElementById("gameDetail");
  gameDetailContainer.innerHTML = `
          <div class="error">
              <h2>Error</h2>
              <p>${message}</p>
              <a href="index.html${
    window.channel ? "?channel=" + window.channel : ""
  }" class="btn btn-primary">Back to Home</a>
          </div>
      `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gameId = getGameIdFromUrl();

  if (!gameId) {
    showError("No game ID provided");
    return;
  }

  try {
    const gameDetails = await loadGameData();
    let game = getGameDetail(gameId);

    if (!game) {
      game = createDefaultGameDetail(gameId);
    }

   
   
    let recommendedGames = [];
    if (gameDetails && gameDetails.length > 0) {
      const currentGameId = parseInt(gameId, 10);
     
      const otherGames = gameDetails.filter(g => g && g.id && g.id !== currentGameId);
      
      if (otherGames.length > 0) {
       
        const shuffled = [...otherGames].sort(() => 0.5 - Math.random());
        recommendedGames = shuffled.slice(0, 4);
      }
    }

    renderGameDetail(game, recommendedGames);
  } catch (error) {
    const game = createDefaultGameDetail(gameId);
    renderGameDetail(game, []);
  }

  window.scrollTo(0, 0);
});

