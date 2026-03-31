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
  const selectedGames = shuffledGames.slice(0, 6);

  homepageGameGrid.innerHTML = selectedGames
    .map((game, index) => {
      const cardClass = index === 0 ? "game-card featured" : "game-card small";
      const clickHandler =
        index === 0
          ? "window.location.href='pages/category.html?category=all' " +
            (window.channel ? "&channel=" + window.channel : "")
          : `window.location.href='detail.html?id=${game.id}' ` +
            (window.channel ? "&channel=" + window.channel : "");
      const displayText = index === 0 ? "All Games" : game.name;
      const arrowSvg =
        index === 0
          ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : "";
      return `
            <div class="${cardClass}" onclick="${clickHandler}">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-name">${displayText}${arrowSvg}</div>
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
    .slice(0, 6);

  gamesGrid.innerHTML = games
    .map((game, index) => {
      const cardClass = index === 0 ? "game-card featured" : "game-card small";
      const clickHandler =
        index === 0
          ? `window.location.href='pages/category.html?category=${category}' ` +
            (window.channel ? "&channel=" + window.channel : "")
          : `window.location.href='detail.html?id=${game.id}' ` +
            (window.channel ? "&channel=" + window.channel : "");
      const displayText = index === 0 ? categoryName : game.name;
      const arrowSvg =
        index === 0
          ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : "";
      return `
            <div class="${cardClass}" onclick="${clickHandler}">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-name">${displayText}${arrowSvg}</div>
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
      return (
        `
            <div class="game-card" onclick="window.location.href='detail.html?id=${game.id}' ` +
        (window.channel ? "&channel=" + window.channel : "") +
        `">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <div class="game-name">${game.name}</div>
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

