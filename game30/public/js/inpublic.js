
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("channel")) {
  window.channel = urlParams.get("channel");
}


class GameSquareApp {
  constructor() {
    this.init();
  }

  init() {
    this.initHeader();
    this.initSearch();
    this.initSidebar();
    this.bindEvents();
  }

 
  initHeader() {
    // Header is now statically defined in index.html
  }

 
  initSearch() {
    const searchPanel = document.createElement("div");
    searchPanel.className = "search-panel";
    searchPanel.id = "searchPanel";
    searchPanel.style.display = "none";
    searchPanel.innerHTML = `
            <div class="search-header">
                <button class="back-btn" id="searchBackBtn">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 12H5m7 7l-7-7 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="search-title">Search Games</div>
            </div>
            <div class="search-input-container">
                <input type="text" class="search-input" id="searchInput" placeholder="Search games...">
                <button class="search-clear" id="searchClearBtn">×</button>
            </div>
            <div class="search-results" id="searchResults"></div>
            <div class="search-tip">
                <span>Tip: Press ESC or click the back button in the upper left corner to exit search</span>
            </div>
        `;
    document.body.appendChild(searchPanel);
    }

 
  initSidebar() {
   
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebarOverlay";
    document.body.appendChild(overlay);

    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";
    sidebar.id = "sidebar";
    sidebar.style.display = "none";
    sidebar.innerHTML = `
            <div class="sidebar-header">
                <button class="close-btn" id="closeBtn">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <ul class="menu-list" id="sidebarMenuList">
                <li class="menu-item" data-category="home">
                    <span class="menu-icon">🏠</span>
                    <span class="menu-text">Home</span>
                </li>
            </ul>
        `;
    document.body.appendChild(sidebar);
    
   
    this.loadSidebarMenu();
  }
  
  async loadSidebarMenu() {
    try {
      const { categoryIcons, getCategoryName, INFO_TYPE, getCategoryData } = await import('./BaseURL.js');
      const infoType = INFO_TYPE;
      
      // 使用 getCategoryData() 代替直接 fetch，避免重复请求
      const categoryInfo = await getCategoryData();
      
      let menuItems = null;
      if (categoryInfo && categoryInfo[infoType]) {
        menuItems = categoryInfo[infoType];
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
          menuItems = null;
        }
      }
      
      const menuList = document.getElementById('sidebarMenuList');
      if (!menuList) {
        return;
      }
      
     
      if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
        this.renderDefaultMenu(menuList);
        return;
      }
      
     
      let menuHTML = `
        <li class="menu-item" data-category="home">
          <span class="menu-icon">🏠</span>
          <span class="menu-text">Home</span>
        </li>
      `;
      
     
      menuItems.forEach(item => {
       
       
        let category, name, icon;
        
        if (typeof item === 'string') {
         
          category = item.toLowerCase();
          name = getCategoryName(category);
          icon = categoryIcons[category] || '🎮';
        } else if (typeof item === 'object') {
         
          category = (item.category || item.cat || item.name || item).toString().toLowerCase();
          name = item.name || item.title || getCategoryName(category);
          icon = item.icon || categoryIcons[category] || '🎮';
        } else {
         
          category = String(item).toLowerCase();
          name = getCategoryName(category);
          icon = categoryIcons[category] || '🎮';
        }
        
        menuHTML += `
          <li class="menu-item" data-category="${category}">
            <span class="menu-icon">${icon}</span>
            <span class="menu-text">${name}</span>
          </li>
        `;
      });
      
      menuList.innerHTML = menuHTML;
    } catch (error) {
      const menuList = document.getElementById('sidebarMenuList');
      if (menuList) {
        this.renderDefaultMenu(menuList);
      }
    }
  }
  
  renderDefaultMenu(menuList) {
    menuList.innerHTML = `
      <li class="menu-item" data-category="home">
        <span class="menu-icon">🏠</span>
        <span class="menu-text">Home</span>
      </li>
      <li class="menu-item" data-category="action">
        <span class="menu-icon">⚡</span>
        <span class="menu-text">Action Games</span>
      </li>
      <li class="menu-item" data-category="racing">
        <span class="menu-icon">🏎️</span>
        <span class="menu-text">Racing Games</span>
      </li>
      <li class="menu-item" data-category="puzzle">
        <span class="menu-icon">🧩</span>
        <span class="menu-text">Puzzle Games</span>
      </li>
      <li class="menu-item" data-category="adventure">
        <span class="menu-icon">🗺️</span>
        <span class="menu-text">Adventure Games</span>
      </li>
      <li class="menu-item" data-category="sports">
        <span class="menu-icon">⚽</span>
        <span class="menu-text">Sports Games</span>
      </li>
      <li class="menu-item" data-category="kids">
        <span class="menu-icon">👶</span>
        <span class="menu-text">Kids Games</span>
      </li>
      <li class="menu-item" data-category="girl">
        <span class="menu-icon">👑</span>
        <span class="menu-text">Girl Games</span>
      </li>
    `;
  }
 
  bindEvents() {
   
    this.hideSearch();
    this.hideSidebar();

   
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showSearch();
      });
    } else {
      console.error("Search button not found!");
    }

   
    document.getElementById("menuBtn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showSidebar();
    });

   
    document.getElementById("searchBackBtn").addEventListener("click", () => {
      this.hideSearch();
    });

   
    document.getElementById("closeBtn").addEventListener("click", () => {
      this.hideSidebar();
    });

   
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

   
    document.getElementById("searchClearBtn").addEventListener("click", () => {
      searchInput.value = "";
      this.clearSearchResults();
    });

   
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideSearch();
        this.hideSidebar();
      }
    });

   
   
   
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.addEventListener("click", (e) => {
        const menuItem = e.target.closest(".menu-item");
        if (menuItem) {
          const category = menuItem.dataset.category;
          this.handleMenuClick(category);
        }
      });
    }

   
    document.getElementById("sidebarOverlay").addEventListener("click", () => {
      this.hideSidebar();
    });

   
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#sidebar") && !e.target.closest("#menuBtn")) {
        this.hideSidebar();
      }
    });
  }

 
  showSearch() {
    const searchPanel = document.getElementById("searchPanel");
    if (!searchPanel) {
      return;
    }

    searchPanel.style.display = "block";
    searchPanel.style.zIndex = "1003";

    setTimeout(() => {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);

    this.clearSearchResults();
  }

 
  hideSearch() {
    const searchPanel = document.getElementById("searchPanel");
    if (!searchPanel) {
      return;
    }

    searchPanel.style.display = "none";
    searchPanel.style.zIndex = "1001";

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
    }

    this.clearSearchResults();
  }

 
  showSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

   
    overlay.style.display = "block";
    setTimeout(() => {
      overlay.classList.add("active");
    }, 10);

   
    sidebar.style.display = "block";
    sidebar.classList.add("open");
  }

 
  hideSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

   
    sidebar.classList.remove("open");

   
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.style.display = "none";
      sidebar.style.display = "none";
    }, 300);
  }

 
  async handleSearch(query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.clearSearchResults();
      return;
    }

    const searchResults = document.getElementById("searchResults");
    if (!searchResults) {
      return;
    }

   
    searchResults.innerHTML = '<p class="tac mt-20">Searching...</p>';

    try {
      const { loadGameData } = await import("./BaseURL.js");
      const gameDetails = await loadGameData();
      
     
      if (!gameDetails || !Array.isArray(gameDetails) || gameDetails.length === 0) {
        searchResults.innerHTML = '<p class="tac mt-20">No game data available. Please refresh the page.</p>';
        return;
      }
      
      const results = this.searchGames(trimmedQuery, gameDetails);
      await this.displaySearchResults(results);
    } catch (error) {
      searchResults.innerHTML = '<p class="tac mt-20">Error loading game data. Please try again.</p>';
    }
  }

 
  searchGames(query, gameData) {
    if (!gameData || !Array.isArray(gameData) || gameData.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    if (!queryLower) {
      return [];
    }

    const results = gameData.filter((game) => {
     
      if (!game || typeof game !== 'object') {
        return false;
      }
      
     
      const gameName = (game.name || game.title || game.gameName || '').toString().toLowerCase();
      const gameCategory = (game.category || game.type || game.cat || '').toString().toLowerCase();
      const gameDescription = (game.description || game.desc || '').toString().toLowerCase();
      
     
      return gameName.includes(queryLower) || 
             gameCategory.includes(queryLower) ||
             gameDescription.includes(queryLower);
    });
    
    return results;
  }

 
  async displaySearchResults(results) {
    const searchResults = document.getElementById("searchResults");

    if (results.length === 0) {
      searchResults.innerHTML = '<p class="tac mt-20">No results found</p>';
      return;
    }

    const pathPrefix = window.location.pathname.includes("/pages/")
      ? "../"
      : "";
    
   
    const { getDataBaseUrl } = await import('./BaseURL.js');
    const baseUrl = getDataBaseUrl();

    const resultsHtml = results
      .map(
        (game) => `
            <div class="search-result-item" onclick="window.location.href='${pathPrefix}detail.html?id=${
          game.id
        }${window.channel ? "&channel=" + window.channel : ""}'">
                <div class="search-result-icon">
                    <img src="${game.image}" alt="${
          game.name
        }" onerror="this.src='${baseUrl}/icons/${game.id}.jpg'">
                </div>
                <div class="search-result-info">
                    <div class="search-result-title">${game.name}</div>
                    <div class="search-result-category">${game.category}</div>
                </div>
            </div>
        `
      )
      .join("");

    searchResults.innerHTML = `
            <div class="tac mb-20">${results.length} results found</div>
            ${resultsHtml}
        `;
  }

 
  clearSearchResults() {
    document.getElementById("searchResults").innerHTML = "";
  }

 
  handleMenuClick(category) {
    this.hideSidebar();

   
    const pathPrefix = window.location.pathname.includes("/pages/")
      ? "../"
      : "";

    if (category === "home") {
      window.location.href = `${pathPrefix}index.html${
        window.channel ? "?channel=" + window.channel : ""
      }`;
    } else {
      window.location.href = `${pathPrefix}pages/category.html?category=${category}${
        window.channel ? "&channel=" + window.channel : ""
      }`;
    }
  }

 
}


document.addEventListener("DOMContentLoaded", () => {
  window.gameApp = new GameSquareApp();

 
  setTimeout(() => {
    if (window.gameApp) {
      window.gameApp.hideSearch();
      window.gameApp.hideSidebar();
    }
  }, 100);
});


window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});


if (typeof module !== "undefined" && module.exports) {
  module.exports = GameSquareApp;
}




const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'rating', label: 'Rating' },
    { key: 'popular', label: 'Popular' },
    { key: 'random', label: 'Random' }
];

function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category');
}

function filterGamesByCategory(category, gameDetails) {
    return gameDetails.filter(game => game.category === category);
}

window.sortGames = async function(sortType) {
    const category = getCategoryFromUrl();
    const { loadGameData } = await import('./BaseURL.js');
    const gameDetails = await loadGameData();
    let games = filterGamesByCategory(category, gameDetails);
    
    switch (sortType) {
        case 'name':
            games.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            games.sort((a, b) => b.rating - a.rating);
            break;
        case 'popular':
            games.sort((a, b) => {
                const aDownloads = parseInt(a.downloads.replace(/[^0-9]/g, ''));
                const bDownloads = parseInt(b.downloads.replace(/[^0-9]/g, ''));
                return bDownloads - aDownloads;
            });
            break;
        case 'random':
            games.sort(() => 0.5 - Math.random());
            break;
    }
    
    updateSortButtons(sortType);
    await renderGamesList(games);
};

function updateSortButtons(activeSort) {
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === activeSort) {
            btn.classList.add('active');
        }
    });
}


function generateCategoryGameCard(game, baseUrl, index = 0) {
    const shapeClass = index % 2 === 0 ? 'parallelogram' : 'diamond';
    
    return `
        <a href="../detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="game-card-link">
            <div class="game-card">
                <div class="game-thumbnail">
                    <img src="${game.image}" alt="${game.name}" 
                         data-index="${index}"
                         class="game-image ${shapeClass}"
                         onerror="this.src='${baseUrl}/icons/${game.id}.jpg'"
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
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A6.003 6.003 0 0 0 8 13c0 1.1.9 2 2 2s2-.9 2-2c0-.34-.09-.66-.23-.96l1.71-2.27c.19-.25.47-.42.78-.53.31-.11.64-.04.92.12l2.11 1.65c.21.16.47.24.74.24.27 0 .53-.08.74-.24L22 13.5V22h-2z"/>
                        </svg>
                        ${game.downloads}
                    </div>
                </div>
            </div>
        </a>
    `;
}

async function renderGamesList(games) {
    const gamesList = document.querySelector('.games-list');
    if (gamesList) {
        const { getDataBaseUrl } = await import('./BaseURL.js');
        const baseUrl = getDataBaseUrl();
        const gamesCardsHTML = games.map((game, index) => generateCategoryGameCard(game, baseUrl, index)).join('');
        gamesList.innerHTML = gamesCardsHTML;
    }
}

async function renderCategoryPage(category, games) {
    const { categoryConfig } = await import('./BaseURL.js');
    const config = categoryConfig[category] || {
        name: 'Unknown Category',
        icon: '❓'
    };

    const categoryContent = document.getElementById('categoryContent');
    const { getDataBaseUrl } = await import('./BaseURL.js');
    const baseUrl = getDataBaseUrl();
    
    categoryContent.innerHTML = `
        
        <div class="category-section">
            <div class="category-header">
                <div class="category-icon">${config.icon}</div>
                <h1 class="category-title">${config.name}</h1>
                <div class="category-count">${games.length} games</div>
            </div>

            
            <div class="sort-options">
                ${sortOptions.map(option => `
                    <button class="sort-btn ${option.key === 'popular' ? 'active' : ''}" 
                            onclick="sortGames('${option.key}')">
                        ${option.label}
                    </button>
                `).join('')}
            </div>

            
            <div class="games-list">
                ${games.map(game => generateCategoryGameCard(game, baseUrl)).join('')}
            </div>
        </div>
    `;
}

function showError(message) {
    const categoryContent = document.getElementById('categoryContent');
    categoryContent.innerHTML = `
        <div class="error">
            <h2>Error</h2>
            <p>${message}</p>
            <a href="../index.html${window.channel ? '?channel=' + window.channel : ''}" class="back-home-btn">Back to Home</a>
        </div>
    `;
}

async function showNoGames(category) {
    const { categoryConfig } = await import('./BaseURL.js');
    const config = categoryConfig[category] || {
        name: 'Unknown Category'
    };
    
    const categoryContent = document.getElementById('categoryContent');
    categoryContent.innerHTML = `
        <div class="category-header">
            <div class="category-icon">❓</div>
            <h1 class="category-title">${config.name}</h1>
            <div class="category-count">0 games</div>
        </div>
        
        <div class="no-games">
            <h3>No games found</h3>
            <p>There are currently no games available in the ${config.name} category.</p>
            <a href="../index.html${window.channel ? '?channel=' + window.channel : ''}" class="back-home-btn">Back to Home</a>
        </div>
    `;
}


if (window.location.pathname.includes('/pages/category.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const category = getCategoryFromUrl();
        
        if (!category) {
            showError('No category specified');
            return;
        }

        try {
            const { loadGameData } = await import('./BaseURL.js');
            const gameDetails = await loadGameData();
            const games = filterGamesByCategory(category, gameDetails);
            
            if (games.length === 0) {
                await showNoGames(category);
            } else {
                await renderCategoryPage(category, games);
                sortGames('popular');
            }
        } catch (error) {
            showError('Failed to load games');
        }
        
        window.scrollTo(0, 0);
    });
}


if (window.location.pathname.includes('/pages/about.html') || 
    window.location.pathname.includes('/pages/privacy.html') || 
    window.location.pathname.includes('/pages/terms.html')) {
    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
    });
}



