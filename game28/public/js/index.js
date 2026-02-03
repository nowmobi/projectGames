

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName, getCategoryPagePath, displayEmptyResults, getCategoryIcon, shuffleArray } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_ICON_BTN: '#searchIconBtn',
    SEARCH_OVERLAY: '#searchOverlay',
    CATEGORY_SECTION: '.category-section',
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
let categoryCarouselTimer = null;


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
    
    return `
        <div class="card-grid" id="${gridId}">
            
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
    
    if (!grid) {
        console.error(`Grid not found for category: ${category}, gridId: ${gridId}`);
        return;
    }
    
    const categoryGames = loadedGameDetails.filter(game => game.category === category);
    const shuffledCategoryGames = shuffleArray(categoryGames).slice(0, 4);
    
    if (shuffledCategoryGames.length > 0) {
       
        const gamesHTML = shuffledCategoryGames.map(game => createGameCardHTML(game)).join('');
        grid.innerHTML = gamesHTML;
    } else {
        console.warn(`No games found for category: ${category}`);
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
           
            ensureCategorySections(categories.length);
            const allSections = document.querySelectorAll(DOM_SELECTORS.CATEGORY_SECTION);
            availableSections = Array.from(allSections).slice(0, categories.length);
        } else {
           
            availableSections = ensureCategorySections(categories.length);
        }
        
       
        categories.forEach((category, index) => {
            if (index >= availableSections.length) return;
            
            const section = availableSections[index];
            populateCategorySection(section, category, loadedGameDetails);
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

function createCategoryButtonHTML(category, displayName, isActive = false) {
    return `
        <button class="category-btn ${isActive ? 'active' : ''}" data-category="${category}" type="button">
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
        initCategoryBarAutoScroll();
    } catch (error) {
        console.error('Failed to generate category buttons:', error);
    }
}


function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleCategoryButtonClick(category) {
   
    if (category === 'home') {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        scrollToTop();
        return;
    }
    
   
    const categoryPagePath = getCategoryPagePath(category);
    window.location.href = categoryPagePath;
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

function initCategoryBarAutoScroll() {
    const carouselWrapper = document.querySelector('.category-carousel-wrapper');
    const buttonsWrap = document.querySelector('.category-buttons');
    if (!carouselWrapper || !buttonsWrap) return;

    // 等待DOM更新完成
    setTimeout(() => {
        const buttons = buttonsWrap.querySelectorAll('.category-btn');
        if (buttons.length === 0) return;

        const totalButtons = buttons.length;
        
        if (totalButtons <= 1) return; // 如果按钮数量少于等于1个，不需要轮播

        // 复制按钮以实现无限循环
        if (!buttonsWrap.dataset.cloned) {
            const originalHTML = buttonsWrap.innerHTML;
            buttonsWrap.innerHTML = originalHTML + originalHTML;
            buttonsWrap.dataset.cloned = 'true';
        }

        // 获取第一个按钮的实际宽度（包括margin）
        const firstButton = buttons[0];
        if (!firstButton) return;
        const buttonRect = firstButton.getBoundingClientRect();
        const buttonWidth = buttonRect.width;
        const gap = 120; // 按钮之间的间距

        let currentIndex = 0;
        let isTransitioning = false;

        const stop = () => {
            if (categoryCarouselTimer) {
                clearInterval(categoryCarouselTimer);
                categoryCarouselTimer = null;
            }
        };

        const goToIndex = (index, immediate = false) => {
            if (isTransitioning && !immediate) return;
            
            const translateX = -(index * (buttonWidth + gap));
            if (immediate) {
                carouselWrapper.style.transition = 'none';
            } else {
                carouselWrapper.style.transition = 'transform 0.6s ease-in-out';
            }
            carouselWrapper.style.transform = `translateX(${translateX}px)`;
            currentIndex = index;
        };

        const start = () => {
            stop();
            categoryCarouselTimer = setInterval(() => {
                if (isTransitioning) return;
                
                currentIndex += 1; // 每次只移动1个按钮
                
                // 如果滚动到第二组（复制的部分），无缝跳转到第一组对应位置
                if (currentIndex >= totalButtons) {
                    currentIndex = currentIndex - totalButtons;
                    goToIndex(currentIndex, true);
                    // 等待一帧后继续滚动
                    setTimeout(() => {
                        isTransitioning = false;
                        currentIndex += 1;
                        goToIndex(currentIndex, false);
                    }, 50);
                } else {
                    goToIndex(currentIndex, false);
                }
            }, 3000); // 每3秒切换一次，停顿3秒
        };

        // 监听过渡结束事件
        carouselWrapper.addEventListener('transitionend', () => {
            isTransitioning = false;
            // 如果滚动到第二组的末尾，无缝跳转到第一组
            if (currentIndex >= totalButtons) {
                currentIndex = currentIndex - totalButtons;
                goToIndex(currentIndex, true);
            }
        });

        // 初始化显示第一页
        goToIndex(0, true);
        setTimeout(() => {
            isTransitioning = false;
            start();
        }, 100);

        // 鼠标悬停时暂停
        const categoryBar = document.querySelector('.category-bar');
        if (categoryBar) {
            categoryBar.addEventListener('mouseenter', stop);
            categoryBar.addEventListener('mouseleave', start);
        }
    }, 100);
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
            <img src="public/images/search.png" alt="search" class="search-icon-img">
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
        await generateCategoryButtons();
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

