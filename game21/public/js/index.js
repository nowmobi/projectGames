import { loadGameData, getCategoryOrder } from "./BaseURL.js";

let gameDetails = [];

// Search, menu toggle, and category menu functionality are handled by inpublic.js

let carouselContainer, prevBtn, nextBtn, carouselNav, dots = [];
let currentSlide = 0, totalCategories = 0, autoPlayInterval;

function showSlide(index) {
  currentSlide = index;
  if (totalCategories > 0 && carouselContainer) {
    carouselContainer.style.transform = `translateX(-${index * 100 / totalCategories}%)`;
  }
  if (dots.length === 0) dots = document.querySelectorAll(".carousel-dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function nextSlide() {
  showSlide((currentSlide + 1) % totalCategories);
}

function prevSlide() {
  showSlide((currentSlide - 1 + totalCategories) % totalCategories);
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
  ).slice(0, 4);

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
            <a href="productDetails.html?id=${game.id}${channelParam}" class="game-card">
              <img src="${game.image}" alt="${game.name}">
              <div class="game-card-content">
                <h3 class="game-title">${game.name}</h3>
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

function setCarouselBackgrounds(categories) {
  document.querySelectorAll(".carousel-slide").forEach((slide, i) => {
    const game = gameDetails.find(g => g.category === categories[i]);
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

function generateCarouselSlides(categories) {
  if (!carouselContainer || !categories?.length) return;
  
  totalCategories = categories.length;
  const channelParam = window.channel ? `&channel=${window.channel}` : "";
  
  carouselContainer.innerHTML = categories.map(category => `
    <div class="carousel-slide" data-category="${category}">
      <div class="carousel-content">
        <h1 class="carousel-title">${categoryNameMap[category] || category} Games</h1>
        <p class="carousel-subtitle">${categorySubtitleMap[category] || ""}</p>
        <a href="pages/category.html?category=${category}${channelParam}" class="carousel-button">
          ${getCategoryCount(category)} Games
        </a>
      </div>
    </div>
  `).join("");

  carouselContainer.style.width = `${totalCategories * 100}%`;
  carouselContainer.querySelectorAll(".carousel-slide").forEach(slide => {
    slide.style.width = `${100 / totalCategories}%`;
    slide.addEventListener("click", () => {
      window.location.href = `pages/category.html?category=${slide.dataset.category}${channelParam}`;
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
    
   
    
    generateCarouselSlides(categories);
    generateCarouselDots(categories);
    dots = document.querySelectorAll(".carousel-dot");
    setCarouselBackgrounds(categories);
    startAutoPlay();
    
   
    generateCategorySections(categories);
  } catch (error) {
    const defaultCategories = ["puzzle", "action", "adventure", "racing", "sports", "kids", "girl"];
   
    generateCarouselSlides(defaultCategories);
    generateCarouselDots(defaultCategories);
    dots = document.querySelectorAll(".carousel-dot");
    setCarouselBackgrounds(defaultCategories);
    startAutoPlay();
    generateCategorySections(defaultCategories);
  }
});

