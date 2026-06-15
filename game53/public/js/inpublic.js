
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
    'home': 'home.png',
    'action': 'action.png',
    'adventure': 'adventure.png',
    'racing': 'racing.png',
    'puzzle': 'puzzle.png',
    'sports': 'sports.png',
    'kids': 'kids.png',
    'girl': 'girl.png',
    'hot': 'hot.png'
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



export function createGameCardHTML(game, detailPagePath) {
    if (!game || !game.id) {
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    
   
    const gamesGrid = document.getElementById('gamesGrid');
    const isCategoryPage = window.location.pathname.includes('category.html') && 
                          gamesGrid && gamesGrid.classList.contains('category-products-grid');
    
   
    const pathname = window.location.pathname;
    const isHomePage = pathname.includes('index.html') || 
                       pathname === '/' || 
                       pathname.endsWith('/');
    const categorySection = document.querySelector('.category-section');
    const recommendedGamesElForHome = document.getElementById('recommendedGames');
    const searchResultsGridForHome = document.getElementById('searchResultsGrid');
    const isHomeCategory = isHomePage && categorySection !== null;
    const isRecommended = recommendedGamesElForHome !== null && 
                         recommendedGamesElForHome.classList.contains('game-grid');
    const isSearchResultsNewStyle = searchResultsGridForHome !== null && 
                                   searchResultsGridForHome.classList.contains('game-grid');
    
    
   
    if (isHomeCategory || isRecommended || isSearchResultsNewStyle) {
        return `
            <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
                <div class="game-card-image-wrapper">
                    <img src="${gameImage}" alt="${gameName}" loading="lazy">
                </div>
                <div class="game-card-info">
                    <h3 class="game-card-name">${gameName}</h3>
                    <button class="game-card-play-btn" onclick="window.location.href='${finalDetailPath}?id=${game.id}'; event.stopPropagation();">Play</button>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-card-image-wrapper">
                <img src="${gameImage}" alt="${gameName}" loading="lazy">
                <div class="game-card-title-overlay">
                    <h3 class="game-card-title">${gameName}</h3>
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
        
        const categoryTitle = document.getElementById('categoryContentTitle');
        if (categoryTitle) {
            categoryTitle.textContent = category === 'all' ? 'All' : getCategoryDisplayName(category);
        }
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
    const gameCards = games.map(game => createCategoryProductCardHTML(game, detailPath));
    
    const cardsWithAd = [];
    gameCards.forEach((card, index) => {
        cardsWithAd.push(card);
        if (index === 1 && games.length > 2) {
            cardsWithAd.push(`
                <div class="ads" style="grid-column: span 2; ">
                <div id="div-gpt-ad-category2"></div>
                </div>
                `);
        }
    });
    
    gamesGrid.innerHTML = cardsWithAd.join('');
    

    const cards = gamesGrid.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 50);
    });
}


function createCategoryProductCardHTML(game, detailPagePath) {
    if (!game || !game.id) {
        return '';
    }
    
    const finalDetailPath = detailPagePath || getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    
    const ratingValue = formatGameRating(game.rating);
    const downloadDisplay = formatDownloadsDisplay(game.downloads);
    
    return `
        <div class="game-card" onclick="window.location.href='${finalDetailPath}?id=${game.id}'">
            <div class="game-card-image-wrapper">
                <img src="${gameImage}" alt="${gameName}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='#f5f5f5';">
            </div>
            <div class="game-card-info">
                <h3 class="game-card-name">${gameName}</h3>
                <div class="game-card-stats">
                    <div class="game-card-rating">★ ${ratingValue.toFixed(1)}</div>
                    <div class="game-card-download">${downloadDisplay}</div>
                </div>
            </div>
        </div>
    `;
}



function getCategoryIconSVG(category) {
    if (category === 'home') {
        return `<svg t="1778826799928" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M247.936 349.632h64.576v241.6H247.936z" fill="#F77A3C"></path><path d="M159.424 438.144h241.6v64.576H159.424z" fill="#F77A3C"></path><path d="M648.384 405.568m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M807.168 405.568m-45.376 0a45.376 45.376 0 1 0 90.752 0 45.376 45.376 0 1 0-90.752 0Z" fill="#F77A3C"></path><path d="M590.016 557.76m-45.44 0a45.44 45.44 0 1 0 90.88 0 45.44 45.44 0 1 0-90.88 0Z" fill="#F77A3C"></path><path d="M748.928 557.76m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M1025.6 825.152H0V115.776h1025.6v709.376z m-922.24-103.488H922.24V219.136H103.36v502.528z" fill="#FFA143"></path><path d="M405.248 809.344h215.104v81.536H405.248z" fill="#FFA143"></path><path d="M259.712 888.512h506.176v52.672H259.712z" fill="#FFA143"></path></svg>`;
    } else if (category === 'action') {
        return `<svg t="1779071098997" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M511.68 941.504c-230.784 0-418.496-187.776-418.496-418.56s187.712-418.56 418.496-418.56c230.72 0 418.496 187.776 418.496 418.56s-187.776 418.56-418.496 418.56z m0-748.672c-182.016 0-330.112 148.096-330.112 330.112s148.096 330.176 330.112 330.176c181.952 0 330.112-148.096 330.112-330.176s-148.16-330.112-330.112-330.112z" fill="#FC7A7A"></path><path d="M511.68 522.944m-75.968 0a75.968 75.968 0 1 0 151.936 0 75.968 75.968 0 1 0-151.936 0Z" fill="#FC7A7A"></path><path d="M479.872 6.4h66.368v258.304H479.872zM482.752 764.992l66.368 0.704L546.176 1024l-66.368-0.768zM764.864 483.072h258.24v66.304h-258.24zM0 483.072h258.304v66.304H0z" fill="#FF5A5A"></path></svg>`;
    } else if (category === 'adventure') {
        return `<svg t="1779070930139" class="icon" viewBox="0 0 1095 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M697.039492 1024v-297.364395l-178.916158 105.053444 178.916158 192.310951z" fill="#42D342"></path><path d="M187.463311 968.571073L0 0l1091.61181 484.189859-904.148499 484.381214zM150.850878 189.568207l117.746605 608.314937 567.811636-304.189361L150.850878 189.568207z" fill="#86DD72"></path><path d="M115.195216 55.301358l563.219136 568.385698-79.539554 78.901707-563.219136-568.321914z" fill="#86DD72"></path></svg>`;
    } else if (category === 'racing') {
        return `<svg t="1779070771933" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M251.84 91.072h162.944v160.064H251.84zM414.528 251.584h163.072v160.064H414.528zM737.536 251.584h163.008v160.064h-163.008z" fill="#6989ED"></path><path d="M576.64 92.096h163.008V252.16H576.64zM252.096 411.648h163.072v160.064H252.096z" fill="#6989ED"></path><path d="M989.504 666.048H147.456V2.56h842.048v663.488zM255.04 558.464h626.816V110.208H255.04v448.256zM7.68 0h107.648v1022.208H7.68z" fill="#8598F9"></path><path d="M576.64 410.368h163.008v160.064H576.64z" fill="#6989ED"></path></svg>`;
    } else if (category === 'puzzle') {
        return `<svg t="1779070436265" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M562.496 573.504H0V11.264h562.496v562.24zM106.944 466.56h348.48V118.208H106.944V466.56z" fill="#48CC74"></path><path d="M562.496 1024H0V461.952h562.496V1024z m-455.552-107.008h348.48V568.96H106.944v348.032z" fill="#48CC74"></path><path d="M1024 1023.744H461.632V461.44H1024v562.304z m-455.36-106.88h348.352V568.448H568.64v348.416z" fill="#48CC74"></path></svg>`;
    } else if (category === 'sports') {
        return `<svg t="1779070595209" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M1020.16 471.744A510.4 510.4 0 0 0 512.384 2.624C232.896 2.624 5.376 228.8 2.816 507.712c0 1.6-0.192 3.136-0.192 4.736 0 26.752 2.688 52.928 6.656 78.464a510.848 510.848 0 0 0 334.528 402.112c26.176 9.152 53.184 16.256 81.088 21.12 28.48 4.992 57.6 8.064 87.488 8.064 266.88 0 486.08-206.208 507.712-467.52a511.36 511.36 0 0 0 2.112-42.24 474.816 474.816 0 0 0-2.048-40.704z m-108.224 87.744a401.28 401.28 0 0 1-124.544 246.016 419.2 419.2 0 0 1-63.936 49.024 400.384 400.384 0 0 1-211.008 60.352 389.12 389.12 0 0 1-51.328-3.712 402.56 402.56 0 0 1-286.144-180.096 399.68 399.68 0 0 1-60.224-160.064 401.728 401.728 0 0 1-4.8-58.624c0-7.36 0.704-14.592 1.088-21.952a401.024 401.024 0 0 1 129.92-274.304 398.72 398.72 0 0 1 64.448-48.192 399.488 399.488 0 0 1 206.976-57.984c32.064 0 63.104 4.16 92.992 11.264A404.288 404.288 0 0 1 861.44 312.96c28.416 49.472 46.656 105.6 51.776 165.376 0.896 11.264 1.664 22.528 1.664 34.048 0.064 15.936-1.152 31.616-2.944 47.104z" fill="#BC8577"></path><path d="M916.224 559.616c1.92-15.68 3.072-31.488 3.072-47.616 0-11.648-0.832-23.04-1.728-34.496a277.12 277.12 0 0 1-163.392-83.392l111.04-83.968a411.328 411.328 0 0 0-47.36-66.24L707.072 327.68a276.096 276.096 0 0 1-23.808-184.64 401.344 401.344 0 0 0-77.12-26.88c-6.72 27.648-10.88 56.256-10.88 85.952 0 63.68 16.896 123.392 46.016 175.36L528.704 462.528 302.592 163.456a408.32 408.32 0 0 0-65.216 48.768l226.368 299.456L357.44 592a358.208 358.208 0 0 0-250.624-102.272l-0.896 0.064c-0.448 7.424-1.152 14.72-1.152 22.208 0 20.224 1.984 39.872 4.864 59.328a276.864 276.864 0 0 1 181.824 70.592l-120.896 91.392c14.848 22.784 31.872 44.16 50.88 63.616l122.304-92.48c25.984 42.304 41.28 91.776 41.28 144.96 0 16.32-1.728 32.256-4.416 47.744 25.472 8.704 52.032 14.912 79.488 18.432 4.032-21.44 6.4-43.584 6.4-66.176a357.44 357.44 0 0 0-57.408-194.272l112.704-85.024c15.808-11.968 33.728-21.888 53.12-29.632z" fill="#BC8577"></path><path d="M511.68 614.848m-152.96 0a152.96 152.96 0 1 0 305.92 0 152.96 152.96 0 1 0-305.92 0Z" fill="#BC8577"></path></svg>`;
    } else if (category === 'kids') {
        return `<svg t="1779070964503" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M261.15008 320.32S-19.42592 334.272 99.03808 45.952c0 0-238.528 232 24.768 447.872M761.88608 312.448s280.448 13.888 161.984-274.368c0 0 238.592 232.064-24.832 447.872" fill="#EF613A"></path><path d="M955.10208 726.08h-876.8v-52.544c0-241.664 196.736-438.336 438.528-438.336 241.6 0 438.272 196.672 438.272 438.336v52.544zM187.29408 621.12h658.688a333.952 333.952 0 0 0-329.216-281.088 334.144 334.144 0 0 0-329.472 281.088zM78.75008 760.384h876.8v104.96H78.75008z" fill="#F9785F"></path></svg>`;
    } else if (category === 'girl') {
        return `<svg t="1779070783986" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M209.856 0h87.04v208.512h-87.04zM644.224 0h87.104v208.512h-87.104z" fill="#FF5A5A"></path><path d="M907.008 1021.44H24l73.472-93.824c8-10.432 196.672-261.888 6.848-580.992l-25.664-43.136 198.4-161.088 36.608 44.736c0.64 0.768 76.928 91.328 167.424 91.328 51.008 0 100.672-30.4 147.584-90.368l38.272-48.96 187.008 167.872-27.456 41.664c-7.296 11.392-180.032 286.016 19.456 582.208l61.056 90.56zM244.16 905.344h453.376c-122.816-254.528-38.976-482.752 7.232-576.064l-25.792-23.232c-59.776 58.752-126.144 88.512-197.824 88.512-94.016 0-171.712-53.184-216.384-92.608l-36.224 29.376c127.296 247.68 69.888 458.624 15.616 574.016z" fill="#FF7171"></path></svg>`;
    }
    return `<img src="../public/images/${getCategoryIcon(category)}" alt="${category}" />`;
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
                <svg t="1778826799928" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M247.936 349.632h64.576v241.6H247.936z" fill="#F77A3C"></path><path d="M159.424 438.144h241.6v64.576H159.424z" fill="#F77A3C"></path><path d="M648.384 405.568m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M807.168 405.568m-45.376 0a45.376 45.376 0 1 0 90.752 0 45.376 45.376 0 1 0-90.752 0Z" fill="#F77A3C"></path><path d="M590.016 557.76m-45.44 0a45.44 45.44 0 1 0 90.88 0 45.44 45.44 0 1 0-90.88 0Z" fill="#F77A3C"></path><path d="M748.928 557.76m-45.312 0a45.312 45.312 0 1 0 90.624 0 45.312 45.312 0 1 0-90.624 0Z" fill="#F77A3C"></path><path d="M1025.6 825.152H0V115.776h1025.6v709.376z m-922.24-103.488H922.24V219.136H103.36v502.528z" fill="#FFA143"></path><path d="M405.248 809.344h215.104v81.536H405.248z" fill="#FFA143"></path><path d="M259.712 888.512h506.176v52.672H259.712z" fill="#FFA143"></path></svg>
            </div>
            <span class="category-btn-text">All</span>
        </button>
    `;
    
   
    const categoryButtonsHTML = categories.map(category => {
        const displayName = getCategoryDisplayName(category);
        const isActive = category === activeCategory;
        const iconSVG = getCategoryIconSVG(category);
        
       
        return `
            <button class="category-btn ${isActive ? 'active' : ''}" 
                    data-category="${category}" 
                    type="button">
                <div class="category-btn-icon">
                    ${iconSVG}
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
    const categoryTitle = document.getElementById('categoryContentTitle');
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
    
    if (categoryTitle) {
        categoryTitle.style.opacity = '0';
        setTimeout(() => {
            categoryTitle.textContent = category === 'all' ? 'All' : getCategoryDisplayName(category);
            categoryTitle.style.opacity = '1';
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
            console.error('Error switching category:', error);
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
