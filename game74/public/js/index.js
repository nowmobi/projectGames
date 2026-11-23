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

// 单个游戏卡片
function buildGameCard(game) {
  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  const card = document.createElement("a");
  card.href = `detail.html?id=${game.id}${channelParam}`;
  card.className = "game-card";
  card.innerHTML = `
    <img src="${game.image}" alt="${game.name}" loading="lazy">
    <span class="game-card-name">${game.name}</span>
    <span class="game-card-meta">${game.category || ""}</span>
  `;
  return card;
}

// 首页分区的外层结构（标题 + game-grid + game-slot）已写在 index.html 中，
// 这里只按顺序把卡片填进槽位，HTML 里插入的广告不会被覆盖
function generateCategorySections() {
  const slots = Array.from(document.querySelectorAll(".category-section .game-slot"));
  if (slots.length === 0) return;

  const validGames = shuffleArray(
    gameDetails.filter(
      (game) => game && game.id !== undefined && game.id !== null && game.image && game.name
    )
  );

  slots.forEach((slot, index) => {
    const game = validGames[index];
    if (!game) {
      slot.remove();
      return;
    }
    slot.replaceWith(buildGameCard(game));
  });

  // 没拿到卡片的分区整块隐藏
  document.querySelectorAll(".category-section").forEach((section) => {
    if (!section.querySelector(".game-card")) {
      section.style.display = "none";
    }
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

// 单张精选大卡
function buildFeaturedCard(game) {
  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  const card = document.createElement("a");
  card.href = `detail.html?id=${game.id}${channelParam}`;
  card.className = "featured-game-card";
  card.innerHTML = `
    <img src="${game.image}" alt="${game.name}">
    <div class="featured-game-info">
      <span class="featured-game-name">${game.name}</span>
      <span class="featured-game-meta">
        ${game.category ? `<span class="featured-game-category">${game.category}</span>` : ""}
        ${game.downloads ? `<span>${game.downloads}</span>` : ""}
      </span>
      <span class="featured-game-desc">${game.description || ""}</span>
    </div>
  `;
  return card;
}

// 精选区外壳（#featuredGames.featured-games + featured-slot）已写在 index.html 中，
// 这里只按顺序把卡片填进槽位
function generateFeaturedGames() {
  const container = document.getElementById("featuredGames");
  const featuredTitle = document.getElementById("featuredTitle");
  if (!container) return;

  const slots = Array.from(container.querySelectorAll(".featured-slot"));
  if (slots.length === 0) return;

  const validGames = shuffleArray(
    gameDetails.filter(
      (game) => game && game.id !== undefined && game.id !== null && game.image && game.name
    )
  );

  slots.forEach((slot, index) => {
    const game = validGames[index];
    if (!game) {
      slot.remove();
      return;
    }
    slot.replaceWith(buildFeaturedCard(game));
  });

  // 没有拿到卡片就把标题一起隐藏
  const hasCard = !!container.querySelector(".featured-game-card");
  container.style.display = hasCard ? "" : "none";
  if (featuredTitle) featuredTitle.style.display = hasCard ? "" : "none";
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