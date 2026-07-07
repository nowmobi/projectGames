import { loadGameData } from "./BaseURL.js";

let gameDetails = [];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadFunGames() {
  const funGamesContainer = document.getElementById("funGamesContainer");
  if (!funGamesContainer) return;

  try {
    gameDetails = await loadGameData();
    
    const categories = ["puzzle", "action", "adventure", "racing", "sports", "kids"];
    const funGames = [];
    
    categories.forEach(category => {
      const categoryGames = gameDetails.filter(game => game.category === category && game.image && game.name);
      if (categoryGames.length > 0) {
        const randomGame = shuffleArray(categoryGames)[0];
        funGames.push(randomGame);
      }
    });
    
    const channelParam = window.channel ? `&channel=${window.channel}` : "";
    
    funGamesContainer.innerHTML = funGames.map(game => `
      <a href="detail.html?id=${game.id}${channelParam}" class="fun-game-card">
        <img src="${game.image}" alt="${game.name}">
        <div class="fun-game-name">${game.name}</div>
      </a>
    `).join("");
    
  } catch (error) {
    console.error("Failed to load fun games:", error);
  }
}

async function loadSurpriseGames() {
  const surpriseGamesGrid = document.getElementById("surpriseGamesGrid");
  if (!surpriseGamesGrid) return;

  try {
    if (gameDetails.length === 0) {
      gameDetails = await loadGameData();
    }
    
    const validGames = gameDetails.filter(game => game.image && game.name);
    const surpriseGames = shuffleArray(validGames).slice(0, 8);
    
    const channelParam = window.channel ? `&channel=${window.channel}` : "";
    
    const gameCards = surpriseGamesGrid.querySelectorAll(".surprise-game-card");
    gameCards.forEach((card, index) => {
      if (index < surpriseGames.length) {
        const game = surpriseGames[index];
        const img = card.querySelector(".surprise-game-img");
        const name = card.querySelector(".surprise-game-name");
        
        img.src = game.image;
        img.alt = game.name;
        name.textContent = game.name;
        card.href = `detail.html?id=${game.id}${channelParam}`;
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
    
  } catch (error) {
    console.error("Failed to load surprise games:", error);
  }
}

async function loadOnlineGames() {
  const onlineGamesList = document.getElementById("onlineGamesList");
  if (!onlineGamesList) return;

  try {
    if (gameDetails.length === 0) {
      gameDetails = await loadGameData();
    }
    
    const categories = ["puzzle", "action", "adventure", "racing"];
    const onlineGames = [];
    
    categories.forEach(category => {
      const categoryGames = gameDetails.filter(game => game.category === category && game.image && game.name);
      if (categoryGames.length > 0) {
        const randomGame = shuffleArray(categoryGames)[0];
        onlineGames.push(randomGame);
      }
    });
    
    const channelParam = window.channel ? `&channel=${window.channel}` : "";
    
    const gameCards = onlineGamesList.querySelectorAll(".online-game-card");
    gameCards.forEach((card, index) => {
      if (index < onlineGames.length) {
        const game = onlineGames[index];
        const img = card.querySelector(".online-game-img");
        const name = card.querySelector(".online-game-name");
        const download = card.querySelector(".online-game-download span:first-child");
        
        img.src = game.image;
        img.alt = game.name;
        name.textContent = game.name;
        download.textContent = game.downloads || "0";
        card.href = `detail.html?id=${game.id}${channelParam}`;
      } else {
        card.style.display = "none";
      }
    });
    
  } catch (error) {
    console.error("Failed to load online games:", error);
  }
}

async function loadRecommendGames() {
  const recommendGamesContainer = document.getElementById("recommendGamesContainer");
  if (!recommendGamesContainer) return;

  try {
    if (gameDetails.length === 0) {
      gameDetails = await loadGameData();
    }
    
    const categories = ["puzzle", "action", "adventure", "racing", "sports", "kids"];
    const recommendGames = [];
    
    categories.forEach(category => {
      const categoryGames = gameDetails.filter(game => game.category === category && game.image && game.name);
      if (categoryGames.length > 0) {
        const randomGame = shuffleArray(categoryGames)[0];
        recommendGames.push(randomGame);
      }
    });
    
    const channelParam = window.channel ? `&channel=${window.channel}` : "";
    
    recommendGamesContainer.innerHTML = recommendGames.map(game => `
      <a href="detail.html?id=${game.id}${channelParam}" class="fun-game-card">
        <img src="${game.image}" alt="${game.name}">
        <div class="fun-game-name">${game.name}</div>
      </a>
    `).join("");
    
  } catch (error) {
    console.error("Failed to load recommend games:", error);
  }
}

async function loadTopGames() {
  const topGamesList = document.getElementById("topGamesList");
  if (!topGamesList) return;

  try {
    if (gameDetails.length === 0) {
      gameDetails = await loadGameData();
    }
    
    const categories = ["puzzle", "action", "adventure", "racing", "sports"];
    const topGames = [];
    
    categories.forEach(category => {
      const categoryGames = gameDetails.filter(game => game.category === category && game.image && game.name);
      if (categoryGames.length > 0) {
        const randomGame = shuffleArray(categoryGames)[0];
        topGames.push(randomGame);
      }
    });
    
    const channelParam = window.channel ? `&channel=${window.channel}` : "";
    
    const gameCards = topGamesList.querySelectorAll(".top-game-card");
    gameCards.forEach((card, index) => {
      if (index < topGames.length) {
        const game = topGames[index];
        const img = card.querySelector(".top-game-img");
        const name = card.querySelector(".top-game-name");
        
        img.src = game.image;
        img.alt = game.name;
        name.textContent = game.name;
        card.href = `detail.html?id=${game.id}${channelParam}`;
      } else {
        card.style.display = "none";
      }
    });
    
  } catch (error) {
    console.error("Failed to load top games:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFunGames();
  loadSurpriseGames();
  loadOnlineGames();
  loadRecommendGames();
  loadTopGames();
});
