
import { gameDetails, loadGameData, getCategoryOrder } from './BaseURL.js';


export const categoryMap = {
    'action': 'Action',
    'adventure': 'Adventure',
    'racing': 'Racing',
    'puzzle': 'Puzzle',
    'sports': 'Sports',
    'kids': 'Kids',
    'girl': 'Girls'
};


const PATHS = {
    HOME: 'index.html',
    HOME_FROM_PAGES: '../index.html',
    CATEGORY: 'pages/category.html',
    CATEGORY_FROM_PAGES: 'category.html',
    DETAIL: 'item.html',
    DETAIL_FROM_PAGES: '../item.html'
};


const SELECTORS = {
    MENU_TOGGLE: '#menuToggle',
    CATEGORIES_MENU: '#categoriesMenu',
    CLOSE_CATEGORIES: '#closeCategories',
    CATEGORY_ITEMS: '#categoryItems',
    GAMES_GRID: '#gamesGrid',
    CATEGORY_ITEM: '.category-item'
};

const menuToggle = document.getElementById('menuToggle');
const categoriesMenu = document.getElementById('categoriesMenu');
const closeCategories = document.getElementById('closeCategories');
const categoryItemsContainer = document.getElementById('categoryItems');



function getElementIdFromSelector(selector) {
    return selector.startsWith('#') ? selector.slice(1) : selector;
}


export function getCategoryDisplayName(category) {
    return categoryMap[category] || 
           category?.charAt(0).toUpperCase() + category?.slice(1) || 
           'Unknown';
}


function isInPagesDirectory() {
    return window.location.pathname.includes('/pages/');
}


export function getDetailPagePath(defaultPath = PATHS.DETAIL) {
    return isInPagesDirectory() ? PATHS.DETAIL_FROM_PAGES : defaultPath;
}


export function getCategoryPagePath(category) {
    const path = isInPagesDirectory() 
        ? PATHS.CATEGORY_FROM_PAGES 
        : PATHS.CATEGORY;
    return `${path}?category=${category}`;
}


export function getHomePagePath() {
    return isInPagesDirectory() ? PATHS.HOME_FROM_PAGES : PATHS.HOME;
}




export function createGameCardHTML(game, detailPagePath) {
    if (!game || !game.id) {
        console.warn('Invalid game object:', game);
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const gameCategory = game.category ? getCategoryDisplayName(game.category) : '';
    const gameRating = game.rating || 0;
    const gameDownloads = game.downloads || '0';
    const gameDescription = game.description || '';
    
    // 格式化下载量显示
    const formatDownloads = (downloads) => {
        if (typeof downloads === 'number') {
            if (downloads >= 1000000) {
                return (downloads / 1000000).toFixed(1) + 'M';
            } else if (downloads >= 1000) {
                return (downloads / 1000).toFixed(1) + 'K';
            }
            return downloads.toString();
        }
        return downloads;
    };
    
    // 生成星级评分HTML
    const generateStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '★';
        }
        if (hasHalfStar) {
            starsHTML += '½';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '☆';
        }
        return starsHTML;
    };
    
    return `
        <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-card-image-wrapper">
                <img src="${gameImage}" alt="${gameName}" loading="lazy">
                <div class="game-card-text-overlay">
                    <h3 class="game-card-title">${gameName}</h3>
                    ${gameCategory ? `<span class="game-card-category">${gameCategory}</span>` : ''}
                    ${gameRating > 0 ? `
                        <div class="game-card-rating">
                            <span class="stars">${generateStars(gameRating)}</span>
                            <span class="rating-value">${gameRating.toFixed(1)}</span>
                        </div>
                    ` : ''}
                    ${gameDownloads && gameDownloads !== '0' ? `
                        <div class="game-card-downloads">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>${formatDownloads(gameDownloads)} plays</span>
                        </div>
                    ` : ''}
                    ${gameDescription ? `
                        <p class="game-card-description">${gameDescription.substring(0, 60)}${gameDescription.length > 60 ? '...' : ''}</p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

export function parseDownloads(downloadsStr) {
    if (typeof downloadsStr === 'number') {
        return downloadsStr;
    }
    
    if (typeof downloadsStr !== 'string') {
        return 0;
    }
    
    const upperStr = downloadsStr.toUpperCase();
    
    if (upperStr.includes('K')) {
        return parseFloat(upperStr.replace('K', '')) * 1000;
    } else if (upperStr.includes('M')) {
        return parseFloat(upperStr.replace('M', '')) * 1000000;
    } else {
        return parseFloat(downloadsStr) || 0;
    }
}


export function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}


export function displayEmptyResults(container, title, message) {
    if (!container) return;
    container.innerHTML = `
        <div class="no-results">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}



function toggleMenu(isOpen) {
    if (!categoriesMenu) return;
    
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (isOpen) {
        categoriesMenu.classList.add('active');
        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }
    } else {
        categoriesMenu.classList.remove('active');
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
    }
}


function openMenu() {
    toggleMenu(true);
}


function closeMenu() {
    toggleMenu(false);
}


async function generateCategoryItems() {
    if (!categoryItemsContainer) return;
    
    try {
        const categories = await getCategoryOrder();
        if (!Array.isArray(categories) || categories.length === 0) {
            return;
        }
        
       
        categoryItemsContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryName = getCategoryDisplayName(category);
            const categoryItem = createCategoryMenuItem(category, categoryName);
            categoryItemsContainer.appendChild(categoryItem);
        });
    } catch (error) {
        console.error('Failed to generate category items:', error);
    }
}


function createCategoryMenuItem(category, categoryName) {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.dataset.category = category;
    
    const categoryNameSpan = document.createElement('span');
    categoryNameSpan.className = 'category-name';
    categoryNameSpan.textContent = categoryName;
    
    categoryItem.appendChild(categoryNameSpan);
    return categoryItem;
}


function handleCategoryClick(e) {
    const categoryItem = e.target.closest(SELECTORS.CATEGORY_ITEM);
    if (!categoryItem) return;
    
    const category = categoryItem.dataset.category;
    
   
    if (category === 'home') {
        window.location.href = getHomePagePath();
    } else {
        window.location.href = getCategoryPagePath(category);
    }
    
   
    closeMenu();
}


let categoryClickHandlerBound = false;
function setupCategoryClickHandlers() {
    if (!categoriesMenu || categoryClickHandlerBound) return;
    categoriesMenu.addEventListener('click', handleCategoryClick);
    categoryClickHandlerBound = true;
}


function initMenuEventListeners() {
   
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }
    
   
    if (closeCategories) {
        closeCategories.addEventListener('click', closeMenu);
    }
    
   
    document.addEventListener('click', (e) => {
        if (!categoriesMenu || !menuToggle) return;
        
        const menuOverlay = document.getElementById('menuOverlay');
        const isClickInsideMenu = categoriesMenu.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        const isClickOnOverlay = menuOverlay && menuOverlay === e.target;
        
        if ((!isClickInsideMenu && !isClickOnToggle) || isClickOnOverlay) {
            closeMenu();
        }
    });
}




function highlightActiveCategory(category) {
    const categoryItems = document.querySelectorAll(SELECTORS.CATEGORY_ITEM);
    categoryItems.forEach(item => {
        item.classList.toggle('active', item.dataset.category === category);
    });
}


function isValidCategory(category, validCategories) {
    return category && Array.isArray(validCategories) && validCategories.includes(category);
}


async function loadCategoryPage() {
    const gamesGrid = document.getElementById(getElementIdFromSelector(SELECTORS.GAMES_GRID));
    if (!gamesGrid) return;
    
    const category = getUrlParameter('category');
    if (!category) {
        window.location.href = getHomePagePath();
        return;
    }

    try {
       
        const categories = await getCategoryOrder();
        if (!isValidCategory(category, categories)) {
            window.location.href = getHomePagePath();
            return;
        }

       
        highlightActiveCategory(category);
        generateGamesList(category, gamesGrid);
    } catch (error) {
        console.error('Failed to load category page:', error);
        window.location.href = getHomePagePath();
    }
}


function generateGamesList(category, gamesGrid) {
    if (!gamesGrid) return;
    
   
    const games = gameDetails
        .filter(game => game.category === category)
        .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));
    
   
    if (games.length === 0) {
        displayEmptyResults(gamesGrid, 'No games found', 'No games available in this category');
        return;
    }

    const detailPath = getDetailPagePath();
    gamesGrid.innerHTML = games
        .map(game => createGameCardHTML(game, detailPath))
        .join('');
}


async function initPublicFeatures() {
   
    initMenuEventListeners();
    setupCategoryClickHandlers();
    await generateCategoryItems();
}


async function initCategoryPage() {
    const gamesGrid = document.getElementById(getElementIdFromSelector(SELECTORS.GAMES_GRID));
    if (!gamesGrid) return;
    
    try {
        await loadGameData();
        await loadCategoryPage();
    } catch (error) {
        console.error('Failed to initialize category page:', error);
    }
}
document.addEventListener('DOMContentLoaded', async () => {
   
    await initPublicFeatures();
    
   
    await initCategoryPage();
});
