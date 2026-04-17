
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
    DETAIL: 'detail.html',
    DETAIL_FROM_PAGES: '../detail.html'
};


const SELECTORS = {
    CATEGORIES_MENU: '#categoriesMenu',
    CLOSE_CATEGORIES: '#closeCategories',
    CATEGORY_ITEMS: '#categoryItems',
    GAMES_GRID: '#gamesGrid',
    CATEGORY_ITEM: '.category-item'
};

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

export function createGameCardHTML(game, detailPagePath, isBottomTitle = false) {
    if (!game || !game.id) {
        console.warn('Invalid game object:', game);
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const gameCategory = getCategoryDisplayName(game.category || '');
    
    if (isBottomTitle) {
        return `
            <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
                <div class="game-card-image-wrapper">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                </div>
                <div class="game-card-info">
                    <div class="game-info-left">
                        <h3 class="game-card-title">${gameName}</h3>
                        <div class="game-card-category">${gameCategory}</div>
                    </div>
                    <div class="play-button-small">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="${game.category === 'action' ? 'var(--primary-color)' : 'var(--primary-color)'}"/>
                            <path d="M9 8l8 4-8 4V8z" fill="white"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
                <div class="game-card-image-wrapper">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                    <div class="game-card-title-overlay">
                        <h3 class="game-card-title">${gameName}</h3>
                    </div>
                </div>
            </div>
        `;
    }
}

export function createGameListItemHTML(game, detailPagePath) {
    if (!game || !game.id) {
        console.warn('Invalid game object:', game);
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const gameDescription = game.description || '';
    const gameRating = game.rating || 0;
    const gameDownloads = game.downloads || '0';
    
    // 生成星星评分
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push('★');
            } else if (i === fullStars && hasHalfStar) {
                stars.push('★');
            } else {
                stars.push('☆');
            }
        }
        return stars.join('');
    };
    
    return `
        <div class="game-list-item" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-list-thumbnail">
                <img src="${gameImage}" alt="${gameName}" loading="lazy">
            </div>
            <div class="game-list-content">
                <div class="game-list-rating-download">
                    <div class="game-rating">
                        <span class="stars">${renderStars(gameRating)}</span>
                    </div>
                    <div class="game-downloads">${gameDownloads}</div>
                </div>
                <div class="game-list-description">${gameDescription}</div>
                <div class="game-list-title-container">
                    <h3 class="game-list-title">${gameName}</h3>
                    <div class="play-button-small">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="${game.category === 'action' ? 'var(--primary-color)' : 'var(--primary-color)'}"/>
                            <path d="M9 8l8 4-8 4V8z" fill="white"/>
                        </svg>
                    </div>
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
    const footerCategoriesLink = document.getElementById('footerCategoriesLink');
    if (footerCategoriesLink) {
        footerCategoriesLink.addEventListener('click', openMenu);
    }
    
   
    if (closeCategories) {
        closeCategories.addEventListener('click', closeMenu);
    }
    
   
    document.addEventListener('click', (e) => {
        if (!categoriesMenu) return;
        
        const menuOverlay = document.getElementById('menuOverlay');
        const isClickInsideMenu = categoriesMenu.contains(e.target);
        const isClickOnFooterLink = footerCategoriesLink && footerCategoriesLink.contains(e.target);
        const isClickOnOverlay = menuOverlay && menuOverlay === e.target;
        
        if ((!isClickInsideMenu && !isClickOnFooterLink) || isClickOnOverlay) {
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


function setActiveFooterLink() {
    const currentPath = window.location.pathname;
    const footerLinks = document.querySelectorAll('.footer-link');
    

    footerLinks.forEach(link => {
        link.classList.remove('active');
    });
    

    if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '') {
      
        const homeLink = document.querySelector('.footer-link[href*="index.html"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    } else if (currentPath.includes('category.html')) {
        
        const categoriesLink = document.getElementById('footerCategoriesLink');
        if (categoriesLink) {
            categoriesLink.classList.add('active');
        }
    } else if (currentPath.includes('about.html')) {
     
        const aboutLink = document.querySelector('.footer-link[href*="about.html"]');
        if (aboutLink) {
            aboutLink.classList.add('active');
        }
    } else if (currentPath.includes('privacy.html')) {
        
        const privacyLink = document.querySelector('.footer-link[href*="privacy.html"]');
        if (privacyLink) {
            privacyLink.classList.add('active');
        }
    } else if (currentPath.includes('terms.html')) {
       
        const termsLink = document.querySelector('.footer-link[href*="terms.html"]');
        if (termsLink) {
            termsLink.classList.add('active');
        }
    } else if (currentPath.includes('detail.html')) {
  
        const homeLink = document.querySelector('.footer-link[href*="index.html"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
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
    

    gamesGrid.className = 'game-grid game-grid-three-columns';
   
    const games = gameDetails
        .filter(game => game.category === category)
        .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));
    
   
    if (games.length === 0) {
        displayEmptyResults(gamesGrid, 'No games found', 'No games available in this category');
        return;
    }

    const detailPath = getDetailPagePath();
    gamesGrid.innerHTML = games
        .map(game => createGameCardHTML(game, detailPath, true))
        .join('');
}


async function initPublicFeatures() {
    initMenuEventListeners();
    setupCategoryClickHandlers();
    await generateCategoryItems();
    setActiveFooterLink();
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
