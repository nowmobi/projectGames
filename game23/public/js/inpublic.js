
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("channel")) {
  window.channel = urlParams.get("channel");
}


function attachChannelToLinks() {
  if (!window.channel) {
    return;
  }

  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    if (!link.href || link.href.includes("channel=")) {
      return;
    }

    try {
      const url = new URL(link.href);
      url.searchParams.set("channel", window.channel);
      link.href = url.toString();
    } catch {
      
    }
  });
}

import { loadGameData, getDataBaseUrl, getCategoryOrder } from "./BaseURL.js";


async function getCategoryInfo() {
  return await getCategoryOrder();
}


class CommonUI {
  constructor() {
    this.categoryIconMap = {
      puzzle: "fas fa-layer-group",
      action: "fas fa-bolt",
      racing: "fas fa-sun",
      adventure: "fas fa-lock",
      sports: "fas fa-globe",
      girl: "fas fa-heart",
      kids: "fas fa-ribbon",
      home: "fas fa-home",
    };
    this.init();
  }

  async init() {
    this.bindSidebarEvents();
    this.bindBackToTopEvents();
    await this.loadAndRenderCategories();
  }

  async loadAndRenderCategories() {
    try {
      
      const categories = await getCategoryInfo();
      
      if (!categories || categories.length === 0) {
        throw new Error("No categories loaded from info2");
      }
      
      this.renderCategories(categories);
    } catch (error) {
      
      const defaultCategories = await getCategoryInfo().catch(() => ["puzzle", "action", "racing", "adventure", "sports", "girl", "kids"]);
      this.renderCategories(defaultCategories);
    }
  }

  async renderCategories(categories) {
    const categoryList = document.querySelector(".category-list");
    if (!categoryList) {
      
      return;
    }

    
    categoryList.innerHTML = "";

    
    const homeItemElement = this.createCategoryItem("home", "Home");
    categoryList.appendChild(homeItemElement);

    
    for (const category of categories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      const categoryItem = this.createCategoryItem(category, categoryName);
      categoryList.appendChild(categoryItem);
    }
  }


  createCategoryItem(category, displayName) {
    const item = document.createElement("div");
    item.className = "category-item";
    item.setAttribute("data-category", category);

    const iconClass = this.categoryIconMap[category] || "fas fa-gamepad";
    item.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${displayName}</span>
    `;

    return item;
  }

 
  bindSidebarEvents() {
   
    const menuToggle = document.getElementById("menuToggle");
    const categoryMenu = document.getElementById("categoryMenu");
    const closeMenu = document.getElementById("closeMenu");

    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        categoryMenu.classList.add("active");
      });
    }

    if (closeMenu) {
      closeMenu.addEventListener("click", () => {
        categoryMenu.classList.remove("active");
      });
    }

   
    
    const categoryList = document.querySelector(".category-list");
    if (categoryList) {
      categoryList.addEventListener("click", (e) => {
        const categoryItem = e.target.closest(".category-item");
        if (categoryItem) {
          const category = categoryItem.getAttribute("data-category");
          this.navigateToCategory(category);
        }
      });
    }

   
    document.addEventListener("click", (e) => {
      if (
        categoryMenu &&
        menuToggle &&
        !categoryMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        categoryMenu.classList.remove("active");
      }
    });
  }

 
  bindBackToTopEvents() {
    const topBtn = document.getElementById("topBtn");
    if (topBtn) {
      topBtn.addEventListener("click", () => {
        this.scrollToTop();
      });

     
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
          topBtn.style.display = "flex";
        } else {
          topBtn.style.display = "none";
        }
      });
    }
  }

 
  navigateToCategory(category) {
    const categoryMenu = document.getElementById("categoryMenu");
    if (categoryMenu) {
      categoryMenu.classList.remove("active");
    }

   
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes("/pages/");

   
    let basePath = isInPagesFolder ? "../" : "";

   
    if (category === "home") {
      window.location.href =
        basePath +
        "index.html" +
        (window.channel ? "?channel=" + window.channel : "");
    } else {
      window.location.href =
        basePath +
        `pages/category.html?category=${category}` +
        (window.channel ? "&channel=" + window.channel : "");
    }
  }

 
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}


class BackButton {
  constructor() {
    this.init();
  }

  init() {
    this.bindBackButtonEvents();
  }

  bindBackButtonEvents() {
    const backButton = document.getElementById("backButton");
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.goBack();
      });
    }
  }

  goBack() {
    
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes("/pages/");
    const basePath = isInPagesFolder ? "../" : "";

    window.location.href =
      basePath +
      "index.html" +
      (window.channel ? "?channel=" + window.channel : "");
  }
}

class CategoryPage {
  constructor() {
    this.currentPage = 1;
    this.gamesPerPage = 12;
    this.allGames = [];
    this.currentCategory = "all";
    this.filteredGames = [];
    this.defaultIcon = `${getDataBaseUrl()}/icons/default.jpg`;
    this.initialize();
  }

  async initialize() {
    this.getCategoryFromURL();
    this.bindEvents();
    await this.fetchGames();
  }

  async fetchGames() {
    try {
      const data = await loadGameData();
      this.allGames = Array.isArray(data) ? data : [];
    } catch (error) {
      
      this.allGames = [];
    }

    this.applyCategoryFilter();
  }

  getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    if (category) {
      this.currentCategory = category;
    }
  }

  bindEvents() {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn?.addEventListener("click", () => {
      this.loadMoreGames();
    });
  }

  applyCategoryFilter() {
    if (this.currentCategory !== "all") {
      this.filteredGames = this.allGames.filter(
        (game) => game.category === this.currentCategory
      );
    } else {
      this.filteredGames = this.allGames;
    }

    this.filteredGames.sort((a, b) => a.downloads - b.downloads);

    this.renderGames();
    this.updateUI();
  }

  renderGames() {
    const gameGrid = document.getElementById("gameGrid");
    if (!gameGrid) return;

    gameGrid.innerHTML = "";

    const startIndex = 0;
    const endIndex = this.currentPage * this.gamesPerPage;
    const gamesToShow = this.filteredGames.slice(startIndex, endIndex);

    if (gamesToShow.length === 0) {
      gameGrid.innerHTML =
        '<div class="no-games">No games found in this category</div>';
      return;
    }

    gamesToShow.forEach((game) => {
      const gameCard = this.createGameCard(game);
      gameGrid.appendChild(gameCard);
    });

    this.toggleLoadMoreButton();
  }

  loadMoreGames() {
    this.currentPage++;
    this.renderGames();
  }

  toggleLoadMoreButton() {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (!loadMoreBtn) return;

    const totalGames = this.filteredGames.length;
    const displayedGames = this.currentPage * this.gamesPerPage;

    if (displayedGames >= totalGames) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  }

  createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";

    const img = document.createElement("img");
    img.className = "game-image";
    img.alt = game.name;
    img.style.opacity = "0";

    img.addEventListener("load", () => {
      img.style.opacity = "1";
    });

    const onImageError = (e) => {
      const currentSrc = e.target.src;
      

      if (currentSrc.includes("default.jpg")) {
        e.target.removeEventListener("error", onImageError);
        img.style.display = "none";
        imageContainer.style.backgroundColor = "#e0e0e0";
        imageContainer.innerHTML = `
          <div class="fallback-icon">
            <i class="fas fa-gamepad"></i>
            <div class="fallback-text">${game.name}</div>
          </div>
        `;
      } else {
        
        e.target.src = this.defaultIcon;
      }
    };

    img.addEventListener("error", onImageError);

    img.src = game.image;

    imageContainer.appendChild(img);

    card.innerHTML = `
            <div class="game-card-info">
                <div class="game-card-title">${game.name}</div>
                <div class="game-card-downloads">${game.downloads} downloads</div>
            </div>
        `;

    card.insertBefore(imageContainer, card.firstChild);

    card.addEventListener("click", () => {
      
      const currentPath = window.location.pathname;
      const isInPagesFolder = currentPath.includes("/pages/");
      const detailPath = isInPagesFolder ? "../secondary.html" : "secondary.html";
      
      window.location.href = `${detailPath}?id=${game.id}${
        window.channel ? "&channel=" + window.channel : ""
      }`;
    });

    return card;
  }

  updateUI() {
    const categoryTitle = document.getElementById("categoryTitle");
    if (categoryTitle) {
      if (this.currentCategory === "all") {
        categoryTitle.textContent = "All Games";
      } else {
        const categoryName =
          this.currentCategory.charAt(0).toUpperCase() +
          this.currentCategory.slice(1);
        categoryTitle.textContent = `${categoryName} Games`;
      }
    }
  }
}

class PrivacyPage {
  constructor() {
    
  }
}



document.addEventListener("DOMContentLoaded", () => {
  try {
    new CommonUI();
    new BackButton();
    attachChannelToLinks();

    const pathname = window.location.pathname;
    
    if (pathname.includes("category.html")) {
      new CategoryPage();
    } else if (pathname.includes("privacy.html") || pathname.includes("terms.html")) {
      new PrivacyPage();
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});


export { CommonUI, BackButton, CategoryPage, PrivacyPage };
