import { loadGameData, categoryIcons, getCategoryName, getCategoryData } from './BaseURL.js';

async function renderCategoryButtons() {
  try {
    const { INFO_TYPE } = await import('./BaseURL.js');
    const infoType = INFO_TYPE;
    
   
    const categoryInfo = await getCategoryData();
    
    let menuItems = null;
    if (categoryInfo && categoryInfo[infoType]) {
      menuItems = categoryInfo[infoType];
      if (!Array.isArray(menuItems) || menuItems.length === 0) {
        menuItems = null;
      }
    }
    
    const categoryButtons = document.getElementById('categoryButtons');
    if (!categoryButtons) {
      return;
    }
    
   
    let categories = [];
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      categories = ["action", "racing", "puzzle", "adventure", "sports", "kids", "girl"];
    } else {
     
      categories = menuItems.map(item => {
        if (typeof item === 'string') {
          return item.toLowerCase();
        } else if (typeof item === 'object') {
          return (item.category || item.cat || item.name || item).toString().toLowerCase();
        } else {
          return String(item).toLowerCase();
        }
      });
    }
    
   
    let buttonsHTML = '';
    categories.forEach(category => {
      const name = getCategoryName(category);
      const icon = categoryIcons[category] || '🎮';
      const channelParam = window.channel ? `&channel=${window.channel}` : '';
      
      buttonsHTML += `
        <button
          class="category-btn"
          onclick="window.location.href='pages/category.html?category=${category}${channelParam}'"
        >
          ${icon} ${name}
        </button>
      `;
    });
    
    categoryButtons.innerHTML = buttonsHTML;
  } catch (error) {
    const categoryButtons = document.getElementById('categoryButtons');
    if (categoryButtons) {
      const defaultCategories = ["action", "racing", "puzzle", "adventure", "sports", "kids", "girl"];
      let buttonsHTML = '';
      defaultCategories.forEach(category => {
        const name = getCategoryName(category);
        const icon = categoryIcons[category] || '🎮';
        const channelParam = window.channel ? `&channel=${window.channel}` : '';
        
        buttonsHTML += `
          <button
            class="category-btn"
            onclick="window.location.href='pages/category.html?category=${category}${channelParam}'"
          >
            ${icon} ${name}
          </button>
        `;
      });
      categoryButtons.innerHTML = buttonsHTML;
    }
  }
}

function getGamesByCategory(games, categories) {
  const categoryGames = {};

  categories.forEach((category) => {
    const gamesInCategory = games.filter(
      (game) => game.category === category
    );
   
    const shuffledGames = [...gamesInCategory];
    for (let i = shuffledGames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledGames[i], shuffledGames[j]] = [
        shuffledGames[j],
        shuffledGames[i],
      ];
    }
   
    categoryGames[category] = shuffledGames.slice(0, 2);
  });

  return categoryGames;
}

function generateGameCard(game, baseUrl, index = 0) {
  const shapeClass = index % 2 === 0 ? 'parallelogram' : 'diamond';
  
  return `
          <a href="detail.html?id=${game.id}${
    window.channel ? "&channel=" + window.channel : ""
  }" class="game-card-link">
              <div class="game-card">
                  <div class="game-thumbnail">
                      <img src="${game.image}" alt="${game.name}" 
                           data-index="${index}"
                           class="game-image ${shapeClass}"
                           onerror="this.onerror=null; this.src='${baseUrl}/icons/${game.id}.jpg';"
                           onload="this.style.opacity='1'"
                           style="opacity: 0; transition: opacity 0.3s ease;">
                  </div>
                  <div class="game-info">
                      <h3 class="game-title">${game.name}</h3>
                      <p class="game-description">${game.description}</p>
                      <div class="game-badge game-rating">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFD700">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                          ${game.rating}
                      </div>
                      <div class="game-badge game-players">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="#9C27B0">
                              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A6.003 6.003 0 0 0 8 13c0 1.1.9 2 2 2s2-.9 2-2c0-.34-.0-.66-.23-.96l1.71-2.27c.19-.25.47-.42.78-.53.31-.11.64-.04.92.12l2.11 1.65c.21.16.47.24.74.24.27 0 .53-.08.74-.24L22 13.5V22h-2z"/>
                          </svg>
                          ${game.downloads}
                      </div>
                  </div>
              </div>
          </a>
      `;
}

async function renderCategoryGames() {
  try {
    const gameDetails = await loadGameData();
    if (gameDetails && gameDetails.length > 0) {
      const { getDataBaseUrl } = await import('./BaseURL.js');
      const baseUrl = getDataBaseUrl();
      
     
      const { INFO_TYPE } = await import('./BaseURL.js');
      const infoType = INFO_TYPE;
      
     
      const categoryInfo = await getCategoryData();
      let menuItems = null;
      if (categoryInfo && categoryInfo[infoType]) {
        menuItems = categoryInfo[infoType];
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
          menuItems = null;
        }
      }
      let categories = [];
      
      if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
       
        categories = ["action", "racing", "puzzle", "adventure", "sports", "kids", "girl"];
      } else {
       
        categories = menuItems.map(item => {
          if (typeof item === 'string') {
            return item.toLowerCase();
          } else if (typeof item === 'object') {
            return (item.category || item.cat || item.name || item).toString().toLowerCase();
          } else {
            return String(item).toLowerCase();
          }
        });
      }
      
      const categoryGames = getGamesByCategory(gameDetails, categories);
      
     
      const categoryGamesContainer = document.getElementById('categoryGamesContainer');
      
      if (categoryGamesContainer) {
        const sections = categoryGamesContainer.querySelectorAll('.category-games-section');
        
        sections.forEach((section, index) => {
          if (index < categories.length) {
            const category = categories[index];
            const containerId = category.charAt(0).toUpperCase() + category.slice(1) + 'Games';
            
           
            let gamesContainer = section.querySelector('.featured-games');
            if (!gamesContainer) {
              gamesContainer = document.createElement('div');
              gamesContainer.className = 'featured-games';
              gamesContainer.id = containerId;
              section.appendChild(gamesContainer);
            }
            
           
            const games = categoryGames[category] || [];
            const gamesCardsHTML = games.map((game, gameIndex) => generateGameCard(game, baseUrl, gameIndex)).join('');
            gamesContainer.innerHTML = gamesCardsHTML;
          }
        });
      }
    }
  } catch (error) {
    console.error("Error loading game data:", error);
  }
}


if (window.location.pathname === "/" || 
    window.location.pathname === "/index.html" || 
    window.location.pathname.endsWith("/")) {
  document.addEventListener("DOMContentLoaded", async () => {
    window.scrollTo(0, 0);
   
    await renderCategoryButtons();
    await renderCategoryGames();
  });
}

