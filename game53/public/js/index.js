

import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { createGameCardHTML, getCategoryDisplayName, getCategoryPagePath, getDetailPagePath, displayEmptyResults, getCategoryIcon, formatGameRating, formatDownloadsDisplay, shuffleArray } from './inpublic.js';

const DOM_SELECTORS = {
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '.search-btn',
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
    const categoryName = getCategoryDisplayName(category);
    const categoryPagePath = getCategoryPagePath(category);
    const gridId = `${category}GamesGrid`;
    
    return `
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
                <div class="game-grid" id="searchResultsGrid"></div>
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
           
            const container = document.createElement('div');
            container.className = 'game-grid';
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
    const iconPath = getCategoryIcon(category);
    const iconUrl = `public/images/${iconPath}`;
    
    let iconContent = `<img src="${iconUrl}" alt="${displayName}" />`;
    
    if (category === 'home') {
        iconContent = `<svg t="1778826799928" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M247.936 349.632h64.576v241.6H247.936z" fill="#F77A3C"></path><path d="M159.424 438.144h241.6v64.576H159.424z" fill="#F77A3C"></path><path d="M648.384 405.568m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M807.168 405.568m-45.376 0a45.376 45.376 0 1 0 90.752 0 45.376 45.376 0 1 0-90.752 0Z" fill="#F77A3C"></path><path d="M590.016 557.76m-45.44 0a45.44 45.44 0 1 0 90.88 0 45.44 45.44 0 1 0-90.88 0Z" fill="#F77A3C"></path><path d="M748.928 557.76m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M1025.6 825.152H0V115.776h1025.6v709.376z m-922.24-103.488H922.24V219.136H103.36v502.528z" fill="#FFA143"></path><path d="M405.248 809.344h215.104v81.536H405.248z" fill="#FFA143"></path><path d="M259.712 888.512h506.176v52.672H259.712z" fill="#FFA143"></path></svg>`;
    } else if (category === 'puzzle') {
        iconContent = `<svg t="1779070436265" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M562.496 573.504H0V11.264h562.496v562.24zM106.944 466.56h348.48V118.208H106.944V466.56z" fill="#48CC74"></path><path d="M562.496 1024H0V461.952h562.496V1024z m-455.552-107.008h348.48V568.96H106.944v348.032z" fill="#48CC74"></path><path d="M1024 1023.744H461.632V461.44H1024v562.304z m-455.36-106.88h348.352V568.448H568.64v348.416z" fill="#48CC74"></path></svg>`;
    } else if (category === 'sports') {
        iconContent = `<svg t="1779070595209" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M1020.16 471.744A510.4 510.4 0 0 0 512.384 2.624C232.896 2.624 5.376 228.8 2.816 507.712c0 1.6-0.192 3.136-0.192 4.736 0 26.752 2.688 52.928 6.656 78.464a510.848 510.848 0 0 0 334.528 402.112c26.176 9.152 53.184 16.256 81.088 21.12 28.48 4.992 57.6 8.064 87.488 8.064 266.88 0 486.08-206.208 507.712-467.52a511.36 511.36 0 0 0 2.112-42.24 474.816 474.816 0 0 0-2.048-40.704z m-108.224 87.744a401.28 401.28 0 0 1-124.544 246.016 419.2 419.2 0 0 1-63.936 49.024 400.384 400.384 0 0 1-211.008 60.352 389.12 389.12 0 0 1-51.328-3.712 402.56 402.56 0 0 1-286.144-180.096 399.68 399.68 0 0 1-60.224-160.064 401.728 401.728 0 0 1-4.8-58.624c0-7.36 0.704-14.592 1.088-21.952a401.024 401.024 0 0 1 129.92-274.304 398.72 398.72 0 0 1 64.448-48.192 399.488 399.488 0 0 1 206.976-57.984c32.064 0 63.104 4.16 92.992 11.264A404.288 404.288 0 0 1 861.44 312.96c28.416 49.472 46.656 105.6 51.776 165.376 0.896 11.264 1.664 22.528 1.664 34.048 0.064 15.936-1.152 31.616-2.944 47.104z" fill="#BC8577"></path><path d="M916.224 559.616c1.92-15.68 3.072-31.488 3.072-47.616 0-11.648-0.832-23.04-1.728-34.496a277.12 277.12 0 0 1-163.392-83.392l111.04-83.968a411.328 411.328 0 0 0-47.36-66.24L707.072 327.68a276.096 276.096 0 0 1-23.808-184.64 401.344 401.344 0 0 0-77.12-26.88c-6.72 27.648-10.88 56.256-10.88 85.952 0 63.68 16.896 123.392 46.016 175.36L528.704 462.528 302.592 163.456a408.32 408.32 0 0 0-65.216 48.768l226.368 299.456L357.44 592a358.208 358.208 0 0 0-250.624-102.272l-0.896 0.064c-0.448 7.424-1.152 14.72-1.152 22.208 0 20.224 1.984 39.872 4.864 59.328a276.864 276.864 0 0 1 181.824 70.592l-120.896 91.392c14.848 22.784 31.872 44.16 50.88 63.616l122.304-92.48c25.984 42.304 41.28 91.776 41.28 144.96 0 16.32-1.728 32.256-4.416 47.744 25.472 8.704 52.032 14.912 79.488 18.432 4.032-21.44 6.4-43.584 6.4-66.176a357.44 357.44 0 0 0-57.408-194.24L512.832 576.64l212.736 281.472a420.544 420.544 0 0 0 64.704-49.536l-212.48-281.088 111.232-84.096a358.592 358.592 0 0 0 227.2 116.224z" fill="#BF6758"></path></svg>`;
    } else if (category === 'racing') {
        iconContent = `<svg t="1779070771933" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M251.84 91.072h162.944v160.064H251.84zM414.528 251.584h163.072v160.064H414.528zM737.536 251.584h163.008v160.064h-163.008z" fill="#6989ED"></path><path d="M576.64 92.096h163.008V252.16H576.64zM252.096 411.648h163.072v160.064H252.096z" fill="#6989ED"></path><path d="M989.504 666.048H147.456V2.56h842.048v663.488zM255.04 558.464h626.816V110.208H255.04v448.256zM7.68 0h107.648v1022.208H7.68z" fill="#8598F9"></path><path d="M576.64 410.368h163.008v160.064H576.64z" fill="#6989ED"></path></svg>`;
    } else if (category === 'girl') {
        iconContent = `<svg t="1779070783986" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M209.856 0h87.04v208.512h-87.04zM644.224 0h87.104v208.512h-87.104z" fill="#FF5A5A"></path><path d="M907.008 1021.44H24l73.472-93.824c8-10.432 196.672-261.888 6.848-580.992l-25.664-43.136 198.4-161.088 36.608 44.736c0.64 0.768 76.928 91.328 167.424 91.328 51.008 0 100.672-30.4 147.584-90.368l38.272-48.96 187.008 167.872-27.456 41.664c-7.296 11.392-180.032 286.016 19.456 582.208l61.056 90.56zM244.16 905.344h453.376c-122.816-254.528-38.976-482.752 7.232-576.064l-25.792-23.232c-59.776 58.752-126.144 88.512-197.824 88.512-94.016 0-171.712-53.184-216.384-92.608l-36.224 29.376c127.296 247.68 69.888 458.624 15.616 574.016z" fill="#FF7171"></path></svg>`;
    } else if (category === 'adventure') {
        iconContent = `<svg t="1779070930139" class="icon" viewBox="0 0 1095 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M697.039492 1024v-297.364395l-178.916158 105.053444 178.916158 192.310951z" fill="#42D342"></path><path d="M187.463311 968.571073L0 0l1091.61181 484.189859-904.148499 484.381214zM150.850878 189.568207l117.746605 608.314937 567.811636-304.189361L150.850878 189.568207z" fill="#86DD72"></path><path d="M115.195216 55.301358l563.219136 568.385698-79.539554 78.901707-563.219136-568.321914z" fill="#86DD72"></path></svg>`;
    } else if (category === 'kids') {
        iconContent = `<svg t="1779070964503" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M261.15008 320.32S-19.42592 334.272 99.03808 45.952c0 0-238.528 232 24.768 447.872M761.88608 312.448s280.448 13.888 161.984-274.368c0 0 238.592 232.064-24.832 447.872" fill="#EF613A"></path><path d="M955.10208 726.08h-876.8v-52.544c0-241.664 196.736-438.336 438.528-438.336 241.6 0 438.272 196.672 438.272 438.336v52.544zM187.29408 621.12h658.688a333.952 333.952 0 0 0-329.216-281.088 334.144 334.144 0 0 0-329.472 281.088zM78.75008 760.384h876.8v104.96H78.75008z" fill="#F9785F"></path></svg>`;
    } else if (category === 'action') {
        iconContent = `<svg t="1779071098997" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M511.68 941.504c-230.784 0-418.496-187.776-418.496-418.56s187.712-418.56 418.496-418.56c230.72 0 418.496 187.776 418.496 418.56s-187.776 418.56-418.496 418.56z m0-748.672c-182.016 0-330.112 148.096-330.112 330.112s148.096 330.176 330.112 330.176c181.952 0 330.112-148.096 330.112-330.176s-148.16-330.112-330.112-330.112z" fill="#FC7A7A"></path><path d="M511.68 522.944m-75.968 0a75.968 75.968 0 1 0 151.936 0 75.968 75.968 0 1 0-151.936 0Z" fill="#FC7A7A"></path><path d="M479.872 6.4h66.368v258.304H479.872zM482.752 764.992l66.368 0.704L546.176 1024l-66.368-0.768zM764.864 483.072h258.24v66.304h-258.24zM0 483.072h258.304v66.304H0z" fill="#FF5A5A"></path></svg>`;
    }
    
    return `
        <button class="category-btn ${isActive ? 'active' : ''}" data-category="${category}" type="button">
            <div class="category-btn-icon">
                ${iconContent}
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
            const headerHeight = 50;
            const offset = headerHeight;
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
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
    
    if (category === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.location.href = `pages/category.html?category=${encodeURIComponent(category)}`;
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
                <path d="M18 6L6 18" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        searchIconBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="var(--primary-color)" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
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
        await generateFeaturedGames();
        await generateHotGames();
    } catch (error) {
        console.error('Failed to initialize home page:', error);
    }
}


async function generateFeaturedGames() {
    const featuredGamesContainer = document.getElementById('featuredGamesContainer');
    if (!featuredGamesContainer) return;
    
    try {
        const loadedGameDetails = await loadGameData();
        if (!loadedGameDetails || loadedGameDetails.length === 0) {
            return;
        }
        
        const validGames = loadedGameDetails.filter(game => game && game.id && game.id !== '' && game.id !== null && game.id !== undefined && game.image && game.image !== '');
        
        if (validGames.length === 0) {
            console.warn('No valid games found with id and image');
            return;
        }
        
        const shuffledGames = shuffleArray([...validGames]).slice(0, 24);
        
        const featuredGamesHTML = shuffledGames.map(game => {
            const gameImage = game.image || '';
            const gameName = game.name || 'Unknown Game';
            const category = game.category || 'Uncategorized';
            return `
                <a href="${getDetailPagePath()}?id=${game.id}" class="featured-game-card" style="background-image: url('${gameImage}')">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                    <div class="featured-game-info">
                        <div class="featured-game-text">
                            <div class="featured-game-name">${gameName}</div>
                            <div class="featured-game-category">${category}</div>
                        </div>
                        <button class="featured-game-play-btn" onclick="event.stopPropagation();">Play</button>
                    </div>
                </a>
            `;
        }).join('');
        
        featuredGamesContainer.innerHTML = featuredGamesHTML;
    } catch (error) {
        console.error('Failed to generate featured games:', error);
    }
}

async function generateHotGames() {
    const hotGamesScroll = document.getElementById('hotGamesScroll');
    if (!hotGamesScroll) return;
    
    try {
        const loadedGameDetails = await loadGameData();
        if (!loadedGameDetails || loadedGameDetails.length === 0) {
            return;
        }
        
       
        const validGames = loadedGameDetails.filter(game => game && game.id && game.id !== '' && game.id !== null && game.id !== undefined);
        
        if (validGames.length === 0) {
            console.warn('No valid games found with id');
            return;
        }
        
       
        const shuffledGames = shuffleArray([...validGames]).slice(0, 5);
        
        const hotGamesHTML = shuffledGames.map((game, index) => {
            if (!game || !game.id) {
                console.warn('Invalid game object:', game);
                return '';
            }
            
            const originalName = game.name || 'Unknown Game';
            const gameName = originalName.length > 15 ? originalName.slice(0, 15) + '...' : originalName;
            const gameImage = game.image || '';
            const serialNumber = index + 1;
            
            return `
                <div class="hot-game-card">
                    <span class="hot-game-card-number">${serialNumber}</span>
                    <img src="${gameImage}" alt="${gameName}" class="hot-game-card-image" loading="lazy">
                    <div class="hot-game-card-info">
                        <h3 class="hot-game-card-title">${gameName}</h3>
                        <span class="hot-game-card-subtitle"><span class="star">★</span><span class="download-count">${formatDownloadsDisplay(game.downloads)} PLAYS</span></span>
                    </div>
                    <button class="hot-game-card-play-btn" onclick="window.location.href='${getDetailPagePath()}?id=${game.id}'; event.stopPropagation();">Play</button>
                </div>
            `;
        }).filter(html => html !== '').join('');
        
        hotGamesScroll.innerHTML = hotGamesHTML;
    } catch (error) {
        console.error('Failed to generate hot games:', error);
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

