

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, fillGameCardElement, getCategoryDisplayName, getCategoryPagePath } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
    HOMEPAGE_GAME_GRID: '#homepageGameGrid',
    CATEGORY_SECTION: '.category-section',
    ADS: '.ads',
    MAIN_CONTENT: '.main-content',
    SECTION_TITLE: '.section-title'
};


const CONFIG = {
    FEATURED_GAMES_COUNT: 4,
    CATEGORY_GAMES_COUNT: 4,
    SEARCH_DEBOUNCE_DELAY: 300
};


const TEXT = {
    SEARCH_RESULTS: 'Search Results',
    FEATURED_GAMES: 'Featured Games',
    NO_GAMES_FOUND: 'No games found',
    SEARCH_PLACEHOLDER: 'Try searching with different keywords',
    NO_GAMES_AVAILABLE: 'No games available in this category'
};


function shuffleArray(array) {
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


function getFeaturedSectionTitle() {
    const homepageGameGrid = getElement(DOM_SELECTORS.HOMEPAGE_GAME_GRID, 'Homepage game grid');
    if (!homepageGameGrid) return null;
    
    const featuredSection = homepageGameGrid.closest(DOM_SELECTORS.CATEGORY_SECTION);
    return featuredSection?.querySelector(DOM_SELECTORS.SECTION_TITLE);
}


function updatePageDisplayState(isSearchMode) {
    const homepageGameGrid = getElement(DOM_SELECTORS.HOMEPAGE_GAME_GRID, 'Homepage game grid');
    const sectionTitle = getFeaturedSectionTitle();
    
   
    if (sectionTitle) {
        sectionTitle.textContent = isSearchMode 
            ? TEXT.SEARCH_RESULTS 
            : TEXT.FEATURED_GAMES;
    }
    
   
    const allAds = document.querySelectorAll(DOM_SELECTORS.ADS);
    allAds.forEach(ad => {
        ad.style.display = isSearchMode ? 'none' : '';
    });
    
   
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    allSections.forEach(section => {
        if (isSearchMode && homepageGameGrid && !section.contains(homepageGameGrid)) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}


function displayEmptyResults(container, title, message) {
    container.innerHTML = `
        <div class="no-results">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}


function renderGamesToContainer(container, games) {
    if (!container) return;
    
    if (games.length === 0) {
        displayEmptyResults(container, TEXT.NO_GAMES_FOUND, TEXT.SEARCH_PLACEHOLDER);
        return;
    }
    
    container.innerHTML = games
        .map(game => createGameCardHTML(game))
        .join('');
}


function displaySearchResults(games) {
    updatePageDisplayState(true);
    
    const gameCardIds = ['homepage-game-1', 'homepage-game-2', 'homepage-game-3', 'homepage-game-4'];
    const homepageGameGrid = getElement(DOM_SELECTORS.HOMEPAGE_GAME_GRID, 'Homepage game grid');
    const secondGameGrid = document.querySelector('.game-grid:not(#homepageGameGrid)');
    
    if (games.length === 0) {
        if (homepageGameGrid) {
            displayEmptyResults(homepageGameGrid, TEXT.NO_GAMES_FOUND, TEXT.SEARCH_PLACEHOLDER);
        }
        gameCardIds.forEach(cardId => {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                cardElement.innerHTML = '';
                cardElement.onclick = null;
            }
        });
        if (secondGameGrid) {
            secondGameGrid.style.display = 'none';
        }
        return;
    }
    
    if (games.length <= 4) {
        gameCardIds.forEach((cardId, index) => {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                if (games[index]) {
                    fillGameCardElement(cardElement, games[index]);
                } else {
                    cardElement.innerHTML = '';
                    cardElement.onclick = null;
                }
            }
        });
        
        if (secondGameGrid) {
            secondGameGrid.style.display = games.length > 2 ? '' : 'none';
        }
    } else {
        gameCardIds.forEach(cardId => {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                cardElement.innerHTML = '';
                cardElement.onclick = null;
            }
        });
        
        if (homepageGameGrid) {
            homepageGameGrid.innerHTML = games
                .map(game => createGameCardHTML(game))
                .join('');
        }
        if (secondGameGrid) {
            secondGameGrid.style.display = 'none';
        }
    }
}


function generateHomepageGames(loadedGameDetails) {
    updatePageDisplayState(false);
    
    if (!isValidGameData(loadedGameDetails)) {
        return;
    }
    
    const shuffledGames = shuffleArray(loadedGameDetails);
    const selectedGames = shuffledGames.slice(0, CONFIG.FEATURED_GAMES_COUNT);
    
    const gameCardIds = ['homepage-game-1', 'homepage-game-2', 'homepage-game-3', 'homepage-game-4'];
    const secondGameGrid = document.querySelector('.game-grid:not(#homepageGameGrid)');
    
    gameCardIds.forEach((cardId, index) => {
        const cardElement = document.getElementById(cardId);
        if (cardElement && selectedGames[index]) {
            fillGameCardElement(cardElement, selectedGames[index]);
        }
    });
    
    if (secondGameGrid) {
        secondGameGrid.style.display = '';
    }
}


function createCategorySectionHTML(category) {
    const categoryName = getCategoryDisplayName(category);
    const categoryPagePath = getCategoryPagePath(category);
    const gridId = `${category}GamesGrid`;
    
    return `
        <div class="section-header">
            <h2 class="section-title">${categoryName} Games</h2>
            <div class="section-right">
                <a href="${categoryPagePath}" class="section-more">
                    <svg width="40" height="18" viewBox="0 0 40 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0 L10 9 L0 18" fill="none" stroke="#808080" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 0 L20 9 L10 18" fill="none" stroke="#808080" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
        <div class="game-grid" id="${gridId}">
            <!-- 游戏卡片将通过JavaScript动态生成 -->
        </div>
    `;
}


function getEmptyCategorySections() {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    return Array.from(allSections).filter(section => {
       
        return !section.querySelector(DOM_SELECTORS.HOMEPAGE_GAME_GRID) && 
               section.children.length === 0;
    });
}


function createCategorySection(referenceElement) {
    if (!referenceElement || !referenceElement.parentNode) {
        return null;
    }
    
    const newSection = document.createElement('section');
    newSection.className = 'category-section';
    referenceElement.parentNode.insertBefore(newSection, referenceElement.nextSibling);
    
    return newSection;
}


function ensureCategorySections(neededCount) {
    const emptySections = getEmptyCategorySections();
    const sectionsToCreate = neededCount - emptySections.length;
    
    if (sectionsToCreate > 0) {
        const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
        const lastSection = Array.from(allSections).pop();
        
        if (lastSection) {
            let currentReference = lastSection;
            for (let i = 0; i < sectionsToCreate; i++) {
                const newSection = createCategorySection(currentReference);
                if (newSection) {
                    currentReference = newSection;
                } else {
                    break;
                }
            }
        }
    }
    
    return getEmptyCategorySections();
}


function populateCategorySection(section, category, loadedGameDetails) {
   
    section.innerHTML = createCategorySectionHTML(category);
    section.setAttribute('data-category', category);
   
    const gridId = `${category}GamesGrid`;
    const grid = section.querySelector(`#${gridId}`);
    
    if (!grid) return;
    
   
    const categoryGames = loadedGameDetails.filter(game => game.category === category);
    const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, CONFIG.CATEGORY_GAMES_COUNT);
    
    if (shuffledCategoryGames.length > 0) {
        renderGamesToContainer(grid, shuffledCategoryGames);
    } else {
        displayEmptyResults(grid, TEXT.NO_GAMES_FOUND, TEXT.NO_GAMES_AVAILABLE);
    }
}


async function generateCategorySections(loadedGameDetails) {
    if (!isValidGameData(loadedGameDetails)) {
        return;
    }
    
    try {
        const categories = await getCategoryOrder();
        
        if (!Array.isArray(categories) || categories.length === 0) {
            return;
        }
        
       
        const availableSections = ensureCategorySections(categories.length);
        
       
        categories.forEach((category, index) => {
            if (index >= availableSections.length) return;
            
            const section = availableSections[index];
            populateCategorySection(section, category, loadedGameDetails);
        });
        
       
        for (let i = categories.length; i < availableSections.length; i++) {
            availableSections[i].style.display = 'none';
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


function initSearchFunctionality(searchInput, searchBtn, loadedGameDetails) {
    if (!searchInput) return;
    
   
    const performSearch = (rawSearchTerm) => {
        const searchTerm = normalizeSearchTerm(
            rawSearchTerm !== undefined ? rawSearchTerm : searchInput.value
        );
        
        if (searchTerm === '') {
            generateHomepageGames(loadedGameDetails);
        } else {
            const filteredGames = filterGames(loadedGameDetails, searchTerm);
            displaySearchResults(filteredGames);
        }
    };
    
   
    const debouncedSearch = debounce((rawSearchTerm) => {
        performSearch(rawSearchTerm);
    }, CONFIG.SEARCH_DEBOUNCE_DELAY);
    
   
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.focus();
            performSearch();
        });
    }
    
   
    searchInput.addEventListener('input', (e) => {
        const searchTerm = normalizeSearchTerm(e.target.value);
        
        if (searchTerm === '') {
            generateHomepageGames(loadedGameDetails);
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


async function initHomePage() {
   
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
    const searchBtn = getElement(DOM_SELECTORS.SEARCH_BTN, 'Search button');
    const homepageGameGrid = getElement(DOM_SELECTORS.HOMEPAGE_GAME_GRID, 'Homepage game grid');
    
   
    if (!searchInput || !homepageGameGrid) {
        console.error('Required DOM elements not found');
        return;
    }
    
    try {
       
        const loadedGameDetails = await loadGameData();
        
       
        if (!isValidGameData(loadedGameDetails)) {
            console.error('Game data not loaded or invalid');
            return;
        }
        
       
        initSearchFunctionality(searchInput, searchBtn, loadedGameDetails);
       
        generateHomepageGames(loadedGameDetails);
        await generateCategorySections(loadedGameDetails);
    } catch (error) {
        console.error('Failed to initialize home page:', error);
    }
}


document.addEventListener('DOMContentLoaded', initHomePage);


