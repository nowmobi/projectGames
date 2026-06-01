import { loadGameData, getCategoryOrder } from "./BaseURL.js";

let gameDetails = [];

// Search, menu toggle, and category menu functionality are handled by inpublic.js

let carouselContainer, prevBtn, nextBtn, carouselNav, dots = [];
let currentSlide = 0, totalSlides = 0, autoPlayInterval;

function showSlide(index) {
  currentSlide = index;
  if (totalSlides > 0 && carouselContainer) {
    carouselContainer.style.transition = 'transform 0.5s ease-in-out';
    carouselContainer.style.transform = `translateX(-${index * 100}%)`;
  }
  if (dots.length === 0) dots = document.querySelectorAll(".carousel-dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function nextSlide() {
  if (currentSlide >= totalSlides - 1) {
    carouselContainer.style.transition = 'transform 0.5s ease-in-out';
    carouselContainer.style.transform = `translateX(-${totalSlides * 100}%)`;
    
    setTimeout(() => {
      carouselContainer.style.transition = 'none';
      carouselContainer.style.transform = 'translateX(0)';
      currentSlide = 0;
      dots.forEach((dot, i) => dot.classList.toggle("active", i === 0));
    }, 500);
  } else {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide <= 0) {
    carouselContainer.style.transition = 'none';
    carouselContainer.style.transform = `translateX(-${totalSlides * 100}%)`;
    
    setTimeout(() => {
      carouselContainer.style.transition = 'transform 0.5s ease-in-out';
      carouselContainer.style.transform = `translateX(-${(totalSlides - 1) * 100}%)`;
      currentSlide = totalSlides - 1;
      dots.forEach((dot, i) => dot.classList.toggle("active", i === totalSlides - 1));
    }, 10);
  } else {
    showSlide(currentSlide - 1);
  }
}

function startAutoPlay() {
  autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

// 随机打乱数组的函数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCategorySection(category, sectionElement) {
  if (!sectionElement) return;
  
  const categoryGames = shuffleArray(
    gameDetails.filter((game) => game.category === category)
  ).slice(0, 6);

  if (categoryGames.length === 0) {
    sectionElement.style.display = 'none';
    return;
  }

  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  const categoryUrl = `pages/category.html?category=${category}${channelParam}`;
  
  sectionElement.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">${categoryNameMap[category] || category} Games</h2>
      <div class="section-right">
        <a href="${categoryUrl}" class="section-more">More</a>
      </div>
    </div>
    <div class="game-grid">
      ${categoryGames
        .map(
          (game) => `
            <a href="detail.html?id=${game.id}${channelParam}" class="game-card">
              <img src="${game.image}" alt="${game.name}">
              <div class="game-card-content">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-meta">
                  <span class="game-rating">
                    <span class="zan-icon"></span>
                    <span>${game.rating || '0'}</span>
                  </span>
                  <span class="game-download">
                    <span class="download-icon"></span>
                    <span>${game.downloads || '0'}</span>
                  </span>
                </div>
              </div>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function generateCategorySections(categories) {
  const categorySections = document.querySelectorAll(".category-section");
  
  categories.forEach((category, index) => {
    if (index < categorySections.length) {
      generateCategorySection(category, categorySections[index]);
    }
  });
  
 
  for (let i = categories.length; i < categorySections.length; i++) {
    categorySections[i].style.display = 'none';
  }
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

function setCarouselBackgrounds(games) {
  document.querySelectorAll(".carousel-slide").forEach((slide, i) => {
    const game = games[i];
    if (game) slide.style.backgroundImage = `url('${game.image}')`;
  });
}

// Category name mapping
const categoryNameMap = {
  puzzle: "Puzzle",
  action: "Action",
  adventure: "Adventure",
  racing: "Racing",
  sports: "Sports",
  kids: "Kids",
  girl: "Girls",
};

// Category subtitle mapping
const categorySubtitleMap = {
  puzzle: "Challenge your mind",
  action: "Fast-paced action and adventure",
  adventure: "Explore amazing worlds",
  racing: "Speed and excitement",
  sports: "Get your heart pumping",
  kids: "Fun for children",
  girl: "Games for girls",
};

function getCategoryCount(category) {
  return gameDetails.filter((game) => game.category === category).length;
}

function generateCarouselSlides(games) {
  if (!carouselContainer || !games?.length) return;
  
  totalSlides = games.length;
  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  
  const slidesWithDuplicate = [...games, games[0]];
  
  carouselContainer.innerHTML = slidesWithDuplicate.map(game => `
    <div class="carousel-slide" data-game-id="${game.id}">
      <div class="carousel-content">
        <h1 class="carousel-title">${game.name}</h1>
        <p class="carousel-subtitle">${game.category || ""}</p>
        <a href="detail.html?id=${game.id}${channelParam}" class="carousel-button">
          Play Now
        </a>
      </div>
    </div>
  `).join("");

  carouselContainer.querySelectorAll(".carousel-slide").forEach(slide => {
    slide.addEventListener("click", () => {
      const gameId = slide.dataset.gameId;
      window.location.href = `detail.html?id=${gameId}${channelParam}`;
    });
  });
}

function generateCarouselDots(categories) {
  if (!carouselNav) return;
  
  carouselNav.innerHTML = categories.map((_, i) => 
    `<div class="carousel-dot ${i === 0 ? "active" : ""}" data-slide="${i}"></div>`
  ).join("");

  carouselNav.querySelectorAll(".carousel-dot").forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      stopAutoPlay();
      startAutoPlay();
    });
  });
}

// Click outside to close menu functionality is handled by inpublic.js

document.addEventListener("DOMContentLoaded", async () => {
 
  carouselContainer = document.getElementById("carouselContainer");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  carouselNav = document.getElementById("carouselNav");
  
  const handleCarouselNav = (fn) => {
    fn();
    stopAutoPlay();
    startAutoPlay();
  };
  
  if (prevBtn) prevBtn.addEventListener("click", () => handleCarouselNav(prevSlide));
  if (nextBtn) nextBtn.addEventListener("click", () => handleCarouselNav(nextSlide));
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", stopAutoPlay);
    carouselContainer.addEventListener("mouseleave", startAutoPlay);
  }
  
  try {
   
    gameDetails = await loadGameData();
    
   
    let categories = await getCategoryOrder();
    
   
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      categories = ["puzzle", "action", "adventure", "racing", "sports", "kids", "girl"];
    }
    
   
   
    categories = [...categories];
    
    const validGames = gameDetails.filter(game => 
      game && game.id !== undefined && game.id !== null && game.image && game.name
    );
    const carouselGames = shuffleArray(validGames).slice(0, 7);
    
   
    
    generateCarouselSlides(carouselGames);
    generateCarouselDots(carouselGames);
    dots = document.querySelectorAll(".carousel-dot");
    setCarouselBackgrounds(carouselGames);
    startAutoPlay();
    
   
    generateCategorySections(categories);
  } catch (error) {
    const defaultCategories = ["puzzle", "action", "adventure", "racing", "sports", "kids", "girl"];
    const defaultGames = [];
   
    generateCarouselSlides(defaultGames);
    generateCarouselDots(defaultGames);
    dots = document.querySelectorAll(".carousel-dot");
    setCarouselBackgrounds(defaultGames);
    startAutoPlay();
    generateCategorySections(defaultCategories);
  }
});

