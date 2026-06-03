
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('channel')) {
  window.channel = urlParams.get('channel');
}

if (window.channel) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.href && !link.href.includes('channel=')) {
            try {
                const url = new URL(link.href);
                url.searchParams.set('channel', window.channel);
                link.href = url.toString();
            } catch (e) {
               
            }
        }
    });
}


function getDetailPagePath() {
    const pathname = window.location.pathname;
   
    if (pathname.includes('/pages/')) {
        return '../detail.html';
    }
    return 'detail.html';
}


export function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}


export async function initSearch() {
    const { loadGameData } = await import('./BaseURL.js');
    const gameDetails = await loadGameData();
    
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }
    
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    const searchBack = document.getElementById('searchBack');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchToggle || !searchContainer || !searchBack || !searchInput || !searchResults) {
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

    function hideSearch() {
        searchContainer.classList.remove('active');
        searchResults.classList.remove('active');
        searchInput.value = '';
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            performSearch(query);
            searchResults.classList.add('active');
        } else {
            searchResults.classList.remove('active');
        }
    });

    function performSearch(query) {
        if (!gameDetails || gameDetails.length === 0) {
            searchResults.innerHTML = '<div class="no-results"><h3>No data loaded</h3><p>Please wait and try again</p></div>';
            return;
        }
        
        const queryLower = query.toLowerCase();
        const results = gameDetails.filter(game => {
            if (!game) return false;
            const nameMatch = game.name && String(game.name).toLowerCase().includes(queryLower);
            const descMatch = game.description && String(game.description).toLowerCase().includes(queryLower);
            const catMatch = game.category && String(game.category).toLowerCase().includes(queryLower);
            return nameMatch || descMatch || catMatch;
        });

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results"><h3>No results found</h3><p>Please try different search terms</p></div>';
            return;
        }

        const detailPath = getDetailPagePath();
        searchResults.innerHTML = results.slice(0, 5).map(game => `
            <a href="${detailPath}?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="search-result-item">
                <img src="${game.image}" alt="${game.name}">
                <div class="search-result-info">
                    <h4>${game.name}</h4>
                    <p>${game.downloads}+ Play</p>
                </div>
                <div class="play-button">Play</div>
            </a>
        `).join('');
    }

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
            hideSearch();
        }
    });
}


export async function initCategoryPage() {
    const { loadGameData } = await import('./BaseURL.js');
    const gameDetails = await loadGameData();
    
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }
    
    const categoryInfo = {
        'action': {
            name: 'Action Games'
        },
        'adventure': {
            name: 'Adventure Games'
        },
        'racing': {
            name: 'Racing Games'
        },
        'puzzle': {
            name: 'Puzzle Games'
        },
        'sports': {
            name: 'Sports Games'
        },
        'kids': {
            name: 'Kids Games'
        },
        'girl': {
            name: 'Girls Games'
        }
    };

    const backBtn = document.getElementById('backBtn');
    const categoryTitle = document.getElementById('categoryTitle');
    const gamesGrid = document.getElementById('gamesGrid');

    function loadCategoryPage() {
        const category = getUrlParameter('category');
        if (category === 'recommended') {
            if (categoryTitle) categoryTitle.textContent = 'Recommend';
            generateRecommendedGamesList();
            return;
        }
        
        if (!category || !categoryInfo[category]) {
            window.location.href = '../index.html' + (window.channel ? '?channel=' + window.channel : '');
            return;
        }

        const info = categoryInfo[category];
        if (categoryTitle) categoryTitle.textContent = info.name.replace(' Games', ' game');
        generateGamesList(category);
    }

    function generateGamesList(category) {
       
        const games = gameDetails.filter(game => {
            return game && 
                   game.id !== null && 
                   game.id !== undefined && 
                   !isNaN(Number(game.id)) && 
                   game.name && 
                   String(game.name).trim().length > 0 &&
                   game.category === category;
        })
        .sort((a, b) => Number(a.id) - Number(b.id));
        displayGames(games);
    }

    function generateRecommendedGamesList() {
       
        const validGames = gameDetails.filter(game => {
            return game && 
                   game.id !== null && 
                   game.id !== undefined && 
                   !isNaN(Number(game.id)) && 
                   game.name && 
                   String(game.name).trim().length > 0;
        });
        
        const allGames = [...validGames].sort((a, b) => Number(a.id) - Number(b.id));
        displayGames(allGames);
    }

    function displayGames(games) {
        if (!gamesGrid) {
            return;
        }
        
        if (!games || games.length === 0) {
            gamesGrid.innerHTML = '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
            return;
        }

        const detailPath = getDetailPagePath();
        const gamesHTML = games.map((game, index) => {
            let html = `
            <a href="${detailPath}?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="game-card">
                <img src="${game.image}" alt="${game.name}">
                <div class="game-card-content">
                    <p class="game-title">${game.name}</p>
                    <div class="game-stats">
                        <svg width="20" height="20" viewBox="0 0 1024 1024" fill="#ff5252" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 832 364.8 h -147.2 s 19.2 -64 32 -179.2 c 6.4 -57.6 -38.4 -115.2 -102.4 -121.6 h -12.8 c -51.2 0 -83.2 32 -102.4 76.8 l -38.4 96 c -32 64 -57.6 102.4 -76.8 115.2 c -25.6 12.8 -121.6 12.8 -128 12.8 H 128 c -38.4 0 -64 25.6 -64 57.6 v 480 c 0 32 25.6 57.6 64 57.6 h 646.4 c 96 0 121.6 -64 134.4 -153.6 l 51.2 -307.2 c 6.4 -70.4 -6.4 -134.4 -128 -134.4 Z m -576 537.6 H 128 V 422.4 h 128 v 480 Z m 640 -409.6 l -51.2 307.2 c -12.8 57.6 -12.8 102.4 -76.8 102.4 H 320 V 422.4 c 44.8 0 70.4 -6.4 89.6 -19.2 c 32 -12.8 64 -64 108.8 -147.2 c 25.6 -64 38.4 -96 44.8 -102.4 c 6.4 -19.2 19.2 -32 44.8 -32 h 6.4 c 32 0 44.8 32 44.8 51.2 c -12.8 102.4 -32 166.4 -32 166.4 l -25.6 83.2 h 243.2 c 19.2 0 32 0 44.8 12.8 c 12.8 12.8 6.4 38.4 6.4 57.6 Z" stroke="#ff5252" stroke-width="60" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                        <span class="game-download">${game.downloads || '0'}</span>
                        <span class="game-rating">
                            <svg width="24" height="24" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path d="M544.402286 99.693714a73.142857 73.142857 0 0 1 33.206857 33.206857l84.845714 171.958858 189.805714 27.648a73.142857 73.142857 0 0 1 40.521143 124.708571l-137.289143 133.851429 32.402286 189.074285a73.142857 73.142857 0 0 1-106.130286 77.092572L512 768l-169.764571 89.234286a73.142857 73.142857 0 0 1-106.130286-77.092572l32.402286-189.001143-137.289143-133.851428a73.142857 73.142857 0 0 1 40.521143-124.781714l189.805714-27.648 84.845714-171.958858a73.142857 73.142857 0 0 1 98.011429-33.206857z m69.485714 272.091429L512 165.302857 410.112 371.712l-227.84 33.133714 164.864 160.694857-38.912 226.962286L512 685.348571l203.776 107.154286-38.912-226.962286 164.864-160.694857-227.84-33.133714z" fill="#ffab2a" stroke="#ffab2a" stroke-width="40"/>
                            </svg>
                            ${game.rating || '5.0'}
                        </span>
                    </div>
                </div>
            </a>
        `;
            if (index === 1) {
                html += `
            <div class="ads ads-full-width">
                <div id="div-gpt-ad-category2"></div>
            </div>
            `;
            }
            return html;
        }).join('');
        
        gamesGrid.innerHTML = gamesHTML;
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const homeUrl = '../index.html' + (window.channel ? '?channel=' + window.channel : '');
            window.location.href = homeUrl;
        });
    }

   
    try {
        loadCategoryPage();
    } catch (error) {
        console.error('Error loading category page:', error);
    }
}


export async function initPrivacyAboutPage() {
    const backBtn = document.getElementById('backBtn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const homeUrl = '../index.html' + (window.channel ? '?channel=' + window.channel : '');
            window.location.href = homeUrl;
        });
    }

    await initSearch();
}


(async () => {
   
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }

    async function initializePage() {
        const body = document.body;
        const pathname = window.location.pathname;

       
        if (pathname.includes('/pages/')) {
           
            if (body.classList.contains('category-page-body')) {
                await initCategoryPage();
                await initSearch();
            }
           
            else if (body.classList.contains('about-page') || body.classList.contains('privacy-page')) {
                await initPrivacyAboutPage();
            }
        }
    }
})();

