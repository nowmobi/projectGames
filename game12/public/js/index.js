

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName, getCategoryPagePath, getDetailPagePath, displayEmptyResults } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_SECTION: '.category-section',
    CATEGORY_BUTTONS: '#categoryButtons'
};

// home 使用 SVG 图标
const HOME_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// iconfont Unicode 编码映射
const CATEGORY_ICON_MAP = {
    'home': '\ue603',      // 使用 home 图标，如果没有可以用其他
    'action': '\ue6c6',    // 闪电图标
    'adventure': '\ue66f',  // 比赛/冒险图标
    'racing': '\ue600',     // 比赛图标（可替换为赛车图标）
    'puzzle': '\ufd30',     // 休闲娱乐图标（可替换为拼图图标）
    'sports': '\ue603',     // 体育图标
    'kids': '\ue89a',       // 6男孩图标
    'girl': '\ued7b'        // 手绘女孩图标
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

// 保存游戏数据，用于清除搜索结果时恢复
let savedGameDetails = null;


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


function populateCategorySection(section, category, loadedGameDetails) {
    section.innerHTML = createCategorySectionHTML(category);
    section.setAttribute('data-category', category);
   
    const gridId = `${category}GamesGrid`;
    const grid = section.querySelector(`#${gridId}`);
    
    if (!grid) return;
    
    grid.classList.add('game-grid-three-columns');
    
    const categoryGames = loadedGameDetails.filter(game => game.category === category);
    const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, 9);
    
    if (shuffledCategoryGames.length > 0) {
        renderGamesToContainer(grid, shuffledCategoryGames);
    } else {
        displayEmptyResults(grid, TEXT.NO_GAMES_FOUND, TEXT.NO_GAMES_AVAILABLE);
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
            // 强制重新生成时，获取所有 section 并重新填充
            ensureCategorySections(categories.length);
            const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
            availableSections = Array.from(allSections).slice(0, categories.length);
        } else {
            // 正常情况，只填充空的 section
            availableSections = ensureCategorySections(categories.length);
        }
        
       
        categories.forEach((category, index) => {
            if (index >= availableSections.length) return;
            
            const section = availableSections[index];
            populateCategorySection(section, category, loadedGameDetails);
        });
        
        // 确保所有 section 都显示
        const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
        for (let i = 0; i < categories.length && i < allSections.length; i++) {
            allSections[i].style.display = '';
        }
        
        // 隐藏多余的 section
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

async function clearSearchResults() {
    const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    const allAds = document.querySelectorAll('.ads');
    
    allAds.forEach(ad => {
        ad.style.display = '';
    });
    
    // 如果有保存的游戏数据，强制重新生成分类内容
    if (savedGameDetails && isValidGameData(savedGameDetails)) {
        await generateCategorySections(savedGameDetails, true);
    } else {
        // 否则只恢复显示状态
        allSections.forEach(section => {
            section.style.display = '';
        });
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

async function closeSearchOverlay() {
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    if (searchOverlay) {
        searchOverlay.classList.remove('active');
        toggleSearchIcon(false);
        const searchInput = getElement(DOM_SELECTORS.SEARCH_INPUT, 'Search input');
        if (searchInput) {
            searchInput.value = '';
        }
        await clearSearchResults();
    }
}

function getCategoryIcon(category) {
    if (category === 'home') {
        return HOME_ICON_SVG;
    }
    return CATEGORY_ICON_MAP[category] || CATEGORY_ICON_MAP['action'];
}

function createCategoryButtonHTML(category, displayName, isActive = false) {
    const icon = getCategoryIcon(category);
    const isHome = category === 'home';
    
    return `
        <button class="category-btn ${isActive ? 'active' : ''}" data-category="${category}" type="button">
            <div class="category-btn-icon">
                ${isHome ? icon : `<i class="iconfont">${icon}</i>`}
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

function scrollToCategory(category) {
    if (category === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    
    const sections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
    sections.forEach(section => {
        if (section.getAttribute('data-category') === category) {
            const sectionHeader = section.querySelector('.section-header');
            if (sectionHeader) {
                const headerHeight = 50;
                const headerTop = sectionHeader.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: headerTop, behavior: 'smooth' });
            }
        }
    });
}

function handleCategoryButtonClick(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    scrollToCategory(category);
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

function initSearchOverlay() {
    const searchIconBtn = getElement(DOM_SELECTORS.SEARCH_ICON_BTN, 'Search icon button');
    const searchOverlay = getElement(DOM_SELECTORS.SEARCH_OVERLAY, 'Search overlay');
    
    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = searchOverlay?.classList.contains('active');
            if (isOpen) {
                await closeSearchOverlay();
            } else {
                openSearchOverlay();
            }
        });
    }
    
    if (searchOverlay) {
        document.addEventListener('keydown', async (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                await closeSearchOverlay();
            }
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
        
       
        // 保存游戏数据，用于清除搜索结果时恢复
        savedGameDetails = loadedGameDetails;
        
        initSearchOverlay();
        initSearchFunctionality(searchInput, searchBtn, loadedGameDetails);
        await generateCategoryButtons();
        await generateCategorySections(loadedGameDetails);
    } catch (error) {
        console.error('Failed to initialize home page:', error);
    }
}

document.addEventListener('DOMContentLoaded', initHomePage);


