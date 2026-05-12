
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('channel')) {
  window.channel = urlParams.get('channel');
}

if (window.channel) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.href && !link.href.includes('channel=')) {
            const url = new URL(link.href);
            url.searchParams.set('channel', window.channel);
            link.href = url.toString();
        }
    });
}


(async () => {
    
    const { loadGameData } = await import('./BaseURL.js');
    let gameDetailsData = [];
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    
    function initializeSearch() {
        const searchToggle = document.getElementById('searchToggle');
        const searchContainer = document.getElementById('searchContainer');
        const searchBack = document.getElementById('searchBack');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (!searchToggle || !searchContainer || !searchBack || !searchInput || !searchResults) {
            return;
        }

        function hideSearch() {
            searchContainer.classList.remove('active');
            searchResults.classList.remove('active');
            searchInput.value = '';
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
            if (!gameDetailsData || gameDetailsData.length === 0) {
                
                searchResults.innerHTML = '<div class="no-results"><h3>Loading...</h3><p>Please wait while games are loading</p></div>';
                return;
            }
            
            const results = gameDetailsData.filter(game => 
                (game.name && game.name.toLowerCase().includes(query.toLowerCase())) ||
                (game.description && game.description.toLowerCase().includes(query.toLowerCase())) ||
                (game.category && game.category.toLowerCase().includes(query.toLowerCase()))
            );
            displaySearchResults(results);
        }

        function displaySearchResults(results) {
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="no-results"><h3>No results found</h3><p>Please try different search terms</p></div>';
                return;
            }

            
            const isInPagesDir = window.location.pathname.includes('/pages/') || 
                                 window.location.pathname.endsWith('/about.html') ||
                                 window.location.pathname.endsWith('/privacy.html') ||
                                 window.location.pathname.endsWith('/terms.html');
            const detailPath = isInPagesDir ? '../detail.html' : 'detail.html';
            
            
            searchResults.innerHTML = results.slice(0, 5).map(game => `
                <a href="${detailPath}?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="search-result-item">
                    <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'">
                    <div class="search-result-info">
                        <h4>${game.name}</h4>
                        <p>${game.downloads || 0}+ Play</p>
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

    
    const categoryNameMap = {
        'action': 'Action',
        'adventure': 'Adventure',
        'racing': 'Racing',
        'puzzle': 'Puzzle',
        'sports': 'Sports',
        'kids': 'Kids',
        'girl': 'Girls'
    };

    
    function initializeCategoriesMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const categoriesMenu = document.getElementById('categoriesMenu');
        const categoriesOverlay = document.getElementById('categoriesOverlay');
        const closeCategories = document.getElementById('closeCategories');
        const categoriesMenuItems = document.getElementById('categoriesMenuItems');

        if (!menuToggle || !categoriesMenu || !closeCategories) {
            return;
        }

        menuToggle.addEventListener('click', () => {
            categoriesMenu.classList.add('active');
            if (categoriesOverlay) {
                categoriesOverlay.classList.add('active');
            }
        });

        closeCategories.addEventListener('click', () => {
            categoriesMenu.classList.remove('active');
            if (categoriesOverlay) {
                categoriesOverlay.classList.remove('active');
            }
        });

        if (categoriesOverlay) {
            categoriesOverlay.addEventListener('click', () => {
                categoriesMenu.classList.remove('active');
                categoriesOverlay.classList.remove('active');
            });
        }

        
        function generateCategoriesMenuItems(categoryOrder) {
            if (!categoriesMenuItems || !categoryOrder || categoryOrder.length === 0) {
                return;
            }

            let menuHTML = '';
            let totalCount = gameDetailsData.length;
            const homeCategoryCount = document.getElementById('homeCategoryCount');
            if (homeCategoryCount) {
                homeCategoryCount.textContent = totalCount;
            }

            
            categoryOrder.forEach(category => {
                const categoryGames = gameDetailsData.filter(game => game.category === category);
                const categoryName = categoryNameMap[category] || category;
                const count = categoryGames.length;
                
                menuHTML += `
                    <div class="category-item" data-category="${category}">
                        <span class="category-name">${categoryName}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `;
            });

            categoriesMenuItems.innerHTML = menuHTML;

            const allCategoryItems = document.querySelectorAll('.category-item');
            allCategoryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.dataset.category;
                    if (category !== 'home') {
                        window.location.href = `category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
                    } else {
                        window.location.href = '../index.html' + (window.channel ? '?channel=' + window.channel : '');
                    }
                    categoriesMenu.classList.remove('active');
                    if (categoriesOverlay) {
                        categoriesOverlay.classList.remove('active');
                    }
                });
            });
        }
        return generateCategoriesMenuItems;
    }

    
    function initializeCategoryPage() {
        const categoryTitle = document.getElementById('categoryTitle');
        const gamesGrid = document.getElementById('gamesGrid');
        const backButton = document.getElementById('backButton');

        if (!categoryTitle || !gamesGrid) {
            
            return null;
        }

        
        if (backButton) {
            backButton.addEventListener('click', () => {
                const homePath = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
                window.location.href = homePath + (window.channel ? '?channel=' + window.channel : '');
            });
        }

        
        function loadCategoryPage(data) {
            const category = getUrlParameter('category');
            if (!category) {
                
                window.location.href = '../index.html' + (window.channel ? '?channel=' + window.channel : '');
                return;
            }

            const gameData = data || gameDetailsData;

            
            if (!gameData || gameData.length === 0) {
                
                categoryTitle.textContent = 'Loading...';
                gamesGrid.innerHTML = '<div class="no-results"><h3>Loading...</h3><p>Please wait while games are loading</p></div>';
                return;
            }

            
            const categoryName = categoryNameMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
            categoryTitle.textContent = `${categoryName} game`;
            
            const games = gameData.filter(game => {
                const gameCategory = game.category ? game.category.toLowerCase() : '';
                const targetCategory = category.toLowerCase();
                return gameCategory === targetCategory;
            });
            
            const categoryCount = document.getElementById('categoryCount');
            if (categoryCount) {
                categoryCount.textContent = `${games.length} games`;
            }

            if (games.length === 0) {
                gamesGrid.innerHTML = '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
                return;
            }

            
            const sortedGames = games.sort((a, b) => (a.id || 0) - (b.id || 0));
            const detailPath = window.location.pathname.includes('/pages/') ? '../detail.html' : 'detail.html';
            const gamesHTML = sortedGames.map(game => {
                return `
                <a href="${detailPath}?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="game-card">
                    <img src="${game.image}" alt="${game.name}" onerror="console.log('Image failed to load:', this.src)">
                    <div class="game-card-content">
                        <h3 class="game-title">${game.name}</h3>
                        <div class="game-play-count">${game.downloads || 0}+ Play</div>
                    </div>
                    <div class="play-button">Play</div>
                </a>
            `;
            }).join('');
            
            gamesGrid.innerHTML = gamesHTML;
            
        }
        return loadCategoryPage;
    }

    
    async function initializePage() {
        initializeSearch();
        
        const hasCategoriesMenu = document.getElementById('categoriesMenu') && 
                                  document.getElementById('menuToggle') && 
                                  document.getElementById('closeCategories');
        
        
        let generateMenuItems = null;
        if (hasCategoriesMenu) {
            generateMenuItems = initializeCategoriesMenu();
        }
        
        
        let loadCategoryPageFn = null;
        if (document.getElementById('categoryTitle') && document.getElementById('gamesGrid')) {
            loadCategoryPageFn = initializeCategoryPage();
        }
        
        
        try {
            gameDetailsData = await loadGameData();
            
        } catch (error) {
            gameDetailsData = [];
        }
        
        
        if (loadCategoryPageFn) {
            loadCategoryPageFn(gameDetailsData);
        }

        
        if (generateMenuItems && hasCategoriesMenu) {
            try {
                const { getCategoryOrder } = await import('./BaseURL.js');
                const categoryOrder = await getCategoryOrder();
                if (categoryOrder && categoryOrder.length > 0) {
                    generateMenuItems(categoryOrder);
                    
                } else {
                    
                }
            } catch (error) {
                
            }
        }
    }

    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }
})();

