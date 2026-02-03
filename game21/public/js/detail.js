import {
  loadGameData,
  getGameDetail,
  getDataBaseUrl,
  getGameUrl,
} from "./BaseURL.js";

let gameDetails = [];

function createDefaultGameDetail(id) {
  const numericId = parseInt(id, 10);
  const baseUrl = getDataBaseUrl();
  return {
    id: numericId,
    name: `Game ${numericId}`,
    description: "Game description not available",
    category: "action",
    rating: 5,
    downloads: "0",
    image: `${baseUrl}/icons/${numericId}.jpg`
  };
}

// Search, menu toggle, and category menu functionality are handled by inpublic.js

const gameIcon = document.getElementById("gameIcon");
const gameTitle = document.getElementById("gameTitle");
const gameCategory = document.getElementById("gameCategory");
const gameStars = document.getElementById("gameStars");
const ratingText = document.getElementById("ratingText");
const gameDescription = document.getElementById("gameDescription");
const playButton = document.getElementById("playButton");
const recommendedGames = document.getElementById("recommendedGames");

 
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

 
async function loadGameDetail() {
  const gameId = getUrlParameter("id");

  if (!gameId) {
    window.location.href =
      "index.html" + (window.channel ? "?channel=" + window.channel : "");
    return;
  }

 
  gameDetails = await loadGameData();
  
  const game = getGameDetail(gameId);

  if (!game) {
    const defaultGame = createDefaultGameDetail(gameId);
    displayGameDetail(defaultGame);
    return;
  }

  displayGameDetail(game);
  generateRecommendedGames(game);
}

 
function showGameUnavailableMessage(gameName) {
 
  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        margin: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

  modalContent.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h3 style="color: #333; margin-bottom: 15px;">Game Unavailable</h3>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
            Sorry, "${gameName}" is currently unavailable or under maintenance.
        </p>
        <p style="color: #888; font-size: 14px; margin-bottom: 25px;">
            Please try again later or choose another game.
        </p>
        <button onclick="this.closest('.game-unavailable-modal').remove()" 
                style="background: #007bff; color: white; border: none; padding: 12px 25px; 
                       border-radius: 8px; cursor: pointer; font-size: 16px;">
            OK, I Understand
        </button>
    `;

  modal.className = "game-unavailable-modal";
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

 
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

 
function displayGameDetail(game) {
  gameIcon.src = game.image;
  gameIcon.alt = game.name;

  gameIcon.onerror = function () {
    this.style.display = "none";
    const fallbackDiv = document.createElement("div");
    fallbackDiv.className = "game-icon-fallback";
    fallbackDiv.textContent = game.name;
    fallbackDiv.style.cssText = `
            width: 110px;
            height: 110px;
            border-radius: 18px;
            background: #20b2aa;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            word-wrap: break-word;
            line-height: 1.2;
        `;
    this.parentNode.insertBefore(fallbackDiv, this);
  };

  gameTitle.textContent = game.name;
  gameCategory.textContent = game.category.toUpperCase();
  gameStars.innerHTML = "★".repeat(game.rating);
  ratingText.textContent = `${game.rating}/5`;
  gameDescription.textContent = game.description;
 
 
  const gamePath = getGameUrl(game.id);
  playButton.href = gamePath;

  playButton.onclick = function (e) {
   
    fetch(gamePath, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) {
          e.preventDefault();
          showGameUnavailableMessage(game.name);
        }
       
      })
      .catch((error) => {
       
       
      });
  };
}

 
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRecommendedGames(currentGame) {
 
  const validGames = gameDetails.filter(
    (game) =>
      game &&
      game.id !== undefined &&
      game.id !== null &&
      game.id !== currentGame.id &&
      typeof game.id === 'number' &&
      !isNaN(game.id)
  );

  if (validGames.length === 0) {
    recommendedGames.innerHTML = '<p>No recommended games available.</p>';
    return;
  }

 
  const shuffledGames = shuffleArray(validGames);
  
 
  const recommended = shuffledGames.slice(0, 4);

  recommendedGames.innerHTML = recommended
    .map(
      (game) => `
        <a href="productDetails.html?id=${game.id}${
        window.channel ? "&channel=" + window.channel : ""
      }" class="recommended-game">
          <img src="${game.image}" alt="${game.name}">
          <h3>${game.name}</h3>
        </a>
      `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadGameDetail();
});

