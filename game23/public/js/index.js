import { loadGameData, getDataBaseUrl, getCategoryOrder } from "./BaseURL.js";

class GameStore {
  constructor() {
    this.searchQuery = "";
    this.allGames = [];
    this.defaultIcon = `${getDataBaseUrl()}/icons/default.jpg`;
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
    await this.loadAllCategories();
  }

  async loadData() {
    try {
      const data = await loadGameData();
      this.allGames = Array.isArray(data) ? data : [];
    } catch (error) {
      this.allGames = [];
    }
  }

  bindEvents() {
   
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterAllCategories();
      });
    }
  }

  async loadAllCategories() {
    try {
     
      const categories = await getCategoryOrder();
      
      if (!categories || categories.length === 0) {
        throw new Error("No categories found");
      }
      
     
      const mainContent = document.querySelector('.main-content');
      
      if (!mainContent) {
        return;
      }
      
     
      const existingSections = Array.from(mainContent.querySelectorAll('.game-section'));
      
     
      for (let i = 0; i < categories.length && i < existingSections.length; i++) {
        const category = categories[i];
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const section = existingSections[i];
        
       
        if (section && !section.querySelector('.section-header')) {
          section.innerHTML = `
            <div class="section-header">
              <h2 class="section-title">${categoryName} Games</h2>
              <a href="pages/category.html?category=${category}" class="more-link">
                More <i class="fas fa-chevron-right"></i>
              </a>
            </div>
            <div class="game-grid" id="${category}Games"></div>
          `;
        } else if (section && section.querySelector('.section-header')) {
         
          const gameGrid = section.querySelector('.game-grid');
          if (gameGrid) {
            gameGrid.id = `${category}Games`;
          }
          const sectionTitle = section.querySelector('.section-title');
          if (sectionTitle) {
            sectionTitle.textContent = `${categoryName} Games`;
          }
          const moreLink = section.querySelector('.more-link');
          if (moreLink) {
            moreLink.href = `pages/category.html?category=${category}`;
          }
        }
        
        this.loadCategoryGames(category);
      }
    } catch (error) {
      console.error("Failed to load categories from remote data:", error);
    }
  }


  createCategorySection(category, categoryName) {
    const section = document.createElement('section');
    section.className = 'game-section';
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${categoryName} Games</h2>
        <a href="pages/category.html?category=${category}" class="more-link">
          More <i class="fas fa-chevron-right"></i>
        </a>
      </div>
      <div class="game-grid" id="${category}Games"></div>
    `;
    
   
    return section;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  loadCategoryGames(category) {
    let games = this.allGames.filter((game) => game.category === category);

    if (games.length > 4) {
      games = this.shuffleArray(games).slice(0, 4);
    }

    this.renderCategoryGames(category, games);
  }

  renderCategoryGames(category, games) {
    const gameGrid = document.getElementById(`${category}Games`);

    if (!gameGrid) {
      console.error(`Game grid element not found for ${category}!`);
      return;
    }

    gameGrid.innerHTML = "";

    if (games.length === 0) {
      gameGrid.innerHTML = '<div class="no-games">No games found</div>';
      return;
    }

    games.forEach((game) => {
      const gameCard = this.createGameCard(game);
      gameGrid.appendChild(gameCard);
    });
  }

  async filterAllCategories() {
    if (!this.searchQuery) {
      await this.loadAllCategories();
      return;
    }

    const filteredGames = this.allGames.filter((game) => {
      if (!game) return false;
      
      const name = game.name ? game.name.toLowerCase() : "";
      const description = game.description ? game.description.toLowerCase() : "";
      
      return name.includes(this.searchQuery) || description.includes(this.searchQuery);
    });

    try {
      const categories = await getCategoryOrder();
      
      categories.forEach((category) => {
        let categoryGames = filteredGames.filter(
          (game) => game.category === category
        );
        
        if (categoryGames.length > 4) {
          categoryGames = this.shuffleArray(categoryGames).slice(0, 4);
        }
        
        this.renderCategoryGames(category, categoryGames);
      });
    } catch (error) {
      console.error("Failed to load categories for filter:", error);
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

    img.addEventListener("error", () => {
      img.src = this.defaultIcon;
      img.addEventListener("error", () => {
       
        img.style.display = "none";
        imageContainer.style.backgroundColor = "#e0e0e0";
        imageContainer.innerHTML = `
                    <div class="fallback-icon">
                        <i class="fas fa-gamepad"></i>
                        <div class="fallback-text">${game.name}</div>
                    </div>
                `;
      });
    });

   
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
      window.location.href = `secondary.html?id=${game.id}${
        window.channel ? "&channel=" + window.channel : ""
      }`;
    });

    return card;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  try {
    new GameStore();
  } catch (error) {
    console.error("Error during homepage initialization:", error);
  }
});

