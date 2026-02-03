
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
    GAMES_GRID: 'gamesGrid'
};

const CATEGORY_ICON_MAP = {
    'home': 'home.svg',
    'all': 'all.svg',
    'action': 'action.svg',
    'adventure': 'adventure.svg',
    'racing': 'racing.svg',
    'puzzle': 'puzzle.svg',
    'sports': 'sports.svg',
    'kids': 'kids.svg',
    'girl': 'girl.svg',
    'hot': 'hot.svg'
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



export function createGameCardHTML(game, detailPagePath, options = {}) {
    if (!game || !game.id) {
        return '';
    }
    
    const { includeImageErrorHandler = false } = options;
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const ratingValue = formatGameRating(game.rating);
    const downloadDisplay = formatDownloadsDisplay(game.downloads);
    const starImagePath = isInPagesDirectory() ? '../public/images/star.svg' : 'public/images/star.svg';
    const hotImagePath = isInPagesDirectory() ? '../public/images/hot.svg' : 'public/images/hot.svg';
    const imageErrorHandler = includeImageErrorHandler 
        ? 'onerror="this.style.display=\'none\'; this.parentElement.style.background=\'#f5f5f5\';"'
        : '';
    
    const starCount = Math.round(ratingValue);
    const starsHTML = Array(starCount).fill(0).map(() => 
        `<img src="${starImagePath}" alt="star" class="card-rating-star">`
    ).join('');
    
    return `
        <div class="card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <img src="${hotImagePath}" alt="HOT" class="card-hot-badge">
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${gameName}</h3>
                </div>
                <div class="card-footer">
                    <div class="card-stars">${starsHTML}</div>
                    <div class="card-download">${downloadDisplay}</div>
                </div>
            </div>
            <div class="card-box">
                <div class="card-media">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy" ${imageErrorHandler}>
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

function updateCategoryTitle(category) {
    const categoryTitleIcon = document.getElementById('categoryContentTitleIcon');
    const categoryTitleText = document.getElementById('categoryContentTitle');
    if (categoryTitleIcon && categoryTitleText) {
        const iconPath = getCategoryIcon(category === 'all' ? 'all' : category);
        categoryTitleIcon.src = `../public/images/${iconPath}`;
        categoryTitleIcon.alt = category === 'all' ? 'All' : getCategoryDisplayName(category);
        categoryTitleText.textContent = category === 'all' ? 'All' : getCategoryDisplayName(category);
    }
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
        updateCategoryTitle(category);
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
        .map(game => createGameCardHTML(game, detailPath, { includeImageErrorHandler: true }))
        .join('');
    

    const cards = gamesGrid.querySelectorAll('.card-box');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 50);
    });
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
                <img src="../public/images/all.svg" alt="All">
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
            updateCategoryTitle(category);
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
