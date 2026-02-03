
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
    DETAIL: 'ny.html',
    DETAIL_FROM_PAGES: '../ny.html'
};


const SELECTORS = {
    GAMES_GRID: 'gamesGrid'
};

const CATEGORY_ICON_MAP = {
    'home': 'home.png',
    'action': 'action.png',
    'adventure': 'adventure.png',
    'racing': 'racing.png',
    'puzzle': 'puzzle.png',
    'sports': 'sports.png',
    'kids': 'kids.png',
    'girl': 'girl.png',
    'hot': 'hot.png'
};

export function getCategoryIcon(category) {
    return CATEGORY_ICON_MAP[category] || CATEGORY_ICON_MAP['action'];
}

export function formatGameRating(rating) {
    let ratingValue = 4.5;
    if (rating !== undefined && rating !== null && rating !== '') {
        const parsedRating = typeof rating === 'number' ? rating : parseFloat(rating);
        if (!isNaN(parsedRating) && parsedRating >= 0) {
            ratingValue = Math.min(Math.max(parsedRating, 0), 5);
        }
    }
    return ratingValue;
}

export function formatDownloadsDisplay(downloads) {
    const downloadsValue = downloads || '0';
    let downloadDisplay = downloadsValue;
    if (typeof downloadsValue === 'string') {
        downloadDisplay = downloadsValue.toUpperCase();
    } else if (typeof downloadsValue === 'number') {
        if (downloadsValue >= 1000000) {
            downloadDisplay = (downloadsValue / 1000000).toFixed(1) + 'M';
        } else if (downloadsValue >= 1000) {
            downloadDisplay = (downloadsValue / 1000).toFixed(1) + 'K';
        }
    }
    return downloadDisplay;
}

export function shuffleArray(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return [];
    }
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function isValidGameId(id) {
    return id !== null && 
           id !== undefined && 
           id !== '' && 
           (typeof id === 'number' || (typeof id === 'string' && id.trim() !== ''));
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
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    
    // 检查是否需要显示完整卡片（带评分和下载量）
    // 用于首页分类区域、推荐区域和搜索结果
    const pathname = window.location.pathname;
    const isHomePage = pathname.includes('index.html') || 
                       pathname === '/' || 
                       pathname.endsWith('/');
    const categorySection = document.querySelector('.category-section');
    const recommendedGamesEl = document.getElementById('recommendedGames');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    
    const needsFullCard = (isHomePage && categorySection !== null) || 
                         (recommendedGamesEl !== null && recommendedGamesEl.classList.contains('game-grid')) ||
                         (searchResultsGrid !== null && searchResultsGrid.classList.contains('game-grid'));
    
    // 如果需要完整卡片，生成带评分和下载量的版本
    if (needsFullCard) {
        const ratingValue = formatGameRating(game.rating);
        const downloadDisplay = formatDownloadsDisplay(game.downloads);
        const gameCategory = game.category || '';
        const categoryDisplayName = getCategoryDisplayName(gameCategory);
        const starImagePath = isInPagesDirectory() ? '../public/images/star.png' : 'public/images/star.png';
        
        return `
            <div class="game-card-wrapper" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
                <div class="game-card">
                    <div class="game-card-image-wrapper">
                        <img src="${gameImage}" alt="${gameName}" loading="lazy">
                    </div>
                </div>
                <div class="game-card-name-row">
                    <h3 class="game-card-name">${gameName}</h3>
                    <div class="game-card-rating">
                        <img src="${starImagePath}" alt="star" class="game-card-rating-star">
                        <span class="game-card-rating-value">${ratingValue.toFixed(1)}</span>
                    </div>
                </div>
                <div class="game-card-info-row">
                    <div class="game-card-type">${categoryDisplayName}</div>
                    <div class="game-card-download">${downloadDisplay}</div>
                </div>
            </div>
        `;
    }
    
    // 简化版本（用于其他场景）
    return `
        <div class="game-card-wrapper" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-card">
                <div class="game-card-image-wrapper">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                </div>
            </div>
            <h3 class="game-card-name">${gameName}</h3>
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




function navigateToCategoryPage() {
    window.location.href = getCategoryPagePath('all');
}

function initMenuEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToCategoryPage();
        });
    }
}



function isValidCategory(category, validCategories) {
    return category && Array.isArray(validCategories) && validCategories.includes(category);
}

async function loadCategoryPage() {
    const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID);
    if (!gamesGrid) return;
    
    const category = getUrlParameter('category') || 'all';

    try {
        const categories = await getCategoryOrder();
        
        if (category !== 'all' && !isValidCategory(category, categories)) {
            window.location.href = getHomePagePath();
            return;
        }

       
        await generateCategoryButtonsForCategoryPage(categories, category);
        generateGamesList(category, gamesGrid);
        
        const categoryTitleIcon = document.getElementById('categoryContentTitleIcon');
        const categoryTitleText = document.getElementById('categoryContentTitle');
        if (categoryTitleIcon && categoryTitleText) {
            const iconPath = getCategoryIcon(category === 'all' ? 'all' : category);
            categoryTitleIcon.src = `../public/images/${iconPath}`;
            categoryTitleIcon.alt = category === 'all' ? 'All' : getCategoryDisplayName(category);
            categoryTitleText.textContent = category === 'all' ? 'All' : getCategoryDisplayName(category);
        }
    } catch (error) {
        window.location.href = getHomePagePath();
    }
}


function generateGamesList(category, gamesGrid) {
    if (!gamesGrid) return;
    
   
    if (!gameDetails || gameDetails.length === 0) {
        displayEmptyResults(gamesGrid, 'Loading...', 'Loading games...');
        return;
    }
    
   
    const games = category === 'all' 
        ? gameDetails.sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads))
        : gameDetails
            .filter(game => game.category === category)
            .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));
    
    
   
    if (games.length === 0) {
        displayEmptyResults(gamesGrid, 'No games found', 'No games available in this category');
        return;
    }

    const detailPath = getDetailPagePath();
    gamesGrid.innerHTML = games
        .map(game => createCategoryProductCardHTML(game, detailPath))
        .join('');
    

    const cards = gamesGrid.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 50);
    });
}


function createCategoryProductCardHTML(game, detailPagePath) {
    if (!game || !game.id) {
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const starImagePath = isInPagesDirectory() ? '../public/images/star.png' : 'public/images/star.png';
    
    const ratingValue = formatGameRating(game.rating);
    const downloadDisplay = formatDownloadsDisplay(game.downloads);
    const gameCategory = game.category || '';
    const categoryDisplayName = getCategoryDisplayName(gameCategory);
    
    return `
        <div class="game-card-wrapper" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-card">
                <div class="game-card-image-wrapper">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='#f5f5f5';">
                </div>
            </div>
            <div class="game-card-name-row">
                <h3 class="game-card-name">${gameName}</h3>
                <div class="game-card-rating">
                    <img src="${starImagePath}" alt="star" class="game-card-rating-star">
                    <span class="game-card-rating-value">${ratingValue.toFixed(1)}</span>
                </div>
            </div>
            <div class="game-card-info-row">
                <div class="game-card-type">${categoryDisplayName}</div>
                <div class="game-card-download">${downloadDisplay}</div>
            </div>
        </div>
    `;
}



async function generateCategoryButtonsForCategoryPage(categories, activeCategory) {
    const categoryButtons = document.getElementById('categoryButtons');
    if (!categoryButtons) return;
    
    const allGamesActive = activeCategory === 'all';
    const allGamesButton = `
        <button class="category-btn ${allGamesActive ? 'active' : ''}" 
                data-category="all" 
                type="button">
            <div class="category-btn-icon">
                <img src="../public/images/all.png" alt="All">
            </div>
            <span class="category-btn-text">All</span>
        </button>
    `;
    
   
    const categoryButtonsHTML = categories.map(category => {
        const displayName = getCategoryDisplayName(category);
        const isActive = category === activeCategory;
        const iconPath = getCategoryIcon(category);
        const iconUrl = `../public/images/${iconPath}`;
        
       
        return `
            <button class="category-btn ${isActive ? 'active' : ''}" 
                    data-category="${category}" 
                    type="button">
                <div class="category-btn-icon">
                    <img src="${iconUrl}" alt="${displayName}">
                </div>
                <span class="category-btn-text">${displayName}</span>
            </button>
        `;
    }).join('');
    
    categoryButtons.innerHTML = allGamesButton + categoryButtonsHTML;
    
   
    initCategoryPageButtonInteractions();
}


function initCategoryPageButtonInteractions() {
    const categoryButtons = document.getElementById('categoryButtons');
    if (!categoryButtons) return;
    
    categoryButtons.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        
        const category = button.dataset.category;
        if (!category) return;
        
       
        switchCategory(category);
    });
}


async function switchCategory(category) {
    const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID);
    const categoryTitle = document.getElementById('categoryContentTitle');
    const categoryButtons = document.getElementById('categoryButtons');
    
    if (!gamesGrid) return;
    
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('category', category);
    window.history.pushState({ category }, '', currentUrl.toString());
    
    gamesGrid.style.opacity = '0';
    gamesGrid.style.transform = 'translateY(10px)';
    
    if (categoryButtons) {
        const buttons = categoryButtons.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    const categoryTitleIcon = document.getElementById('categoryContentTitleIcon');
    const categoryTitleText = document.getElementById('categoryContentTitle');
    if (categoryTitleIcon && categoryTitleText) {
        categoryTitleIcon.style.opacity = '0';
        categoryTitleText.style.opacity = '0';
        setTimeout(() => {
            const iconPath = getCategoryIcon(category === 'all' ? 'all' : category);
            categoryTitleIcon.src = `../public/images/${iconPath}`;
            categoryTitleIcon.alt = category === 'all' ? 'All' : getCategoryDisplayName(category);
            categoryTitleText.textContent = category === 'all' ? 'All' : getCategoryDisplayName(category);
            categoryTitleIcon.style.opacity = '1';
            categoryTitleText.style.opacity = '1';
        }, 150);
    }
    
 
    setTimeout(async () => {
        try {
          
            generateGamesList(category, gamesGrid);
    
            setTimeout(() => {
                gamesGrid.style.opacity = '1';
                gamesGrid.style.transform = 'translateY(0)';
            }, 50);
        } catch (error) {
            console.error('Error switching category:', error);
            gamesGrid.style.opacity = '1';
            gamesGrid.style.transform = 'translateY(0)';
        }
    }, 200);
}


window.switchCategory = switchCategory;

async function initPublicFeatures() {
    const isCategoryPage = window.location.pathname.includes('category.html');
    if (!isCategoryPage) {
        initMenuEventListeners();
    }
}


async function initCategoryPage() {
    const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID);
    if (!gamesGrid) return;
    try {
        await loadGameData();
        await loadCategoryPage();
        
        window.addEventListener('popstate', async (event) => {
            const category = getUrlParameter('category') || 'all';
            const gamesGrid = document.getElementById(SELECTORS.GAMES_GRID);
            if (gamesGrid) {
                await loadCategoryPage();
            }
        });
    } catch (error) {
        console.error('Failed to initialize category page:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initPublicFeatures();
    await initCategoryPage();
});
