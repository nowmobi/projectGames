import { loadGameData, getCategoryOrder } from "./BaseURL.js";



function generateHomepageGames(gameDetails) {
  const homepageGameGrid = document.getElementById("homepageGameGrid");
  if (!homepageGameGrid) return;

  
  const allGames = gameDetails
    .filter(game => game && game.id !== undefined && game.id !== null)
    .slice();
  
  if (allGames.length === 0) {
    homepageGameGrid.innerHTML =
      '<div class="no-results"><h3>No games found</h3><p>No games available</p></div>';
    return;
  }

  
  const shuffledGames = allGames.sort(() => Math.random() - 0.5);
  const selectedGames = shuffledGames.slice(0, 4);

  homepageGameGrid.innerHTML = selectedGames
    .map((game, index) => {
      const cardClass = "game-card";
      const clickHandler = `window.location.href='particulars.html?id=${game.id}'` +
        (window.channel ? "&channel=" + window.channel : "");
      const displayText = game.name;
      
      const rating = game.rating || (Math.random() * 2 + 3).toFixed(1);
      const players = game.players || Math.floor(Math.random() * 50000 + 1000);
      const category = game.category || 'Game';
      const size = game.size || `${(Math.random() * 100 + 20).toFixed(0)}MB`;
      
      const formattedPlayers = players >= 1000 ? `${(players / 1000).toFixed(1)}K` : players;
      
      return `
            <div class="${cardClass}" onclick="${clickHandler}">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-info">
                  <div class="game-name">${displayText}</div>
                  <div class="game-meta-info">
                    <span class="game-rating-small">⭐ ${rating}</span>
                    <span class="game-category-small">${category}</span>
                  </div>
                  <div class="game-stats">
                    <span class="game-players">👥 ${formattedPlayers}</span>
                    <span class="game-size">💾 ${size}</span>
                  </div>
                </div>
            </div>
        `;
    })
    .join("");
}

function generateCategoryGames(gameDetails, category, gridId, categoryName) {
  const gamesGrid = document.getElementById(gridId);
  if (!gamesGrid) return;

  const games = gameDetails
    .filter((game) => game && game.category === category && game.id !== undefined && game.id !== null)
    .slice()
    
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  gamesGrid.innerHTML = games
    .map((game, index) => {
      const cardClass = "game-card";
      const clickHandler = `window.location.href='particulars.html?id=${game.id}'` +
        (window.channel ? "&channel=" + window.channel : "");
      const displayText = game.name;
      
      const rating = game.rating || (Math.random() * 2 + 3).toFixed(1);
      const players = game.players || Math.floor(Math.random() * 50000 + 1000);
      const size = game.size || `${(Math.random() * 100 + 20).toFixed(0)}MB`;
      
      const formattedPlayers = players >= 1000 ? `${(players / 1000).toFixed(1)}K` : players;
      
      return `
            <div class="${cardClass}" onclick="${clickHandler}">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-info">
                  <div class="game-name">${displayText}</div>
                  <div class="game-meta-info">
                    <span class="game-rating-small">⭐ ${rating}</span>
                    <span class="game-category-small">${category}</span>
                  </div>
                  <div class="game-stats">
                    <span class="game-players">👥 ${formattedPlayers}</span>
                    <span class="game-size">💾 ${size}</span>
                  </div>
                </div>
            </div>
        `;
    })
    .join("");
}


let globalGameDetails = [];

function initSearchFunctionality(gameDetails) {
  
  globalGameDetails = gameDetails;
  
  const searchInput = document.getElementById("searchInput");
  const searchIcon = document.getElementById("searchIcon");

  if (!searchInput || !searchIcon) return;

 
  searchIcon.addEventListener("click", function (e) {
    e.preventDefault(); 
    e.stopPropagation();
   
    const closeIconSvg = document.querySelector(".close-icon-svg");
    const isCloseIconVisible =
      closeIconSvg && closeIconSvg.style.display !== "none";

    if (isCloseIconVisible) {
     
      restoreOriginalContent();
    } else {
     
      if (searchInput) {
        searchInput.focus();
       
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === "") {
          restoreOriginalContent();
        } else {
          const filteredGames = globalGameDetails.filter(
            (game) =>
              game && game.name && game.description &&
              (game.name.toLowerCase().includes(searchTerm) ||
              game.description.toLowerCase().includes(searchTerm))
          );
          displaySearchResults(filteredGames);
        }
      }
    }
  });

 
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === "") {
     
      restoreOriginalContent();
      return;
    }

   
    const filteredGames = globalGameDetails.filter(
      (game) =>
        game && game.name && game.description &&
        (game.name.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm))
    );

   
    displaySearchResults(filteredGames);
  });
  
  
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      searchIcon.click();
    }
  });
}

function displaySearchResults(games) {
 
  switchToCloseIcon();

 
  const originalSections = document.querySelectorAll(".category-section");
  originalSections.forEach((section) => {
    section.style.display = "none";
  });

 
  let searchResultsSection = document.getElementById("searchResultsSection");
  if (!searchResultsSection) {
    searchResultsSection = document.createElement("section");
    searchResultsSection.id = "searchResultsSection";
    searchResultsSection.className = "category-section";
    searchResultsSection.innerHTML = `
            <div class="search-results-header">
                <h2 class="search-results-title">Search Results</h2>
            </div>
            <div class="game-grid" id="searchResultsGrid">
                <!-- 搜索结果将在这里显示 -->
            </div>
        `;
    document.querySelector(".main-content").appendChild(searchResultsSection);
  } else {
    searchResultsSection.style.display = "block";
  }

  const searchResultsGrid = document.getElementById("searchResultsGrid");

  if (games.length === 0) {
    searchResultsGrid.innerHTML =
      '<div class="no-results"><h3>No games found</h3><p>Try searching with different keywords</p></div>';
    return;
  }

 
  searchResultsGrid.innerHTML = games
    .map((game) => {
      const rating = game.rating || (Math.random() * 2 + 3).toFixed(1);
      const players = game.players || Math.floor(Math.random() * 50000 + 1000);
      const category = game.category || 'Game';
      const size = game.size || `${(Math.random() * 100 + 20).toFixed(0)}MB`;
      const formattedPlayers = players >= 1000 ? `${(players / 1000).toFixed(1)}K` : players;
      
      return (
        `
            <div class="game-card" onclick="window.location.href='particulars.html?id=${game.id}' ` +
        (window.channel ? "&channel=" + window.channel : "") +
        `">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-info">
                  <div class="game-name">${game.name}</div>
                  <div class="game-meta-info">
                    <span class="game-rating-small">⭐ ${rating}</span>
                    <span class="game-category-small">${category}</span>
                  </div>
                  <div class="game-stats">
                    <span class="game-players">👥 ${formattedPlayers}</span>
                    <span class="game-size">💾 ${size}</span>
                  </div>
                </div>
            </div>
        `
      );
    })
    .join("");
}

function restoreOriginalContent() {
 
  const searchResultsSection = document.getElementById("searchResultsSection");
  if (searchResultsSection) {
    searchResultsSection.style.display = "none";
  }

 
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
  }

 
  switchToSearchIcon();

 
  const originalSections = document.querySelectorAll(".category-section");
  originalSections.forEach((section) => {
    section.style.display = "block";
  });
}

function switchToCloseIcon() {
  const searchIconSvg = document.querySelector(".search-icon-svg");
  const closeIconSvg = document.querySelector(".close-icon-svg");

  if (searchIconSvg && closeIconSvg) {
    searchIconSvg.style.display = "none";
    closeIconSvg.style.display = "block";
  }
}

function switchToSearchIcon() {
  const searchIconSvg = document.querySelector(".search-icon-svg");
  const closeIconSvg = document.querySelector(".close-icon-svg");

  if (searchIconSvg && closeIconSvg) {
    searchIconSvg.style.display = "block";
    closeIconSvg.style.display = "none";
  }
}


async function generateDynamicCategorySections(gameDetails) {
  
  
  const categoryList = await getCategoryOrder();
  
  
  const ALLOWED_CATEGORIES = [
    "puzzle",
    "action",
    "adventure",
    "racing",
    "sports",
    "kids",
    "girl",
  ];
  
  
  let categories = [];
  if (categoryList && Array.isArray(categoryList) && categoryList.length > 0) {
    categories = categoryList.filter(cat => ALLOWED_CATEGORIES.includes(cat));
  } else {
    categories = ALLOWED_CATEGORIES;
  }
  
  
  const GRID_IDS_IN_HTML_ORDER = [
    "puzzleGamesGrid",
    "actionGamesGrid",
    "adventureGamesGrid",
    "racingGamesGrid",
    "sportsGamesGrid",
    "kidsGamesGrid",
    "girlGamesGrid",
  ];
  
  
  GRID_IDS_IN_HTML_ORDER.forEach((gridId, index) => {
    const sectionGrid = document.getElementById(gridId);
    if (!sectionGrid) return;
    
    const section = sectionGrid.closest("section.category-section");
    if (!section) return;
    
    const category = categories[index];
    
    if (!category) {
      
      section.style.display = "none";
      return;
    }
    
    
    let categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    if (category === "girl") {
      categoryName = "Girls Games";
    } else {
      categoryName = categoryName + " Games";
    }
    
    
    generateCategoryGames(gameDetails, category, gridId, categoryName);
    section.style.display = "block";
  });
}

function initCarousel(gameDetails) {
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDots = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  
  if (!carouselTrack || !carouselDots) return;

  const slides = [
    {
      badge: '🎮 Featured',
      title: 'Discover Amazing Games',
      description: 'Explore hundreds of free online games across all genres',
      cta: 'Browse All Games',
      link: 'pages/category.html?category=all'
    },
    {
      badge: '⭐ Popular',
      title: 'Top Rated This Week',
      description: 'Join thousands of players enjoying the best games',
      cta: 'View Top Games',
      link: 'pages/category.html?category=all'
    },
    {
      badge: '🆕 New Releases',
      title: 'Fresh Games Added',
      description: 'Check out the latest additions to our game collection',
      cta: 'See New Games',
      link: 'pages/category.html?category=all'
    }
  ];

  let currentSlide = 0;
  let autoPlayInterval;

  carouselTrack.innerHTML = slides.map(slide => `
    <div class="carousel-slide">
      <div class="carousel-content">
        <span class="carousel-badge">${slide.badge}</span>
        <h2 class="carousel-title">${slide.title}</h2>
        <p class="carousel-description">${slide.description}</p>
        <a href="${slide.link}" class="carousel-cta">${slide.cta}</a>
      </div>
    </div>
  `).join('');

  carouselDots.innerHTML = slides.map((_, index) => `
    <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
  `).join('');

  const dots = document.querySelectorAll('.carousel-dot');

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlide = index;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 4000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(parseInt(dot.dataset.index));
      startAutoPlay();
    });
  });

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
  }

  startAutoPlay();
}

async function initIndexPage() {
  const gameDetails = await loadGameData();
  
  if (gameDetails && gameDetails.length > 0) {
    initSearchFunctionality(gameDetails);

    generateHomepageGames(gameDetails);
    
    
    await generateDynamicCategorySections(gameDetails);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initIndexPage();
});

