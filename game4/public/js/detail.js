var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("channel")) {
  window.channel = urlParams.get("channel");
}

import {
  loadGameData,
  getGameUrl,
  getDataBaseUrl,
} from "./BaseURL.js";
import { CommonUI, BackButton } from "./inpublic.js";

class GameDetail {
  constructor() {
    this.gameId = this.getGameIdFromUrl();
    this.allGames = [];
    this.defaultIcon = `${getDataBaseUrl()}/icons/default.jpg`;
    this.init();
  }

  async init() {
    await this.loadGameData();
  }

  getGameIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("id")) || 1;
  }

  async loadGameData() {
    try {
      const data = await loadGameData();
      this.allGames = Array.isArray(data) ? data : [];
    } catch (error) {
      
      this.allGames = [];
    }

    let game = this.allGames.find((item) => item.id === this.gameId);

    if (!game && this.allGames.length) {
      game = this.allGames[0];
    }

    if (!game) {
      game = this.createFallbackGame();
    }

    this.displayGameData(game);
    this.loadRecommendations();
  }

  displayGameData(game) {
   
    document.title = `${game.name} - Game Store`;

   
    const gameImage = document.getElementById("gameImage");
    const imageSection = document.querySelector(".game-image-section");

    if (!gameImage || !imageSection) {
      
      return;
    }

   
    gameImage.alt = game.name;

   
    gameImage.style.display = "block";
    gameImage.style.opacity = "0";
    imageSection.style.backgroundColor = "var(--primary-color)";

    
    if (this.onImageLoad) {
      gameImage.removeEventListener("load", this.onImageLoad);
    }
    if (this.onImageError) {
      gameImage.removeEventListener("error", this.onImageError);
    }

    
    this.onImageLoad = () => {
      gameImage.style.opacity = "1";
      gameImage.style.display = "block";
    };

    this.onImageError = () => {
      if (gameImage.src !== this.defaultIcon) {
        gameImage.src = this.defaultIcon;
        return;
      }
    
      gameImage.style.display = "none";
      imageSection.style.backgroundColor = "#e0e0e0";
      imageSection.innerHTML = `
                <div class="fallback-icon">
                    <i class="fas fa-gamepad"></i>
                    <div class="fallback-text">${game.name}</div>
                </div>
            `;
    };

    gameImage.addEventListener("load", this.onImageLoad);
    gameImage.addEventListener("error", this.onImageError);

   
    gameImage.src = game.image;

   
    const gameTitleElement = document.getElementById("gameTitle");
    if (gameTitleElement) {
      gameTitleElement.textContent = game.name;
    }

   
    this.renderStars(game.rating);
    const ratingTextElement = document.getElementById("ratingText");
    if (ratingTextElement) {
      ratingTextElement.textContent = `${game.rating}/5`;
    }

   
    const gameDownloadsElement = document.getElementById("gameDownloads");
    if (gameDownloadsElement) {
      gameDownloadsElement.innerHTML = `
                <i class="fas fa-download"></i>
                <span>${game.downloads} downloads</span>
            `;
    }

   
    const categoryBadgeElement = document.getElementById("categoryBadge");
    if (categoryBadgeElement) {
      categoryBadgeElement.textContent = game.category.toUpperCase();
    }

   
    const gameDescriptionElement = document.getElementById("gameDescription");
    if (gameDescriptionElement) {
      gameDescriptionElement.textContent = game.description;
    }

   
    const playNowBtn = document.getElementById("playNowBtn");
    if (playNowBtn) {
      playNowBtn.href = getGameUrl(game.id);
     
      playNowBtn.removeEventListener("click", this.onPlayNowClick);
     
      this.onPlayNowClick = (e) => {
        e.preventDefault();
        this.playGame(game.id);
      };
      playNowBtn.addEventListener("click", this.onPlayNowClick);
    }
  }

  renderStars(rating) {
    const starsContainer = document.getElementById("gameStars");
    if (!starsContainer) {
      
      return;
    }

    starsContainer.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      star.className = `fas fa-star star ${i <= rating ? "" : "empty"}`;
      starsContainer.appendChild(star);
    }
  }

  playGame(gameId) {
    const gamePath = getGameUrl(gameId);
    window.location.href = gamePath;
  }


 
  loadRecommendations() {
    const validGames = this.allGames.filter((game) => {
      
      const hasValidId = game && 
                        game.id !== null && 
                        game.id !== undefined && 
                        typeof game.id === 'number' && 
                        game.id > 0 &&
                        !isNaN(game.id);
      
      
      const isNotCurrentGame = game.id !== this.gameId;
      
      return hasValidId && isNotCurrentGame;
    });

    const shuffled = validGames.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 6);

    this.renderRecommendations(recommendations);
  }

 
  renderRecommendations(games) {
    const container = document.getElementById("recommendationsGrid");
    if (!container) {
      
      return;
    }

    container.innerHTML = "";

    games.forEach((game) => {
      const card = this.createRecommendationCard(game);
      container.appendChild(card);
    });
  }

 
  createRecommendationCard(game) {
    const card = document.createElement("div");
    card.className = "recommendation-card";

   
    const imageContainer = document.createElement("div");
    imageContainer.className = "recommendation-image";

   
    const img = document.createElement("img");
    img.alt = game.name;
    img.className = "game-image";

   
    img.addEventListener("load", () => {
      img.style.opacity = "0.8";
    });

    img.addEventListener("error", () => {
      if (img.src !== this.defaultIcon) {
        img.src = this.defaultIcon;
        return;
      }
      img.style.display = "none";
      imageContainer.innerHTML = `
                <div class="fallback-icon">
                    <i class="fas fa-gamepad"></i>
                </div>
            `;
    });

   
    img.src = game.image;
    imageContainer.appendChild(img);

   
    const info = document.createElement("div");
    info.className = "recommendation-info";
    info.innerHTML = `
            <div class="recommendation-title">${game.name}</div>
            <div class="recommendation-downloads">${game.downloads} downloads</div>
        `;

   
    card.appendChild(imageContainer);
    card.appendChild(info);

   
    card.addEventListener("click", () => {
      window.location.href = `detail.html?id=${game.id}${
        window.channel ? "&channel=" + window.channel : ""
      }`;
    });

    return card;
  }

  createFallbackGame() {
    return {
      id: this.gameId,
      name: "Unknown Game",
      description: "Game details are currently unavailable.",
      downloads: 0,
      rating: 0,
      category: "puzzle",
      image: "",
    };
  }
}


document.addEventListener("DOMContentLoaded", () => {
  new CommonUI();
  new BackButton();
  new GameDetail();
});


export { GameDetail };
