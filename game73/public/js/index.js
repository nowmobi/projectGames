import { loadGameData } from "./BaseURL.js";

let gameDetails = [];

// Search, menu toggle, and category menu functionality are handled by inpublic.js

// 随机打乱数组的函数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCategorySection(games, sectionElement, title) {
  if (!sectionElement || !games || games.length === 0) {
    sectionElement.style.display = 'none';
    return;
  }

  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  
  sectionElement.innerHTML = `
    ${title ? `<h2 class="section-title">${title}</h2>` : ""}
    <div class="game-grid">
      ${games
        .map(
          (game) => `
            <a href="detail.html?id=${game.id}${channelParam}" class="game-card">
              <img src="${game.image}" alt="${game.name}" loading="lazy">
              <span class="game-card-name">${game.name}</span>
              <span class="game-card-meta">${game.category || ""}</span>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

const SECTION_TITLES = [
  "Popular Games",
  "New Releases",
  "Trending Now",
  "Most Played",
  "Editors' Picks",
  "Just Added",
  "Top Rated",
  "Recommended",
];

function generateCategorySections() {
  const categorySections = document.querySelectorAll(".category-section");
  const totalSections = categorySections.length;
  const gamesPerSection = 4;
  const totalGamesNeeded = totalSections * gamesPerSection;

  const validGames = shuffleArray(gameDetails.filter(game =>
    game && game.id !== undefined && game.id !== null && game.image && game.name
  ));

  const availableGames = validGames.slice(0, totalGamesNeeded);

  categorySections.forEach((section, index) => {
    const startIndex = index * gamesPerSection;
    const endIndex = startIndex + gamesPerSection;
    const sectionGames = availableGames.slice(startIndex, endIndex);
    generateCategorySection(sectionGames, section, SECTION_TITLES[index % SECTION_TITLES.length]);
  });
}

function parseDownloads(downloadsStr) {
  if (typeof downloadsStr === "string") {
    if (downloadsStr.includes("K")) {
      return parseFloat(downloadsStr.replace("K", "")) * 1000;
    } else if (downloadsStr.includes("M")) {
      return parseFloat(downloadsStr.replace("M", "")) * 1000000;
    } else {
      return parseFloat(downloadsStr) || 0;
    }
  }
  return 0;
}

function generateFeaturedGames() {
  const container = document.getElementById("featuredGames");
  if (!container) return;

  const validGames = gameDetails.filter(game =>
    game && game.id !== undefined && game.id !== null && game.image && game.name
  );

  if (validGames.length === 0) {
    container.style.display = 'none';
    const featuredTitle = document.getElementById("featuredTitle");
    if (featuredTitle) featuredTitle.style.display = 'none';
    return;
  }

  const featuredGames = shuffleArray(validGames).slice(0, 3);
  const channelParam = window.channel ? `&channel=${window.channel}` : "";

  container.className = "featured-games";
  container.innerHTML = featuredGames.map(game => `
    <a href="detail.html?id=${game.id}${channelParam}" class="featured-game-card">
      <img src="${game.image}" alt="${game.name}">
      <div class="featured-game-info">
        <span class="featured-game-name">${game.name}</span>
        <span class="featured-game-meta">
          ${game.category ? `<span class="featured-game-category">${game.category}</span>` : ""}
          ${game.downloads ? `<span>${game.downloads}</span>` : ""}
        </span>
        <span class="featured-game-desc">${game.description || ""}</span>
      </div>
    </a>
  `).join("");
}

function generateRandomGames() {
  const container = document.getElementById("randomGamesList");
  if (!container) {
    console.log("randomGamesList container not found");
    return;
  }

  console.log("gameDetails length:", gameDetails.length);

  const validGames = gameDetails.filter(game =>
    game && game.id !== undefined && game.id !== null && game.image && game.name
  );

  console.log("validGames length:", validGames.length);

  if (validGames.length === 0) {
    container.innerHTML = '<p>No games available</p>';
    return;
  }

  const randomGames = shuffleArray(validGames).slice(0, 5);
  const channelParam = window.channel ? `&channel=${window.channel}` : "";

  container.innerHTML = randomGames.map((game, index) => {
    const tags = game.tags || game.tag || [];
    const displayTags = Array.isArray(tags) ? tags.slice(0, 3).join(', ') : '';
    const displayName = game.name.length > 30 ? game.name.slice(0, 30) + '...' : game.name;
    return `
    <a href="detail.html?id=${game.id}${channelParam}" class="random-game-item">
      <div class="random-game-left">
        <span class="random-game-number">${index + 1}</span>
        <img src="${game.image}" alt="${game.name}">
      </div>
      <div class="random-game-right">
        <span class="random-game-name">${displayName}</span>
        <span class="random-game-tags">${displayTags || game.category || ''}</span>
      </div>
    </a>
  `;
  }).join("");
}

// Click outside to close menu functionality is handled by inpublic.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    gameDetails = await loadGameData();
    
    generateFeaturedGames();
    generateCategorySections();
    generateRandomGames();
  } catch (error) {
    generateCategorySections();
  }
});