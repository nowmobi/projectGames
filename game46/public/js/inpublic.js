



function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}


async function initSidebarMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const categoriesMenu = document.getElementById("categoriesMenu");
  const closeCategories = document.getElementById("closeCategories");

  if (!menuToggle || !categoriesMenu || !closeCategories) {
    console.warn("Sidebar elements not found");
    return;
  }

  
  try {
    
    const baseUrlModule = await import("./BaseURL.js");
    const getCategoryOrder = baseUrlModule.getCategoryOrder;
    
    const categories = await getCategoryOrder();

    
    generateSidebarMenuItems(categories, categoriesMenu);
    
    
    attachSidebarEventListeners(menuToggle, categoriesMenu, closeCategories);
  } catch (error) {
    console.error("Failed to initialize sidebar menu:", error);
    
    const categoryItems = document.querySelectorAll(".category-item");
    if (categoryItems.length > 0) {
      attachSidebarEventListeners(menuToggle, categoriesMenu, closeCategories);
    }
  }
}

function generateSidebarMenuItems(categories, categoriesMenu) {
  
  let categoriesList = categoriesMenu.querySelector(".categories-list");
  if (!categoriesList) {
    
    const categoriesHeader = categoriesMenu.querySelector(".categories-header");
    if (categoriesHeader) {
      categoriesList = document.createElement("div");
      categoriesList.className = "categories-list";
      categoriesHeader.insertAdjacentElement("afterend", categoriesList);
    } else {
      
      categoriesList = document.createElement("div");
      categoriesList.className = "categories-list";
      categoriesMenu.appendChild(categoriesList);
    }
  }

  
  const existingItems = categoriesList.querySelectorAll(".category-item:not([data-category='home']):not([data-category='all'])");
  existingItems.forEach(item => item.remove());

  
  if (!categoriesList.querySelector("[data-category='home']")) {
    const homeItem = document.createElement("div");
    homeItem.className = "category-item";
    homeItem.setAttribute("data-category", "home");
    homeItem.innerHTML = '<span class="category-name">Home</span>';
    categoriesList.insertBefore(homeItem, categoriesList.firstChild);
  }

  
  if (!categoriesList.querySelector("[data-category='all']")) {
    const allItem = document.createElement("div");
    allItem.className = "category-item";
    allItem.setAttribute("data-category", "all");
    allItem.innerHTML = '<span class="category-name">All Games</span>';
    const homeItem = categoriesList.querySelector("[data-category='home']");
    if (homeItem) {
      homeItem.insertAdjacentElement("afterend", allItem);
    } else {
      categoriesList.insertBefore(allItem, categoriesList.firstChild);
    }
  }

  
  categories.forEach((category) => {
    
    if (categoriesList.querySelector(`[data-category='${category}']`)) {
      return;
    }

    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";
    categoryItem.setAttribute("data-category", category);
    
    
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    if (category === "girl") {
      categoryItem.innerHTML = '<span class="category-name">Girls</span>';
    } else {
      categoryItem.innerHTML = `<span class="category-name">${categoryName}</span>`;
    }
    
    categoriesList.appendChild(categoryItem);
  });
}

function attachSidebarEventListeners(menuToggle, categoriesMenu, closeCategories) {
  
  menuToggle.addEventListener("click", () => {
    categoriesMenu.classList.add("active");
  });

  
  closeCategories.addEventListener("click", () => {
    categoriesMenu.classList.remove("active");
  });

  
  const handleCategoryClick = (e) => {
    const item = e.target.closest(".category-item");
    if (!item) return;

    const category = item.dataset.category;
    if (!category) return;

    const currentPath = window.location.pathname;
    if (category === "home") {
      
      if (currentPath.includes("/pages/")) {
        
        window.location.href =
          "../index.html" +
          (window.channel ? "?channel=" + window.channel : "");
      } else if (!currentPath.endsWith("/index.html") && !currentPath.endsWith("index.html")) {
        
        window.location.href =
          "index.html" +
          (window.channel ? "?channel=" + window.channel : "");
      } else {
        
        categoriesMenu.classList.remove("active");
        return;
      }
    } else {
      if (currentPath.includes("/pages/")) {
        window.location.href =
          `category.html?category=${category}` +
          (window.channel ? "&channel=" + window.channel : "");
      } else {
        window.location.href =
          `pages/category.html?category=${category}` +
          (window.channel ? "?channel=" + window.channel : "");
      }
    }
    categoriesMenu.classList.remove("active");
  };

  
  categoriesMenu.addEventListener("click", handleCategoryClick);

  
  document.addEventListener("click", (e) => {
    if (!categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      categoriesMenu.classList.remove("active");
    }
  });
}



let categoryInfo = {};

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

function displayCategoryGames(games) {
  const gamesGrid = document.getElementById("gamesGrid");
  if (!gamesGrid) return;

  if (games.length === 0) {
    gamesGrid.innerHTML =
      '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
    return;
  }

  
  const validGames = games.filter(game => {
    return game && 
           game.id !== undefined && 
           game.id !== null &&
           game.name !== undefined && 
           game.name !== null &&
           game.image !== undefined && 
           game.image !== null;
  });

  if (validGames.length === 0) {
    gamesGrid.innerHTML =
      '<div class="no-results"><h3>No valid games found</h3><p>No games available in this category</p></div>';
    return;
  }

  gamesGrid.innerHTML = validGames
    .map((game) => {
      
      const gameId = game.id || '';
      const gameName = game.name || 'Unknown Game';
      let gameImage = game.image || '';
      
      
      if (gameImage && typeof gameImage === 'string') {
        gameImage = gameImage.replace("./icons/", "../icons/");
      } else {
        gameImage = `../icons/${gameId}.jpg`;
      }
      
      return (
        `
                    <div class="game-card" onclick="window.location.href='../particulars.html?id=${gameId}' ` +
        (window.channel ? "&channel=" + window.channel : "") +
        `">
                        <img src="${gameImage}" alt="${gameName}" loading="lazy">
                        <div class="game-name">${gameName}</div>
                    </div>
                `
      );
    })
    .join("");
}

function generateCategoryGamesList(category, gameDetails) {
  if (!gameDetails || !Array.isArray(gameDetails) || gameDetails.length === 0) {
    const gamesGrid = document.getElementById("gamesGrid");
    if (gamesGrid) {
      gamesGrid.innerHTML =
        '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
    }
    return;
  }

  let games;
  if (category === "all") {
   
    games = gameDetails
      .slice()
      .filter(game => game && game.id !== undefined && game.id !== null)
      .sort(
        (a, b) =>
          parseDownloads(b.downloads || 0) - parseDownloads(a.downloads || 0)
      );
  } else {
   
    games = gameDetails
      .filter((game) => game && game.category === category && game.id !== undefined && game.id !== null)
      .sort(
        (a, b) =>
          parseDownloads(b.downloads || 0) - parseDownloads(a.downloads || 0)
      );
  }
  displayCategoryGames(games);
}

function loadCategoryPage(gameDetails) {
  const category = getUrlParameter("category");
  if (!category) {
    window.location.href =
      "../index.html" +
      (window.channel ? "?channel=" + window.channel : "");
    return;
  }

  
  if (!categoryInfo.all) {
    categoryInfo = {
      all: {
        name: "All Games",
        subtitle: "Browse all available games",
        count: gameDetails.length,
      },
      action: {
        name: "Action Games",
        subtitle: "Fast-paced action and adventure",
        count: 14,
      },
      adventure: {
        name: "Adventure Games",
        subtitle: "Explore amazing worlds",
        count: 14,
      },
      racing: {
        name: "Racing Games",
        subtitle: "Speed and excitement",
        count: 14,
      },
      puzzle: {
        name: "Puzzle Games",
        subtitle: "Challenge your mind",
        count: 14,
      },
      sports: {
        name: "Sports Games",
        subtitle: "Athletic competition",
        count: 14,
      },
      kids: {
        name: "Kids Games",
        subtitle: "Fun for children",
        count: 14,
      },
      girl: {
        name: "Girls Games",
        subtitle: "Games for girls",
        count: 13,
      },
    };
  }

  if (!categoryInfo[category]) {
    window.location.href =
      "../index.html" +
      (window.channel ? "?channel=" + window.channel : "");
    return;
  }

  const info = categoryInfo[category];
  const categoryTitle = document.getElementById("categoryTitle");
  if (categoryTitle) {
    categoryTitle.textContent = info.name;
  }

 
  const categoryItems = document.querySelectorAll(".category-item");
  categoryItems.forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.category === category) {
      item.classList.add("active");
    }
  });

 
  generateCategoryGamesList(category, gameDetails);
}


window.initCategoryPage = function(gameDetails) {
  document.addEventListener("DOMContentLoaded", () => {
    loadCategoryPage(gameDetails);
  });
  
  
  if (document.readyState !== 'loading') {
    loadCategoryPage(gameDetails);
  }
};


function autoInitCategoryPage() {
  const currentPath = window.location.pathname;
  if (currentPath.includes("category.html")) {
    
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { loadGameData } from "../public/js/BaseURL.js";
      
      async function initCategory() {
        const gameDetails = await loadGameData();
        
        if (gameDetails && gameDetails.length > 0) {
          if (typeof window.initCategoryPage === 'function') {
            window.initCategoryPage(gameDetails);
          } else {
            
            setTimeout(() => {
              if (typeof window.initCategoryPage === 'function') {
                window.initCategoryPage(gameDetails);
              }
            }, 100);
          }
        }
      }
      
      initCategory();
    `;
    document.head.appendChild(script);
  }
}


function initChannelHandler() {
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("channel")) {
    window.channel = urlParams.get("channel");
  }

  if (window.channel) {
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
     
      if (link.href && !link.href.includes("channel=")) {
        const url = new URL(link.href);
        url.searchParams.set("channel", window.channel);
        link.href = url.toString();
      }
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  initSidebarMenu();
  initChannelHandler();
  autoInitCategoryPage();
});


if (document.readyState !== 'loading') {
  initChannelHandler();
  autoInitCategoryPage();
  initSidebarMenu();
}

const topBtn = document.getElementById("topBtn");
if (topBtn) {
  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      topBtn.style.display = "flex";
    } else {
      topBtn.style.display = "none";
    }
  });
}
