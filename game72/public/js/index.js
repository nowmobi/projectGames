

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName, getCategoryPagePath, displayEmptyResults, getCategoryIcon, shuffleArray, getDetailPagePath, formatDownloadsDisplay, formatGameRating, createDetailCardHTML } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_SECTION: '.category-section',
    RANDOM_RECOMMENDATIONS: '#random-game-recommendations'
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





function createCategorySectionHTML(category) {
    const gridId = `${category}GamesGrid`;
    const displayName = getCategoryDisplayName(category);
    const categoryIcon = getCategoryIcon(category);
    const categoryPagePath = getCategoryPagePath(category);
    
    return `
        <div class="category-section-header">
            <a href="${categoryPagePath}" class="category-section-title">
                <img src="public/images/${categoryIcon}" alt="${displayName}" class="category-section-icon">
                <span>${displayName}</span>
            </a>
        </div>
        <div class="card-grid" id="${gridId}">

        </div>
    `;
}


function createCategorySection(referenceElement) {
    if (!referenceElement || !referenceElement.parentNode) {
        return null;
    }
    
    const adsDiv = document.createElement('div');
    adsDiv.className = 'ads';
    adsDiv.innerHTML = '<div></div>';
    
    const newSection = document.createElement('section');
    newSection.className = 'category-section';
    
    referenceElement.parentNode.insertBefore(adsDiv, referenceElement.nextSibling);
    adsDiv.parentNode.insertBefore(newSection, adsDiv.nextSibling);
    
    return newSection;
}


function ensureCategorySections(neededCount) {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    const currentCount = allSections.length;
    
    if (currentCount < neededCount) {
        const sectionsToCreate = neededCount - currentCount;
        const allElements = document.querySelectorAll('.ads, .category-section');
        const lastElement = Array.from(allElements).pop();
        
        if (lastElement) {
            let currentReference = lastElement;
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
    
    return Array.from(document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION));
}


function populateCategorySection(section, category, loadedGameDetails, gameCountOverride = null, sectionIndex = 0) {
    section.innerHTML = createCategorySectionHTML(category);
    section.setAttribute('data-category', category);
   
    const gridId = `${category}GamesGrid`;
    const grid = section.querySelector(`#${gridId}`);
    
    if (!grid) {
        console.error(`Grid not found for category: ${category}, gridId: ${gridId}`);
        return;
    }
    
    const categoryGames = loadedGameDetails.filter(game => game.category === category);
    const gameCount = gameCountOverride !== null ? gameCountOverride : (section.classList.contains('category-section-list') ? 8 : 4);
    const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, gameCount);
    const includeFooter = !section.classList.contains('category-section-list');
    // 第1、3、5、7个section（奇数索引）不包含hot badge，其他包含
    const includeHotBadge = sectionIndex % 2 !== 0;
    
    if (shuffledCategoryGames.length > 0) {
        const isImageOnlySection = sectionIndex % 2 === 0;
        const isDetailSection = sectionIndex % 2 === 1;
       
        const gamesHTML = shuffledCategoryGames.map((game, gameIndex) => {
            // 偶数索引section：使用详情布局
            if (isDetailSection) {
                return createDetailCardHTML(game);
            }
            
            const cardHTML = createGameCardHTML(game, null, { includeFooter, includeHotBadge });
            
            // 奇数索引section：所有游戏只显示图片
            if (isImageOnlySection) {
                return cardHTML.replace('<div class="card"', '<div class="card card-image-only"');
            }
            
            // 为第1、3个分类部分的卡片添加特定类
            if (gameIndex % 2 === 0) {
                // 第1、3个卡片：名称在上，图片在下
                return cardHTML.replace('<div class="card"', '<div class="card card-name-top"');
            } else {
                // 第2、4个卡片：图片在上，名称在下
                return cardHTML.replace('<div class="card"', '<div class="card card-image-top"');
            }
        }).join('');
        grid.innerHTML = gamesHTML;
    } else {
        console.warn(`No games found for category: ${category}`);
        displayEmptyResults(grid, TEXT.NO_GAMES_FOUND, TEXT.NO_GAMES_AVAILABLE);
    }
}


function createRandomGameHTML(game, rank) {
    if (!game || !game.id) {
        return '';
    }
    
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const finalDetailPath = getDetailPagePath();
    const starCount = Math.round(formatGameRating(game.rating));
    const downloadDisplay = formatDownloadsDisplay(game.downloads);
    
    // 循序渐进的背景色：从深红渐变到浅红
    const rankColors = [
        '#B71C1C', // 1 - 最深红
        '#D32F2F', // 2
        '#E53935', // 3
        '#EF5350', // 4
        '#FFCDD2'  // 5 - 最浅红
    ];
    const rankColor = rankColors[rank - 1] || rankColors[rankColors.length - 1];
    const isLight = rank >= 5; // 浅色背景用深色文字
    
    return `
        <div class="rank-game-item" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="rank-number" style="background: ${rankColor}; ${isLight ? 'color: #B71C1C;' : ''}">${rank}</div>
            <div class="rank-game-image">
                <img src="${gameImage}" alt="${gameName}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='#f5f5f5';">
            </div>
            <div class="rank-game-info">
                <div class="rank-game-name">${gameName}</div>
                <div class="rank-game-meta">
                    <span class="rank-rating">
                        ${'★'.repeat(starCount)}${'☆'.repeat(5 - starCount)}
                    </span>
                    <span class="rank-downloads">${downloadDisplay}</span>
                </div>
            </div>
            <div class="rank-play-btn">
                <img src="public/images/play.svg" alt="play" class="rank-play-icon">
            </div>
        </div>
    `;
}

async function generateRandomRecommendations(loadedGameDetails) {
    if (!isValidGameData(loadedGameDetails)) {
        console.warn('No game data available for recommendations');
        return;
    }
    
    try {
        const randomRecommendationsContainer = getElement(DOM_SELECTORS.RANDOM_RECOMMENDATIONS, 'Random recommendations container');
        
        if (!randomRecommendationsContainer) {
            return;
        }
        
        const shuffledGames = shuffleArray(loadedGameDetails);
        const validGames = shuffledGames.filter(game => game && game.id);
        const top5Games = validGames.slice(0, 5);
        
        console.log(`Loaded ${loadedGameDetails.length} games, ${validGames.length} valid, displaying ${top5Games.length}`);
        
        const gamesHTML = top5Games.map((game, index) => 
            createRandomGameHTML(game, index + 1)
        ).join('');
        
        randomRecommendationsContainer.innerHTML = `
            <div class="rank-games-container">
                <div class="rank-games-hot-badge">Hot Games</div>
                ${gamesHTML}
            </div>
        `;
    } catch (error) {
        console.error('Failed to generate random recommendations:', error);
    }
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
        
        let availableSections;
        if (forceRegenerate) {
           
            ensureCategorySections(categories.length);
            const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
            availableSections = Array.from(allSections).slice(0, categories.length);
        } else {
           
            availableSections = ensureCategorySections(categories.length);
        }
        
       
        categories.forEach((category, index) => {
            if (index >= availableSections.length) return;
            
            const section = availableSections[index];
            
            if (index % 2 === 0) {
                section.classList.add('category-section-list');
            } else {
                section.classList.remove('category-section-list');
            }
            
            // 奇数索引分类展示5个内容，偶数索引分类展示3个详情游戏
            const gameCountOverride = index % 2 === 0 ? 5 : 3;
            populateCategorySection(section, category, loadedGameDetails, gameCountOverride, index);
        });
        
       
        const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
        for (let i = 0; i < categories.length && i < allSections.length; i++) {
            allSections[i].style.display = '';
        }
        
       
        for (let i = categories.length; i < allSections.length; i++) {
            allSections[i].style.display = 'none';
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
                <div class="card-grid" id="searchResultsGrid"></div>
            `;
            const gridContainer = firstSection.querySelector('.card-grid');
            if (gridContainer) {
                displayEmptyResults(gridContainer, TEXT.NO_GAMES_FOUND, `No games found for "${searchTerm}". ${TEXT.SEARCH_PLACEHOLDER}`);
            }
        }
        return;
    }
    
    allSections.forEach((section, index) => {
        if (index === 0) {
            section.style.display = 'block';
           
            const container = document.createElement('div');
            container.className = 'card-grid';
            container.id = 'searchResultsGrid';
            section.innerHTML = '';
            section.appendChild(container);
            
           
            container.innerHTML = games.map(game => createGameCardHTML(game)).join('');
        } else {
            section.style.display = 'none';
        }
    });
}

async function clearSearchResults() {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    const allAds = document.querySelectorAll('.ads');
    
   
    allAds.forEach(ad => {
        ad.style.display = '';
    });
    
   
    if (savedGameDetails && isValidGameData(savedGameDetails)) {
        await generateCategorySections(savedGameDetails, true);
    } else {
       
        allSections.forEach(section => {
            section.style.display = '';
        });
    }
}

function initSearchFunctionality(searchInput, loadedGameDetails) {
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
    const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
            const hasContent = searchInput.value.trim() !== '';
            updateSearchIcon(hasContent);
        }
    }
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
}






function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}




function updateSearchIcon(hasContent) {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    if (!searchIconBtn) return;
    
    if (hasContent) {
        searchIconBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        searchIconBtn.innerHTML = `
            <img src="public/images/search.svg" alt="search" class="search-icon-img">
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
        initSearchFunctionality(searchInput, loadedGameDetails);
        await generateRandomRecommendations(loadedGameDetails);
        await generateCategorySections(loadedGameDetails);
    } catch (error) {
        console.error('Failed to initialize home page:', error);
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

