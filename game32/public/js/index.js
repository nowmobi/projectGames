

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName,  getDetailPagePath, displayEmptyResults, getCategoryIcon, formatGameRating, formatDownloadsDisplay, shuffleArray } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_SECTION: '.category-section',
    CATEGORY_BUTTONS: '#categoryButtons',
    RANDOM_GAMES_SECTION: '.random-games-section',
    CATEGORY_BAR: '.category-bar',
    GAME_CARDS: '.game-card'
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

function isValidGameData(gameDetails) {
    return Array.isArray(gameDetails) && gameDetails.length > 0;
}


function getElement(selector, elementName) {
    const element = selector.startsWith('#') 
        ? document.getElementById(selector.slice(1))
        : document.querySelector(selector);
    if (!element) {
        console.warn(`${elementName || 'Element'} not found: ${selector}`);
    }
    return element;
}


async function generateCategorySections(loadedGameDetails, forceRegenerate = false) {
    if (!isValidGameData(loadedGameDetails)) {
        return;
    }
    
    try {
        const categories = await getCategoryOrder();
        if (!Array.isArray(categories) || categories.length === 0) {
            return;
        }
        
        
        const gameCards = document.querySelectorAll('.game-card');
        if (gameCards.length === 0) {
            console.warn('No game-card elements found');
            return;
        }
        
        
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
        console.error('Failed to generate category sections:', error);
    }
}


function filterGames(games, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return games.filter(game => {
        const name = (game?.name || '').toLowerCase();
        const description = (game?.description || '').toLowerCase();
        return name.includes(lowerSearchTerm) || description.includes(lowerSearchTerm);
    });
}


function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}


function normalizeSearchTerm(searchTerm) {
    return (searchTerm || '').toLowerCase().trim();
}


function displaySearchResults(games, searchTerm) {
    const mainContent = getElement('.main-content', 'Main content');
    
    if (games.length === 0) {
        const searchResultsGrid = document.getElementById('searchResultsGrid');
        if (searchResultsGrid) {
            searchResultsGrid.innerHTML = '';
            displayEmptyResults(searchResultsGrid, TEXT.NO_GAMES_FOUND, `No games found for "${searchTerm}". ${TEXT.SEARCH_PLACEHOLDER}`);
        } else {
            const searchResultsContainer = document.createElement('div');
            searchResultsContainer.id = 'searchResultsContainer';
            searchResultsContainer.innerHTML = `
                <div class="game-grid" id="searchResultsGrid"></div>
            `;
            
            if (mainContent) {
                mainContent.appendChild(searchResultsContainer);
                const gridContainer = searchResultsContainer.querySelector('.game-grid');
                if (gridContainer) {
                    displayEmptyResults(gridContainer, TEXT.NO_GAMES_FOUND, `No games found for "${searchTerm}". ${TEXT.SEARCH_PLACEHOLDER}`);
                }
            }
        }
        return;
    }
    
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    if (searchResultsGrid) {
        searchResultsGrid.innerHTML = games.map(game => createGameCardHTML(game)).join('');
    } else {
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.id = 'searchResultsContainer';
        searchResultsContainer.innerHTML = `
            <div class="game-grid" id="searchResultsGrid"></div>
        `;
        
        if (mainContent) {
            mainContent.appendChild(searchResultsContainer);
            const gridContainer = searchResultsContainer.querySelector('.game-grid');
            if (gridContainer) {
                gridContainer.innerHTML = games.map(game => createGameCardHTML(game)).join('');
            }
        }
    }
}

async function clearSearchResults() {
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    if (searchResultsContainer) {
        searchResultsContainer.remove();
    }
    
    if (savedGameDetails && isValidGameData(savedGameDetails)) {
        await generateCategorySections(savedGameDetails, true);
    }
}

function initSearchFunctionality(searchInput, searchBtn, loadedGameDetails) {
    if (!searchInput) return;
    const performSearch = (rawSearchTerm) => {
        const searchTerm = normalizeSearchTerm(
            rawSearchTerm !== undefined ? rawSearchTerm : searchInput.value
        );
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
        const searchTerm = normalizeSearchTerm(e.target.value);
        if (searchTerm === '') {
            clearSearchResults();
        } else {
            debouncedSearch(e.target.value);
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
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
            const hasContent = searchInput.value.trim() !== '';
            updateSearchIcon(hasContent);
        }
    }
    
    const randomGamesSection = getElement(DOM_SELECTORS.RANDOM_GAMES_SECTION, 'Random games section');
    if (randomGamesSection) {
        randomGamesSection.style.display = 'none';
    }
    
    const categoryBar = getElement(DOM_SELECTORS.CATEGORY_BAR, 'Category bar');
    if (categoryBar) {
        categoryBar.style.display = 'none';
    }
    
    const gameCards = document.querySelectorAll(DOM_SELECTORS.GAME_CARDS);
    gameCards.forEach(card => {
        card.style.display = 'none';
    });
}

async function closeSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    if (searchOverlay) {
        searchOverlay.classList.remove('active');
        const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
        if (searchInput) {
            searchInput.value = '';
        }
        updateSearchIcon(false);
        await clearSearchResults();
    }
    
    const randomGamesSection = getElement(DOM_SELECTORS.RANDOM_GAMES_SECTION, 'Random games section');
    if (randomGamesSection) {
        randomGamesSection.style.display = 'block';
    }
    
    const categoryBar = getElement(DOM_SELECTORS.CATEGORY_BAR, 'Category bar');
    if (categoryBar) {
        categoryBar.style.display = 'block';
    }
    
    const gameCards = document.querySelectorAll(DOM_SELECTORS.GAME_CARDS);
    gameCards.forEach(card => {
        card.style.display = 'flex';
    });
}

function createCategoryButtonHTML(category, displayName, isActive = false) {
    const iconPath = getCategoryIcon(category);
    const iconUrl = `public/images/${iconPath}`;
    return `
        <button class="category-btn ${isActive ? 'active' : ''}" data-category="${category}" type="button">
            <div class="category-btn-icon">
                <img src="${iconUrl}" alt="${displayName}" />
            </div>
            <span class="category-btn-text">${displayName}</span>
        </button>
    `;
}

async function generateCategoryButtons() {
    const categoryButtons = getElement(DOM_SELECTORS.CATEGORY_BUTTONS, 'Category buttons');
    if (!categoryButtons) return;
    try {
        const categories = await getCategoryOrder();
        if (!Array.isArray(categories) || categories.length === 0) {
            return;
        }
        const homeButton = createCategoryButtonHTML('home', 'Home', true);
        const categoryButtonsHTML = categories
            .map(category => {
                const displayName = getCategoryDisplayName(category);
                return createCategoryButtonHTML(category, displayName, false);
            })
            .join('');
        categoryButtons.innerHTML = homeButton + categoryButtonsHTML;
        initCategoryBarInteractions();
    } catch (error) {
        console.error('Failed to generate category buttons:', error);
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
    if (gameCards.length === 0) {
        console.warn('No game-card elements found');
        return;
    }
    
    
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
        console.warn(`No games found for category: ${category}`);
        if (gameCards.length > 0) {
            gameCards[0].outerHTML = `
                <div class="game-card">
                    <div class="no-results">
                        <h3>${TEXT.NO_GAMES_FOUND}</h3>
                        <p>${TEXT.NO_GAMES_AVAILABLE}</p>
                    </div>
                </div>
            `;
            for (let i = 1; i < gameCards.length; i++) {
                gameCards[i].outerHTML = '<div class="game-card"></div>';
            }
        }
    }
}

function initCategoryBarInteractions() {
    const categoryButtons = getElement(DOM_SELECTORS.CATEGORY_BUTTONS, 'Category buttons');
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

function updateSearchIcon(hasContent) {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    if (!searchIconBtn) return;
    
    if (hasContent) {
        searchIconBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        searchIconBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    }
}

function initSearchOverlay() {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
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

async function initHomePage() {
   
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
    const searchBtn = getElement(DOM_SELECTORS.SEARCH_BTN, 'Search button');
    
   
    if (!searchInput) {
        console.error('Required DOM elements not found');
        return;
    }
    
    try {
        const loadedGameDetails = await loadGameData();
        if (!isValidGameData(loadedGameDetails)) {
            console.error('Game data not loaded or invalid');
            return;
        }
       
        savedGameDetails = loadedGameDetails;
        initSearchOverlay();
        initSearchFunctionality(searchInput, searchBtn, loadedGameDetails);
        await generateCategoryButtons();
        await generateCategorySections(loadedGameDetails);
        await generateRandomGames(loadedGameDetails);
    } catch (error) {
        console.error('Failed to initialize home page:', error);
    }
}



async function generateRandomGames(loadedGameDetails) {
    const randomGamesContainer = document.getElementById('randomGamesContainer');
    if (!randomGamesContainer) return;
    
    try {
        if (!loadedGameDetails || loadedGameDetails.length === 0) {
            return;
        }
        
        const validGames = loadedGameDetails.filter(game => game && game.id && game.id !== '' && game.id !== null && game.id !== undefined);
        
        if (validGames.length === 0) {
            console.warn('No valid games found with id');
            return;
        }
        
        const shuffledGames = shuffleArray([...validGames]).slice(0, 6);
        
        const randomGamesHTML = shuffledGames.map(game => {
            if (!game || !game.id) {
                console.warn('Invalid game object:', game);
                return '';
            }
            
            const gameName = game.name || 'Unknown Game';
            const gameDescription = game.description || 'No description available';
            const gameImage = game.image || '';
            const detailPagePath = getDetailPagePath();
            return `
                <a href="${detailPagePath}?id=${game.id}" class="random-game-card">
                    <div class="random-game-content">
                        <h3 class="random-game-name">${gameName}</h3>
                        <p class="random-game-description">${gameDescription}</p>
                        <div class="random-game-button"></div>
                    </div>
                    <img src="${gameImage}" alt="${gameName}" class="random-game-image">
                </a>
            `;
        }).filter(html => html !== '').join('');
        randomGamesContainer.innerHTML = randomGamesHTML;
    } catch (error) {
        console.error('Failed to generate random games:', error);
    }
}

const pathname = window.location.pathname;
const isHomePage = pathname.includes('index.html') || 
                   pathname === '/' || 
                   pathname.endsWith('/');
if (isHomePage) {
   
    if (document.readyState === 'loading') {
       
        document.addEventListener('DOMContentLoaded', async () => {
            await initHomePage();
        });
    } else {
        initHomePage();
    }
}

