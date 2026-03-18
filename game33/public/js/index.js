import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName, getDetailPagePath, displayEmptyResults, getCategoryIcon, formatGameRating, shuffleArray } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_BUTTONS: '#categoryButtons'
};

const CONFIG = {
    SEARCH_DEBOUNCE_DELAY: 300
};

const TEXT = {
    NO_GAMES_FOUND: 'No games found',
    SEARCH_PLACEHOLDER: 'Try searching with different keywords',
    NO_GAMES_AVAILABLE: 'No games available in this category'
};

let savedGameDetails = null;
const isValidGameData = (gameDetails) => Array.isArray(gameDetails) && gameDetails.length > 0;
const getElement = (selector) => selector.startsWith('#')
    ? document.getElementById(selector.slice(1))
    : document.querySelector(selector);

async function generateCategorySections(loadedGameDetails, forceRegenerate = false) {
    if (!isValidGameData(loadedGameDetails)) return;

    try {
        const categories = await getCategoryOrder();
        if (!Array.isArray(categories) || categories.length === 0) return;

        const gameCards = document.querySelectorAll('.game-card');
        if (gameCards.length === 0) return;

        let cardIndex = 0;
        categories.forEach(category => {
            const categoryGames = loadedGameDetails.filter(game => game.category === category);
            const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, 4);
            shuffledCategoryGames.forEach(game => {
                if (cardIndex < gameCards.length) {
                    gameCards[cardIndex].style.display = '';
                    const gameCardHTML = createGameCardHTML(game);
                    gameCards[cardIndex].outerHTML = gameCardHTML;
                    cardIndex++;
                }
            });
        });

        if (cardIndex < gameCards.length) {
            const allGames = loadedGameDetails.flat();
            const shuffledGames = shuffleArray(allGames);
            shuffledGames.forEach(game => {
                if (cardIndex < gameCards.length) {
                    gameCards[cardIndex].style.display = '';
                    const gameCardHTML = createGameCardHTML(game);
                    gameCards[cardIndex].outerHTML = gameCardHTML;
                    cardIndex++;
                }
            });
        }

        for (let i = cardIndex; i < gameCards.length; i++) {
            gameCards[i].style.display = 'none';
        }
    } catch (error) {
        // Ignore error
    }
}

function filterGames(games, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return lowerSearchTerm && lowerSearchTerm.trim() !== '' ?
        games.filter(game => {
            if (!game || typeof game !== 'object') return false;
            const fieldsToSearch = ['name', 'title', 'label', 'description', 'category'];
            let hasMatch = false;
            fieldsToSearch.forEach(field => {
                const value = game[field];
                if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) {
                    hasMatch = true;
                }
            });
            return hasMatch;
        }) :
        games;
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

const normalizeSearchTerm = (searchTerm) => (searchTerm || '').toLowerCase().trim();

function displaySearchResults(games, searchTerm) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    let resultsContainer = document.getElementById('searchResultsContainer');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResultsContainer';
        resultsContainer.className = 'search-results-container';
        resultsContainer.style.display = 'block';
        resultsContainer.style.margin = '20px 0';
        mainContent.insertBefore(resultsContainer, mainContent.firstChild);
    }

    resultsContainer.style.display = 'block';

    if (games.length === 0) {
        displayEmptyResults(resultsContainer, TEXT.NO_GAMES_FOUND, `No games found for "${searchTerm}". ${TEXT.SEARCH_PLACEHOLDER}`);
        return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.className = 'game-grid';
    gridContainer.id = 'searchResultsGrid';
    gridContainer.innerHTML = games.map(game => createGameCardHTML(game)).join('');
    resultsContainer.innerHTML = gridContainer.outerHTML;
}

async function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    if (savedGameDetails && isValidGameData(savedGameDetails)) {
        await generateCategorySections(savedGameDetails, true);
    }
}

function initSearchFunctionality(searchInput, searchBtn, loadedGameDetails) {
    if (!searchInput) return;

    const performSearch = (rawSearchTerm) => {
        const searchTerm = normalizeSearchTerm(rawSearchTerm !== undefined ? rawSearchTerm : searchInput.value);
        if (searchTerm === '') {
            clearSearchResults();
            return;
        }
        const filteredGames = filterGames(loadedGameDetails, searchTerm);
        displaySearchResults(filteredGames, searchTerm);
    };

    const debouncedSearch = debounce((rawSearchTerm) => {
        performSearch(rawSearchTerm);
    }, CONFIG.SEARCH_DEBOUNCE_DELAY);

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            searchInput.focus();
            performSearch();
        });
    }

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        const searchTerm = normalizeSearchTerm(value);
        if (searchTerm === '') {
            clearSearchResults();
        } else {
            debouncedSearch(value);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

function openSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY);
    if (!searchOverlay) return;

    searchOverlay.classList.add('active');
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT);
    if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
        const hasContent = searchInput.value.trim() !== '';
        updateSearchIcon(hasContent);
    }

    const randomGamesSection = document.querySelector('.random-games-section');
    if (randomGamesSection) randomGamesSection.style.display = 'none';

    const categoryBar = document.querySelector('.category-bar');
    if (categoryBar) categoryBar.style.display = 'none';
}

async function closeSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY);
    if (!searchOverlay) return;

    searchOverlay.classList.remove('active');
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT);
    if (searchInput) searchInput.value = '';
    updateSearchIcon(false);
    await clearSearchResults();

    const randomGamesSection = document.querySelector('.random-games-section');
    if (randomGamesSection) randomGamesSection.style.display = 'block';

    const categoryBar = document.querySelector('.category-bar');
    if (categoryBar) categoryBar.style.display = 'block';
}

function updateSearchIcon(hasContent) {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN);
    if (!searchIconBtn) return;

    searchIconBtn.innerHTML = hasContent
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<img src="./public/images/search.svg" alt="Search" width="24" height="24">`;
}

function initSearchOverlay() {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN);
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY);
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT);

    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT);
            const hasContent = searchInput && searchInput.value.trim() !== '';

            if (hasContent) {
                await closeSearchOverlay();
                updateSearchIcon(false);
            } else {
                const isOpen = searchOverlay?.classList.contains('active');
                if (isOpen) {
                    await closeSearchOverlay();
                } else {
                    openSearchOverlay();
                }
            }
        });
    }

    if (searchOverlay) {
        document.addEventListener('keydown', async (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                await closeSearchOverlay();
                updateSearchIcon(false);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const hasContent = e.target.value.trim() !== '';
            updateSearchIcon(hasContent);
        });
    }
}

function createCategoryButtonHTML(category, displayName, isActive = false) {
    const iconPath = getCategoryIcon(category);
    const iconUrl = `public/images/${iconPath}`;
    return `<button class="category-btn ${isActive ? 'active' : ''}" data-category="${category}" type="button"><div class="category-btn-icon"><img src="${iconUrl}" alt="${displayName}" /></div><span class="category-btn-text">${displayName}</span></button>`;
}

async function generateCategoryButtons() {
    const categoryButtons = getElement(DOM_SELECTORS.CATEGORY_BUTTONS);
    if (!categoryButtons) return;

    try {
        const categories = await getCategoryOrder();
        if (!Array.isArray(categories) || categories.length === 0) return;

        const homeButton = createCategoryButtonHTML('home', 'Home', true);
        const categoryButtonsHTML = categories
            .map(category => createCategoryButtonHTML(category, getCategoryDisplayName(category), false))
            .join('');
        categoryButtons.innerHTML = homeButton + categoryButtonsHTML;
        initCategoryBarInteractions();
    } catch (error) {
        // Ignore error
    }
}

function handleCategoryButtonClick(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });



    if (category === 'home') {
        if (savedGameDetails) {
            generateCategorySections(savedGameDetails, true);
        }
    } else {
        showCategoryContentInCards(category);
    }
}

function showCategoryContentInCards(category) {
    if (!savedGameDetails) return;
    const gameCards = document.querySelectorAll('.game-card');
    if (gameCards.length === 0) return;

    const categoryGames = savedGameDetails.filter(game => game.category === category);

    if (categoryGames.length > 0) {
        categoryGames.forEach((game, index) => {
            if (index < gameCards.length) {
                const gameCardHTML = createGameCardHTML(game);
                gameCards[index].outerHTML = gameCardHTML;
            }
        });

        for (let i = categoryGames.length; i < gameCards.length; i++) {
            gameCards[i].style.display = 'none';
        }
    } else {
        if (gameCards.length > 0) {
            gameCards[0].outerHTML = `<div class="game-card"><div class="no-results"><h3>${TEXT.NO_GAMES_FOUND}</h3><p>${TEXT.NO_GAMES_AVAILABLE}</p></div></div>`;
            for (let i = 1; i < gameCards.length; i++) {
                gameCards[i].outerHTML = '<div class="game-card"></div>';
            }
        }
    }
}

function initCategoryBarInteractions() {
    const categoryButtons = getElement(DOM_SELECTORS.CATEGORY_BUTTONS);
    if (!categoryButtons) return;

    categoryButtons.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        const category = button.dataset.category;
        if (category) {
            handleCategoryButtonClick(category);
        }
    });
}

async function initHomePage() {
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT);
    const searchBtn = getElement(DOM_SELECTORS.SEARCH_BTN);

    if (!searchInput) return;

    try {
        const loadedGameDetails = await loadGameData();
        if (!isValidGameData(loadedGameDetails)) return;

        savedGameDetails = loadedGameDetails;
        initSearchOverlay();
        initSearchFunctionality(searchInput, searchBtn, loadedGameDetails);
        await generateCategoryButtons();
        await generateCategorySections(loadedGameDetails);
        await generateRandomGames(loadedGameDetails);
        await generateFeaturedGames(loadedGameDetails);
    } catch (error) {
        // Ignore error
    }
}

async function generateRandomGames(loadedGameDetails) {
    const randomGamesContainer = document.getElementById('randomGamesContainer');
    if (!randomGamesContainer) return;

    try {
        if (!loadedGameDetails || loadedGameDetails.length === 0) return;

        const validGames = loadedGameDetails.filter(game => game && game.id && game.id !== '' && game.id !== null && game.id !== undefined);
        if (validGames.length === 0) return;

        const shuffledGames = shuffleArray([...validGames]).slice(0, 6);
        const randomGamesHTML = shuffledGames.map(game => {
            if (!game || !game.id) return '';
            const randomColorIndex = Math.floor(Math.random() * 6) + 1;
            const colorClass = `color-${randomColorIndex}`;
            const gameName = game.name || 'Unknown Game';
            const gameImage = game.image || '';
            const gameCategory = game.category || 'Unknown Category';
            const detailPagePath = getDetailPagePath();
            return `<a href="${detailPagePath}?id=${game.id}" class="random-game-card ${colorClass}"><div class="random-game-content"><h3 class="random-game-name">${gameName}</h3><img src="${gameImage}" alt="${gameName}" class="random-game-image"><span class="random-game-category">${gameCategory}</span></div></a>`;
        }).filter(html => html !== '').join('');
        randomGamesContainer.innerHTML = randomGamesHTML;
    } catch (error) {
        // Ignore error
    }
}

async function generateFeaturedGames(loadedGameDetails) {
    const featuredGamesContainer = document.getElementById('featuredGamesContainer');
    if (!featuredGamesContainer) return;

    try {
        if (!loadedGameDetails || loadedGameDetails.length === 0) return;

        const validGames = loadedGameDetails.filter(game => game && game.id && game.id !== '' && game.id !== null && game.id !== undefined);
        if (validGames.length === 0) return;

        const shuffledGames = shuffleArray([...validGames]).slice(0, 6);
        const featuredGamesHTML = shuffledGames.map(game => {
            if (!game || !game.id) return '';
            const gameName = game.name || 'Unknown Game';
            const gameImage = game.image || '';
            const ratingValue = formatGameRating(game.rating);
            const starCount = Math.round(ratingValue);
            const starsHTML = '<img src="./public/images/star.svg" alt="Star" width="12" height="12">'.repeat(starCount);
            const detailPagePath = getDetailPagePath();
            return `<div class="featured-game-card" onclick="window.location.href='${detailPagePath}?id=${game.id}'"><img src="${gameImage}" alt="${gameName}" class="featured-game-image"><h3 class="featured-game-name">${gameName}</h3><div class="featured-game-rating">${starsHTML}</div></div>`;
        }).filter(html => html !== '').join('');
        featuredGamesContainer.innerHTML = featuredGamesHTML;
    } catch (error) {
        // Ignore error
    }
}

const pathname = window.location.pathname;
const isHomePage = pathname.includes('index.html') || pathname === '/' || pathname.endsWith('/');
if (isHomePage) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await initHomePage();
        });
    } else {
        initHomePage();
    }
}