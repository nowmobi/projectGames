import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { initSearch } from './inpublic.js';

let gameDetails = [];
let categoryOrder = [];

const menuToggle = document.getElementById('menuToggle');
const closeCategories = document.getElementById('closeCategories');

const recommendedGamesGrid = document.getElementById('recommendedGamesGrid');
const hotGamesList = document.getElementById('hotGamesList');

const contentCarousel = document.getElementById('contentCarousel');
const carouselIndicators = document.getElementById('carouselIndicators');

const categoriesMenu = document.getElementById('categoriesMenu');
const mainContent = document.querySelector('.main-content');


function updateGridVariable(category, gridElement) {
    const gridIdMap = {
        'action': 'actionGamesGrid',
        'adventure': 'adventureGamesGrid',
        'racing': 'racingGamesGrid',
        'puzzle': 'puzzleGamesGrid',
        'sports': 'sportsGamesGrid',
        'kids': 'kidsGamesGrid',
        'girl': 'girlGamesGrid'
    };
    const gridId = gridIdMap[category];
    if (gridId) {
        window[gridId] = gridElement;
    }
}


function generateGameCardHTML(game) {
    return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="homepage-game-card">
            <div class="top-desc">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 57 67" fill="none">
                    <circle cx="25.4212" cy="54.5" r="10" fill="white" stroke="black" stroke-width="5"></circle>
                    <path d="M23.3467 55.442C24.4192 56.3116 25.9935 56.1471 26.8631 55.0746C27.7327 54.0021 27.5682 52.4278 26.4957 51.5582L23.3467 55.442ZM26.4957 51.5582C8.75064 37.1702 9.22752 20.4111 16.7641 12.1893L13.0784 8.81073C3.01497 19.789 4.09186 39.8298 23.3467 55.442L26.4957 51.5582ZM16.7641 12.1893C20.0902 8.56091 26.4602 8.17602 32.6545 11.0985C38.7455 13.9723 43.4212 19.524 43.4212 26.0001H48.4212C48.4212 16.9761 41.9969 9.97775 34.788 6.57655C27.6823 3.22403 18.5523 2.83916 13.0784 8.81073L16.7641 12.1893Z" fill="black"></path>
                </svg>
            </div>
            <div class="card-inner">
                <div class="img-manage">
                    <img src="${game.image}" alt="${game.name}" class="inner-img">
                </div>
                <div class="homepage-game-card-content">
                    <p class="homepage-game-title">${game.name}</p>
                </div>
                <div class="homepage-game-stats">
                    <span class="homepage-game-rating">
                        <svg width="18" height="18" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                            <path d="M544.402286 99.693714a73.142857 73.142857 0 0 1 33.206857 33.206857l84.845714 171.958858 189.805714 27.648a73.142857 73.142857 0 0 1 40.521143 124.708571l-137.289143 133.851429 32.402286 189.074285a73.142857 73.142857 0 0 1-106.130286 77.092572L512 768l-169.764571 89.234286a73.142857 73.142857 0 0 1-106.130286-77.092572l32.402286-189.001143-137.289143-133.851428a73.142857 73.142857 0 0 1 40.521143-124.781714l189.805714-27.648 84.845714-171.958858a73.142857 73.142857 0 0 1 98.011429-33.206857z m69.485714 272.091429L512 165.302857 410.112 371.712l-227.84 33.133714 164.864 160.694857-38.912 226.962286L512 685.348571l203.776 107.154286-38.912-226.962286 164.864-160.694857-227.84-33.133714z" fill="#ffab2a" stroke="#ffab2a" stroke-width="40"/>
                        </svg>
                        ${game.rating || '5.0'}
                    </span>
                    <span class="homepage-game-download">
                        <svg width="18" height="18" viewBox="0 0 1024 1024" fill="#ff5252" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 832 364.8 h -147.2 s 19.2 -64 32 -179.2 c 6.4 -57.6 -38.4 -115.2 -102.4 -121.6 h -12.8 c -51.2 0 -83.2 32 -102.4 76.8 l -38.4 96 c -32 64 -57.6 102.4 -76.8 115.2 c -25.6 12.8 -121.6 12.8 -128 12.8 H 128 c -38.4 0 -64 25.6 -64 57.6 v 480 c 0 32 25.6 57.6 64 57.6 h 646.4 c 96 0 121.6 -64 134.4 -153.6 l 51.2 -307.2 c 6.4 -70.4 -6.4 -134.4 -128 -134.4 Z m -576 537.6 H 128 V 422.4 h 128 v 480 Z m 640 -409.6 l -51.2 307.2 c -12.8 57.6 -12.8 102.4 -76.8 102.4 H 320 V 422.4 c 44.8 0 70.4 -6.4 89.6 -19.2 c 32 -12.8 64 -64 108.8 -147.2 c 25.6 -64 38.4 -96 44.8 -102.4 c 6.4 -19.2 19.2 -32 44.8 -32 h 6.4 c 32 0 44.8 32 44.8 51.2 c -12.8 102.4 -32 166.4 -32 166.4 l -25.6 83.2 h 243.2 c 19.2 0 32 0 44.8 12.8 c 12.8 12.8 6.4 38.4 6.4 57.6 Z" stroke="#ff5252" stroke-width="60" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                        ${game.downloads || '0'}
                    </span>
                </div>
            </div>
        </a>
    `;
}


function getCategoryInfo() {
    return {
        'action': { name: 'Action game', generator: generateActionGames },
        'adventure': { name: 'Adventure game', generator: generateAdventureGames },
        'racing': { name: 'Racing game', generator: generateRacingGames },
        'puzzle': { name: 'Puzzle game', generator: generatePuzzleGames },
        'sports': { name: 'Sports game', generator: generateSportsGames },
        'kids': { name: 'Kids game', generator: generateKidsGames },
        'girl': { name: 'Girls game', generator: generateGirlGames },
        'recommended': { name: 'Recommend', generator: generateRecommendedGames }
    };
}


function generateCategoryGames(category, gridId) {
   
    const camelCaseId = gridId.charAt(0).toLowerCase() + gridId.slice(1);
    const grid = window[camelCaseId] || document.getElementById(gridId);
    if (!grid) return;
    const games = gameDetails.filter(game => game.category === category)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    grid.innerHTML = games.map(generateGameCardHTML).join('');
}

function generatePuzzleGames() {
    generateCategoryGames('puzzle', 'puzzleGamesGrid');
}

function generateActionGames() {
    generateCategoryGames('action', 'actionGamesGrid');
}

function generateAdventureGames() {
    generateCategoryGames('adventure', 'adventureGamesGrid');
}

function generateRacingGames() {
    generateCategoryGames('racing', 'racingGamesGrid');
}

function generateSportsGames() {
    generateCategoryGames('sports', 'sportsGamesGrid');
}

function generateKidsGames() {
    generateCategoryGames('kids', 'kidsGamesGrid');
}

function generateGirlGames() {
    generateCategoryGames('girl', 'girlGamesGrid');
}

function generateRecommendedGames() {
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }


    const validGames = gameDetails.filter(game => {
        return game &&
               game.id !== null &&
               game.id !== undefined &&
               !isNaN(Number(game.id)) &&
               game.name &&
               String(game.name).trim().length > 0;
    });

    if (validGames.length === 0) {
        return;
    }

    const shuffledGames = [...validGames].sort(() => 0.5 - Math.random());
    const recommendedGames = shuffledGames.slice(0, 4);

    recommendedGamesGrid.innerHTML = recommendedGames.map(generateGameCardHTML).join('');
}

function generateHotGames() {
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }

    const validGames = gameDetails.filter(game => {
        return game &&
               game.id !== null &&
               game.id !== undefined &&
               !isNaN(Number(game.id)) &&
               game.name &&
               String(game.name).trim().length > 0 &&
               game.image;
    });

    if (validGames.length === 0) {
        return;
    }

    const shuffledGames = [...validGames].sort(() => 0.5 - Math.random());
    const hotGames = shuffledGames.slice(0, 5);

    const hotGamesHTML = hotGames.map((game, index) => {
        return `
            <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="hot-game-item">
                <span class="hot-game-rank">${index + 1}</span>
                <img src="${game.image}" alt="${game.name}" class="hot-game-image">
                <div class="hot-game-info">
                    <p class="hot-game-name">${game.name}</p>
                    <div class="hot-game-download">
                        <svg width="14" height="14" viewBox="0 0 1024 1024" fill="none" stroke="#ffab2a" stroke-width="80" xmlns="http://www.w3.org/2000/svg">
                            <path d="M544.402286 99.693714a73.142857 73.142857 0 0 1 33.206857 33.206857l84.845714 171.958858 189.805714 27.648a73.142857 73.142857 0 0 1 40.521143 124.708571l-137.289143 133.851429 32.402286 189.074285a73.142857 73.142857 0 0 1-106.130286 77.092572L512 768l-169.764571 89.234286a73.142857 73.142857 0 0 1-106.130286-77.092572l32.402286-189.001143-137.289143-133.851428a73.142857 73.142857 0 0 1 40.521143-124.781714l189.805714-27.648 84.845714-171.958858a73.142857 73.142857 0 0 1 98.011429-33.206857z m69.485714 272.091429L512 165.302857 410.112 371.712l-227.84 33.133714 164.864 160.694857-38.912 226.962286L512 685.348571l203.776 107.154286-38.912-226.962286 164.864-160.694857-227.84-33.133714z"/>
                        </svg>
                        <svg width="14" height="14" viewBox="0 0 1024 1024" fill="#ff5252" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 832 364.8 h -147.2 s 19.2 -64 32 -179.2 c 6.4 -57.6 -38.4 -115.2 -102.4 -121.6 h -12.8 c -51.2 0 -83.2 32 -102.4 76.8 l -38.4 96 c -32 64 -57.6 102.4 -76.8 115.2 c -25.6 12.8 -121.6 12.8 -128 12.8 H 128 c -38.4 0 -64 25.6 -64 57.6 v 480 c 0 32 25.6 57.6 64 57.6 h 646.4 c 96 0 121.6 -64 134.4 -153.6 l 51.2 -307.2 c 6.4 -70.4 -6.4 -134.4 -128 -134.4 Z m -576 537.6 H 128 V 422.4 h 128 v 480 Z m 640 -409.6 l -51.2 307.2 c -12.8 57.6 -12.8 102.4 -76.8 102.4 H 320 V 422.4 c 44.8 0 70.4 -6.4 89.6 -19.2 c 32 -12.8 64 -64 108.8 -147.2 c 25.6 -64 38.4 -96 44.8 -102.4 c 6.4 -19.2 19.2 -32 44.8 -32 h 6.4 c 32 0 44.8 32 44.8 51.2 c -12.8 102.4 -32 166.4 -32 166.4 l -25.6 83.2 h 243.2 c 19.2 0 32 0 44.8 12.8 c 12.8 12.8 6.4 38.4 6.4 57.6 Z" stroke="#ff5252" stroke-width="60" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                        ${game.downloads || '0'}
                    </div>
                </div>
                <span class="hot-game-play">Play</span>
            </a>
        `;
    }).join('');

    hotGamesList.innerHTML = hotGamesHTML;
}

function generateContentCarousel() {
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }

    const validGames = gameDetails.filter(game => {
        return game &&
               game.id !== null &&
               game.id !== undefined &&
               !isNaN(Number(game.id)) &&
               game.name &&
               String(game.name).trim().length > 0 &&
               game.image;
    });

    if (validGames.length === 0) {
        return;
    }

    const carouselGames = [...validGames].sort(() => 0.5 - Math.random()).slice(0, 6);

    if (carouselGames.length > 0) {
        renderCarouselItems(carouselGames);
        renderCarouselIndicators(carouselGames.length);
        startContentCarousel(carouselGames);
    }
}

function renderCarouselItems(games) {
    contentCarousel.innerHTML = games.map((game, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="carousel-content">
                <h3 class="carousel-title">${game.name}</h3>
                <p class="carousel-description">${game.description || 'No description available'}</p>
                <span class="carousel-category">${getCategoryName(game.category)}</span>
            </div>
            <div class="carousel-image-wrapper">
                <img src="${game.image}" alt="${game.name}" class="carousel-image">
            </div>
        </div>
    `).join('');
}

function renderCarouselIndicators(count) {
    carouselIndicators.innerHTML = Array.from({ length: count }, (_, index) => `
        <div class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    carouselIndicators.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-indicator')) {
            const index = parseInt(e.target.dataset.index);
            goToCarouselSlide(index);
        }
    });
}

function getCategoryName(category) {
    const categoryInfo = getCategoryInfo();
    const categoryLower = String(category || '').toLowerCase().trim();
    return categoryInfo[categoryLower]?.name || category || 'Other';
}

let currentCarouselIndex = 0;
let carouselInterval = null;

function startContentCarousel(games) {
    if (games.length <= 1) return;

    carouselInterval = setInterval(() => {
        currentCarouselIndex = (currentCarouselIndex + 1) % games.length;
        goToCarouselSlide(currentCarouselIndex);
    }, 4000);
}

function goToCarouselSlide(index) {
    const items = contentCarousel.querySelectorAll('.carousel-item');
    const indicators = carouselIndicators.querySelectorAll('.carousel-indicator');

    items.forEach((item, i) => {
        item.classList.remove('active');
        if (i === index) {
            item.classList.add('active');
        }
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === index) {
            indicator.classList.add('active');
        }
    });

    currentCarouselIndex = index;
}


menuToggle.addEventListener('click', () => {
    categoriesMenu.classList.add('active');
});

closeCategories.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
});


function generateSidebarCategories(categories) {
    if (!categoriesMenu) return;
    
    const categoriesHeader = categoriesMenu.querySelector('.categories-header');
   
    const existingItems = categoriesMenu.querySelectorAll('.category-item');
    existingItems.forEach(item => item.remove());
    
   
    const homeItem = document.createElement('div');
    homeItem.className = 'category-item active';
    homeItem.setAttribute('data-category', 'home');
    homeItem.innerHTML = `
        <span class="category-name">Home</span>
        <span class="category-count">${gameDetails.length}</span>
    `;
    homeItem.addEventListener('click', () => {
        categoriesMenu.classList.remove('active');
    });
    categoriesHeader.after(homeItem);
    
    const recommendItem = document.createElement('div');
    recommendItem.className = 'category-item';
    recommendItem.setAttribute('data-category', 'recommended');
    recommendItem.innerHTML = `
        <span class="category-name">Recommend</span>
        <span class="category-count">${gameDetails.length}</span>
    `;
    recommendItem.addEventListener('click', () => {
        window.location.href = `pages/category.html?category=recommended` + (window.channel ? '&channel=' + window.channel : '');
        categoriesMenu.classList.remove('active');
    });
    homeItem.after(recommendItem);
    
   
    const categoryInfo = getCategoryInfo();
    let lastItem = recommendItem;
    
    categories.forEach((category) => {
        if (category === 'recommended') return;
        
       
        const categoryLower = String(category).toLowerCase().trim();
        
        const count = gameDetails.filter(game => {
            const gameCategory = String(game.category || '').toLowerCase().trim();
            return gameCategory === categoryLower;
        }).length;
        
        const categoryName = categoryInfo[categoryLower]?.name || category.charAt(0).toUpperCase() + category.slice(1) + ' game';
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.setAttribute('data-category', categoryLower);
        item.innerHTML = `
            <span class="category-name">${categoryName.replace(' game', '')}</span>
            <span class="category-count">${count}</span>
        `;
        item.addEventListener('click', () => {
            window.location.href = `pages/category.html?category=${categoryLower}` + (window.channel ? '&channel=' + window.channel : '');
            categoriesMenu.classList.remove('active');
        });
        
       
        lastItem.after(item);
        lastItem = item;
    });
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('section-title') || e.target.closest('.section-title')) {
        const title = e.target.classList.contains('section-title') ? e.target : e.target.closest('.section-title');
        const category = title.dataset.category;
        if (category) {
            window.location.href = `pages/category.html?category=${category}` + (window.channel ? '&channel=' + window.channel : '');
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
       
        const [gameData, categories] = await Promise.all([
            loadGameData(),
            getCategoryOrder()
        ]);
        
        gameDetails = gameData;
        
       
        if (Array.isArray(categories) && categories.length > 0) {
           
            categoryOrder = categories.filter(cat => typeof cat === 'string' && cat.trim().length > 0);
        } else {
           
            categoryOrder = ['puzzle', 'action', 'adventure', 'racing', 'sports', 'kids', 'girl'];
        }
        
        if (gameDetails.length > 0) {

            generateRecommendedGames();
            generateHotGames();
            generateContentCarousel();

            generateSidebarCategories(categoryOrder);

            generateCategorySections(categoryOrder);

            const categoryInfo = getCategoryInfo();
            categoryOrder.forEach((category) => {
                const categoryLower = String(category).toLowerCase().trim();
                if (categoryInfo[categoryLower] && categoryInfo[categoryLower].generator) {
                    categoryInfo[categoryLower].generator();
                }
            });

            await initSearch();
        } else {
            console.warn('No game data loaded');
        }
    } catch (error) {
        console.error('Failed to load game data:', error);
    }
});


function generateCategorySectionContent(category, categoryInfo) {
    const categoryLower = String(category).toLowerCase().trim();
    const info = categoryInfo[categoryLower];
    
    if (!info) {
        return '';
    }
    
    const count = gameDetails.filter(game => {
        const gameCategory = String(game.category || '').toLowerCase().trim();
        return gameCategory === categoryLower;
    }).length;
    
    if (count === 0) {
        return '';
    }
    
   
    const gridId = categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1) + 'GamesGrid';
    
    return `
        <div class="section-header">
            <h2 class="section-title" data-category="${categoryLower}">${info.name}</h2>
        </div>
        <div class="homepage-game-grid" id="${gridId}"></div>
    `;
}


function generateCategorySections(categories) {
    if (!mainContent) return;
    
    const categoryInfo = getCategoryInfo();
    
   
    const emptySections = Array.from(mainContent.querySelectorAll('.category-section')).filter(section => {
       
        if (section.querySelector('#recommendedGamesGrid')) {
            return false;
        }
       
        const hasContent = section.querySelector('.section-header') || section.querySelector('.homepage-game-grid');
        return !hasContent;
    });
    
   
    let sectionIndex = 0;
    categories.forEach((category) => {
        if (category === 'recommended') return;
        
        if (sectionIndex >= emptySections.length) {
            return;
        }
        
        const section = emptySections[sectionIndex];
        const categoryLower = String(category).toLowerCase().trim();
        const content = generateCategorySectionContent(category, categoryInfo);
        
        if (content) {
            section.innerHTML = content;
            
           
            const gridId = categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1) + 'GamesGrid';
            const gridElement = document.getElementById(gridId);
            if (gridElement) {
                updateGridVariable(categoryLower, gridElement);
            }
            
            sectionIndex++;
        }
    });
}

document.addEventListener('click', (e) => {
    if (!categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        categoriesMenu.classList.remove('active');
    }
});

