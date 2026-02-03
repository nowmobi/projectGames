
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
        const gamesHTML = games.map(game => {
            return `
            <a href="${detailPath}?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="game-card">
                <img src="${game.image}" alt="${game.name}">
                <div class="game-card-content">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-play-count">${game.downloads}+ Play</div>
                </div>
                <div class="play-button">Play</div>
            </a>
        `;
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

