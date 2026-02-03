import { loadGameData, gameDetails, getCategoryOrder, getUrlParameter } from './BaseURL.js';




export async function getGameDetails() {
    await loadGameData();
    return gameDetails || [];
}


export async function getCategoryInfo() {
    return await getCategoryOrder();
}


export function parseDownloads(downloadsStr) {
    if (typeof downloadsStr === 'string') {
        if (downloadsStr.includes('K')) {
            return parseFloat(downloadsStr.replace('K', '')) * 1000;
        } else if (downloadsStr.includes('M')) {
            return parseFloat(downloadsStr.replace('M', '')) * 1000000;
        }
        return parseFloat(downloadsStr) || 0;
    }
    return 0;
}


export const DEFAULT_CATEGORIES = ['girl', 'kids', 'sports', 'racing', 'adventure', 'action', 'puzzle'];


export const CATEGORY_NAME_MAP = {
    'home': 'Home',
    'girl': 'Girls',
    'kids': 'Kids',
    'sports': 'Sports',
    'racing': 'Racing',
    'adventure': 'Adventure',
    'action': 'Action',
    'puzzle': 'Puzzle'
};


export const HOMEPAGE_CATEGORY_NAME_MAP = {
    'girl': 'Girls Games',
    'kids': 'Kids Games',
    'sports': 'Sports Games',
    'racing': 'Racing Games',
    'adventure': 'Adventure Games',
    'action': 'Action Games',
    'puzzle': 'Puzzle Games'
};


export function getCategoryDisplayName(category, isHomepage = false) {
    const nameMap = isHomepage ? HOMEPAGE_CATEGORY_NAME_MAP : CATEGORY_NAME_MAP;
    return nameMap[category] || category.charAt(0).toUpperCase() + category.slice(1) + (isHomepage ? ' Games' : '');
}


export function calculateCategoryCounts(gameDetails) {
    const counts = {};
    gameDetails.forEach(game => {
        if (game && game.category) {
            counts[game.category] = (counts[game.category] || 0) + 1;
        }
    });
    return counts;
}


export function isInPagesDirectory() {
    return window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
}


export function buildUrlWithChannel(url, channel) {
    if (!channel) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}channel=${channel}`;
}


export function getDetailPagePath() {
    return isInPagesDirectory() ? '../detail.html' : 'detail.html';
}


export function getIndexPath() {
    return isInPagesDirectory() ? '../index.html' : 'index.html';
}


export function getCategoryPagePath() {
    return isInPagesDirectory() ? 'category.html' : 'pages/category.html';
}


export function generateStarsHTML(rating) {
    const numRating = parseInt(rating) || 5;
    const filledStars = Math.min(5, Math.max(0, numRating));
    const emptyStars = 5 - filledStars;
    
    let starsHTML = '';
    for (let i = 0; i < filledStars; i++) {
        starsHTML += '<span class="star filled">★</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty">★</span>';
    }
    return starsHTML;
}


const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('channel')) {
  window.channel = urlParams.get('channel');
}

if (window.channel) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.href && !link.href.includes('channel=')) {
            const url = new URL(link.href);
            url.searchParams.set('channel', window.channel);
            link.href = url.toString();
        }
    });
}


const searchToggle = document.getElementById('searchToggle');
const searchContainer = document.getElementById('searchContainer');
const searchBack = document.getElementById('searchBack');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const menuToggle = document.getElementById('menuToggle');
const categoriesMenu = document.getElementById('categoriesMenu');
const closeCategories = document.getElementById('closeCategories');
const categoriesContainer = document.getElementById('categoriesContainer');
const gamesGrid = document.getElementById('gamesGrid');
const isCategoryPage = document.body?.classList.contains('category-page-body');


const isInPagesDir = isInPagesDirectory();
const detailPagePath = getDetailPagePath();

function initSearchFeatures() {
    if (!searchToggle || !searchContainer || !searchBack || !searchInput || !searchResults) {
        console.warn('Search elements not found:', {
            searchToggle: !!searchToggle,
            searchContainer: !!searchContainer,
            searchBack: !!searchBack,
            searchInput: !!searchInput,
            searchResults: !!searchResults
        });
        return;
    }

    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        searchContainer.classList.add('active');
        searchInput.focus();
    });

    searchBack.addEventListener('click', (e) => {
        e.preventDefault();
        hideSearch();
    });

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            await performSearch(query);
            searchResults.classList.add('active');
        } else {
            searchResults.classList.remove('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
            hideSearch();
        }
    });
}

function hideSearch() {
    searchContainer?.classList.remove('active');
    searchResults?.classList.remove('active');
    if (searchInput) {
        searchInput.value = '';
    }
}

async function performSearch(query) {
    try {
        const details = await getGameDetails();
        if (!details || details.length === 0) {
            console.warn('No game data available for search');
            displaySearchResults([]);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = details.filter((game) => {
            if (!game) return false;
            const name = game.name ? game.name.toLowerCase() : '';
            const description = game.description ? game.description.toLowerCase() : '';
            const category = game.category ? game.category.toLowerCase() : '';
            
            return name.includes(lowerQuery) || 
                   description.includes(lowerQuery) || 
                   category.includes(lowerQuery);
        });

        displaySearchResults(results);
    } catch (error) {
        displaySearchResults([]);
    }
}

function displaySearchResults(results) {
    if (!searchResults) {
        return;
    }

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results"><h3>No results found</h3><p>Please try different search terms</p></div>';
        return;
    }

    if (isCategoryPage) {
        const resultsHTML = results.slice(0, 6).map((game) => {
            const rating = game.rating || 5;
            const stars = generateStarsHTML(rating);
            return `
            <a href="${buildUrlWithChannel(`${detailPagePath}?id=${game.id}`, window.channel)}" class="game-card">
                <div class="game-image-container">
                    <img src="${game.image}" alt="${game.name}">
                </div>
                <div class="game-card-content">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-number">${rating}</span>
                    </div>
                    <div class="game-tags">
                        <span class="tag">${game.category}</span>
                    </div>
                    <div class="game-play-count">downloads: ${game.downloads}</div>
                    <button class="play-button">PLAY</button>
                </div>
            </a>
        `;
        }).join('');

        searchResults.innerHTML = `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">${resultsHTML}</div>`;
        return;
    }

   
    const resultsHTML = results.slice(0, 6).map((game) => {
        const rating = game.rating || 5;
        const stars = generateStarsHTML(rating);
        return `
        <a href="${buildUrlWithChannel(`${detailPagePath}?id=${game.id}`, window.channel)}" class="homepage-game-card">
            <div class="game-image-container">
                <img src="${game.image}" alt="${game.name}">
            </div>
            <div class="homepage-game-card-content">
                <h3 class="homepage-game-title">${game.name}</h3>
                <div class="game-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-number">${rating}</span>
                </div>
                <div class="game-tags">
                    <span class="tag">${game.category}</span>
                </div>
                <div class="game-play-count">downloads: ${game.downloads}</div>
                <button class="homepage-play-button">PLAY</button>
            </div>
        </a>
    `;
    }).join('');

    searchResults.innerHTML = `<div class="homepage-game-grid">${resultsHTML}</div>`;
}


async function generateCategoriesMenu() {
    if (!categoriesContainer) {
        return;
    }

   
    const categoryInfo = await getCategoryInfo();
    const gameDetails = await getGameDetails();
    
   
    const categoryCounts = calculateCategoryCounts(gameDetails);
    
   
    const totalGames = gameDetails.length;
    
   
    const indexPath = getIndexPath();
    const categoryPath = getCategoryPagePath();
    
   
    let categoriesHTML = '';
    
   
    categoriesHTML += `
        <div class="category-item active" data-category="home">
            <span class="category-name">Home</span>
            <span class="category-count">${totalGames}</span>
        </div>
    `;
    
   
    const categories = categoryInfo || DEFAULT_CATEGORIES;
    
    categories.forEach(category => {
        const count = categoryCounts[category] || 0;
        const name = getCategoryDisplayName(category, false);
        
        categoriesHTML += `
            <div class="category-item" data-category="${category}">
                <span class="category-name">${name}</span>
                <span class="category-count">${count}</span>
            </div>
        `;
    });
    
    categoriesContainer.innerHTML = categoriesHTML;
    
   
    const categoryItems = categoriesContainer.querySelectorAll('.category-item');
    categoryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            if (category !== 'home') {
                window.location.href = buildUrlWithChannel(`${categoryPath}?category=${category}`, window.channel);
            } else {
                window.location.href = buildUrlWithChannel(indexPath, window.channel);
            }
            categoriesMenu.classList.remove('active');
        });
    });
}

function initMenuHandlers() {
    if (!menuToggle || !categoriesMenu || !closeCategories) {
        return;
    }

    menuToggle.addEventListener('click', () => {
        categoriesMenu.classList.add('active');
    });

    closeCategories.addEventListener('click', () => {
        categoriesMenu.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (!categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            categoriesMenu.classList.remove('active');
        }
    });
}

async function initCategoryPage() {
    if (!gamesGrid || !isCategoryPage) {
        return;
    }

    await loadCategoryPage();
}

async function loadCategoryPage() {
    const category = getUrlParameter('category');

    if (!category) {
        window.location.href = buildUrlWithChannel(getIndexPath(), window.channel);
        return;
    }

    await generateGamesList(category);
}

async function generateGamesList(category) {
    const details = await getGameDetails();
    const games = details
        .filter((game) => game && game.category === category)
        .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));

    displayGames(games);
}

function displayGames(games) {
    if (!gamesGrid) {
        return;
    }

    if (games.length === 0) {
        gamesGrid.innerHTML = '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
        return;
    }

    const gamesHTML = games.map((game) => {
        const rating = game.rating || 5;
        const stars = generateStarsHTML(rating);
        return `
        <a href="${buildUrlWithChannel(`${detailPagePath}?id=${game.id}`, window.channel)}" class="game-card">
            <div class="game-image-container">
                <img src="${game.image}" alt="${game.name}" onerror="console.log('Image failed to load:', this.src)">
            </div>
            <div class="game-card-content">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-number">${rating}</span>
                </div>
                <div class="game-tags">
                    <span class="tag">${game.category}</span>
                </div>
                <div class="game-play-count">downloads: ${game.downloads}</div>
                <button class="play-button">PLAY</button>
            </div>
        </a>
    `;
    }).join('');

    gamesGrid.innerHTML = gamesHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    initSearchFeatures();
    initMenuHandlers();
    await generateCategoriesMenu();
    await initCategoryPage();
});
