

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, createGameListItemHTML, getCategoryDisplayName, getCategoryPagePath, getDetailPagePath, displayEmptyResults } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_SECTION: '.category-section'
};


const CONFIG = {
    CATEGORY_GAMES_COUNT: 4,
    SEARCH_DEBOUNCE_DELAY: 300
};


const TEXT = {
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




function renderGamesToContainer(container, games, isListStyle = false) {
    if (!container) return;
    
    if (games.length === 0) {
        displayEmptyResults(container, TEXT.NO_GAMES_FOUND, TEXT.SEARCH_PLACEHOLDER);
        return;
    }
    
    if (isListStyle) {
        container.innerHTML = games
            .map(game => createGameListItemHTML(game))
            .join('');
    } else {
        container.innerHTML = games
            .map(game => createGameCardHTML(game))
            .join('');
    }
}




function createCategorySectionHTML(category, isListStyle = false) {
    const categoryName = getCategoryDisplayName(category);
    const categoryPagePath = getCategoryPagePath(category);
    const gridId = `${category}GamesGrid`;
    const containerClass = isListStyle ? 'game-list' : 'game-grid';
    
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
        <div class="${containerClass}" id="${gridId}">
            <!-- 游戏卡片将通过JavaScript动态生成 -->
        </div>
    `;
}


function getEmptyCategorySections() {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    return Array.from(allSections).filter(section => {
        return section.children.length === 0;
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


function populateCategorySection(section, category, loadedGameDetails, sectionIndex) {
    const isListStyle = (sectionIndex + 1) % 2 === 0;
    const gamesCount = 6;
    
    section.innerHTML = createCategorySectionHTML(category, isListStyle);
    section.setAttribute('data-category', category);
   
    const gridId = `${category}GamesGrid`;
    const grid = section.querySelector(`#${gridId}`);
    
    if (!grid) return;
    
    grid.classList.add('game-grid-three-columns');
    
   
    const categoryGames = loadedGameDetails.filter(game => game.category === category);
    const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, gamesCount);
    
    if (shuffledCategoryGames.length > 0) {
        renderGamesToContainer(grid, shuffledCategoryGames, isListStyle);
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
            populateCategorySection(section, category, loadedGameDetails, index);
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


function displaySearchResults(games, searchTerm) {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    const allAds = document.querySelectorAll('.ads');
    const carouselContainer = document.querySelector('.carousel-container');
    const popularGamesSection = document.querySelector('.popular-games-section');
    
    if (carouselContainer) {
        carouselContainer.style.display = 'none';
    }
    
    if (popularGamesSection) {
        popularGamesSection.style.display = 'none';
    }
    
    allAds.forEach(ad => {
        ad.style.display = 'none';
    });
    
    if (games.length === 0) {
        allSections.forEach(section => {
            section.style.display = 'none';
        });
        
        const firstSection = allSections[0];
        if (firstSection) {
            firstSection.style.display = 'block';
            firstSection.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">Search Results</h2>
                </div>
                <div class="game-grid game-grid-three-columns"></div>
            `;
            const gridContainer = firstSection.querySelector('.game-grid');
            if (gridContainer) {
                displayEmptyResults(gridContainer, TEXT.NO_GAMES_FOUND, `No games found for "${searchTerm}". ${TEXT.SEARCH_PLACEHOLDER}`);
            }
        }
        return;
    }
    
    allSections.forEach((section, index) => {
        if (index === 0) {
            section.style.display = 'block';
            section.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">Search Results (${games.length})</h2>
                </div>
                <div class="game-grid game-grid-three-columns">
                    ${games.map(game => createGameCardHTML(game)).join('')}
                </div>
            `;
        } else {
            section.style.display = 'none';
        }
    });
}

function clearSearchResults() {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    const allAds = document.querySelectorAll('.ads');
    const carouselContainer = document.querySelector('.carousel-container');
    const popularGamesSection = document.querySelector('.popular-games-section');
    
    if (carouselContainer) {
        carouselContainer.style.display = '';
    }
    
    if (popularGamesSection) {
        popularGamesSection.style.display = '';
    }
    
    allAds.forEach(ad => {
        ad.style.display = '';
    });
    
    allSections.forEach(section => {
        section.style.display = '';
    });
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


function getSearchIconSVG() {
    return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
}

function getCloseIconSVG() {
    return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
}

function toggleSearchIcon(isOpen) {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    if (searchIconBtn) {
        searchIconBtn.innerHTML = isOpen ? getCloseIconSVG() : getSearchIconSVG();
    }
}

function openSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        toggleSearchIcon(true);
        const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    if (searchOverlay) {
        searchOverlay.classList.remove('active');
        toggleSearchIcon(false);
        const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
        if (searchInput) {
            searchInput.value = '';
        }
        clearSearchResults();
    }
}

function initSearchOverlay() {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    
    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = searchOverlay?.classList.contains('active');
            if (isOpen) {
                closeSearchOverlay();
            } else {
                openSearchOverlay();
            }
        });
    }
    
    if (searchOverlay) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                closeSearchOverlay();
            }
        });
    }
}

function formatDownloadCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toLocaleString();
}

function createPopularGameCardHTML(game) {
    const detailPath = getDetailPagePath();
    const gameUrl = `${detailPath}?id=${game.id}`;
    const downloadCount = game.downloads || game.download || Math.floor(Math.random() * 1000000);
    return `
        <a href="${gameUrl}" class="popular-game-card">
            <div class="popular-game-top">
                <div class="popular-game-image">
                    <img src="${game.image}" alt="${game.name}">
                </div>
                <div class="popular-game-downloads">
                    ${formatDownloadCount(downloadCount)}
                </div>
            </div>
            <div class="popular-game-title">
                ${game.name}
            </div>
        </a>
    `;
}

function isValidGame(game) {
    return game && 
           game.id !== null && 
           game.id !== undefined && 
           game.id !== '' &&
           game.name && 
           game.name.trim() !== '' &&
           game.image && 
           game.image.trim() !== '';
}

function populatePopularGames(loadedGameDetails) {
    const popularGamesWrapper = document.getElementById('popularGamesWrapper');
    if (!popularGamesWrapper) {
        console.log('popularGamesWrapper not found');
        return;
    }
    
    const validGames = loadedGameDetails.filter(game => isValidGame(game));
    console.log('Valid games count:', validGames.length);
    
    let popularGames = shuffleArray(validGames).slice(0, 6);
    console.log('Popular games count:', popularGames.length);
    
    if (popularGames.length === 0) {
        popularGames = [
            { id: 1, name: 'Game 1', image: 'https://via.placeholder.com/154x84', category: 'puzzle' },
            { id: 2, name: 'Game 2', image: 'https://via.placeholder.com/154x84', category: 'action' },
            { id: 3, name: 'Game 3', image: 'https://via.placeholder.com/154x84', category: 'adventure' },
            { id: 4, name: 'Game 4', image: 'https://via.placeholder.com/154x84', category: 'racing' },
            { id: 5, name: 'Game 5', image: 'https://via.placeholder.com/154x84', category: 'sports' },
            { id: 6, name: 'Game 6', image: 'https://via.placeholder.com/154x84', category: 'kids' },
            { id: 7, name: 'Game 7', image: 'https://via.placeholder.com/154x84', category: 'girl' },
            { id: 8, name: 'Game 8', image: 'https://via.placeholder.com/154x84', category: 'puzzle' },
        ];
        console.log('Using fallback test data');
    }
    
    popularGamesWrapper.innerHTML = popularGames
        .map(game => createPopularGameCardHTML(game))
        .join('');
    
    const container = popularGamesWrapper.parentElement;
    console.log('Container element:', container);
    console.log('Container overflowX:', window.getComputedStyle(container).overflowX);
    console.log('Wrapper width:', popularGamesWrapper.offsetWidth);
    console.log('Container width:', container.offsetWidth);
    
    container.addEventListener('wheel', (e) => {
        console.log('Wheel event triggered, deltaX:', e.deltaX);
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            container.scrollLeft += e.deltaX;
        }
    });
    
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.style.cursor = 'grabbing';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    let touchStartX = 0;
    let touchStartScrollLeft = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartScrollLeft = container.scrollLeft;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        const touchCurrentX = e.touches[0].clientX;
        const diff = touchStartX - touchCurrentX;
        container.scrollLeft = touchStartScrollLeft + diff;
    }, { passive: true });
    
    container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            container.scrollLeft += e.deltaX;
        }
    });
    
    container.style.cursor = 'grab';
}

async function initHomePage() {
    console.log('initHomePage called');
   
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
    const searchBtn = getElement(DOM_SELECTORS.SEARCH_BTN, 'Search button');
    console.log('Search input:', searchInput);
    
   
    if (!searchInput) {
        console.error('Required DOM elements not found');
        return;
    }
    
    try {
        console.log('Loading game data...');
        const loadedGameDetails = await loadGameData();
        console.log('Loaded game data count:', loadedGameDetails.length);
        
       
        if (!isValidGameData(loadedGameDetails)) {
            console.error('Game data not loaded or invalid');
            return;
        }
        
        console.log('Initializing search overlay...');
        initSearchOverlay();
        console.log('Initializing search functionality...');
        initSearchFunctionality(searchInput, searchBtn, loadedGameDetails);
       
        console.log('Populating popular games...');
        populatePopularGames(loadedGameDetails);
        console.log('Generating category sections...');
        await generateCategorySections(loadedGameDetails);
        console.log('Home page initialization complete');
    } catch (error) {
        console.error('Failed to initialize home page:', error);
    }
}




document.addEventListener('DOMContentLoaded', initHomePage);


