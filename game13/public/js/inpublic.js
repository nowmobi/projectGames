
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
    GAMES_GRID: '#gamesGrid',
    CATEGORY_ITEM: '.category-item'
};

const menuToggle = document.getElementById('menuToggle');
const categoriesMenu = document.getElementById('categoriesMenu');
const closeCategories = document.getElementById('closeCategories');
const categoryItemsContainer = document.getElementById('categoryItems');
const menuOverlay = document.getElementById('menuOverlay');





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




export function createGameCardHTML(game, detailPagePath, forceListStyle = false) {
    if (!game || !game.id) {
        console.warn('Invalid game object:', game);
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    
    // 检查是否在分类页、详情页推荐部分或搜索结果（通过检查URL路径和容器ID）
    const isCategoryPage = window.location.pathname.includes('category.html') || 
                          document.getElementById('gamesGrid') !== null;
    const recommendedGamesEl = document.getElementById('recommendedGames');
    const isDetailRecommended = recommendedGamesEl !== null && 
                                recommendedGamesEl.classList.contains('category-games-list');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const isSearchResults = searchResultsGrid !== null || forceListStyle;
    
    if (isCategoryPage || isDetailRecommended || isSearchResults) {
        // 分类页使用列表样式
        // 根据rating显示星星数量
        let ratingValue = 4.5; // 默认值
        if (game.rating !== undefined && game.rating !== null && game.rating !== '') {
            const parsedRating = typeof game.rating === 'number' ? game.rating : parseFloat(game.rating);
            if (!isNaN(parsedRating) && parsedRating >= 0) {
                ratingValue = Math.min(Math.max(parsedRating, 0), 5);
            }
        }
        
        // 生成星星：满星（金色）+ 半星（金色半透明）+ 空星（灰色）
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        // 满星（金色）
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star-icon star-full">★</span>';
        }
        // 半星（金色半透明）
        if (hasHalfStar) {
            starsHTML += '<span class="star-icon star-half">★</span>';
        }
        // 空星（灰色）
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star-icon star-empty">★</span>';
        }
        
        // 格式化下载量显示
        const downloads = game.downloads || '0';
        let downloadDisplay = downloads;
        if (typeof downloads === 'string') {
            downloadDisplay = downloads.toUpperCase();
        } else if (typeof downloads === 'number') {
            if (downloads >= 1000000) {
                downloadDisplay = (downloads / 1000000).toFixed(1) + 'M';
            } else if (downloads >= 1000) {
                downloadDisplay = (downloads / 1000).toFixed(1) + 'K';
            }
        }
        
        return `
            <div class="game-list-item" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
                <div class="game-list-icon">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                </div>
                <div class="game-list-info">
                    <div class="game-list-name">${gameName}</div>
                    <div class="game-list-rating">
                        ${starsHTML}
                    </div>
                    <div class="game-list-download">${downloadDisplay}</div>
                </div>
            </div>
        `;
    }
    
    // 其他页面使用原来的卡片样式
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
    const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID.slice(1));
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
    const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID.slice(1));
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
