




function getUrlParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}


function parseDownloads(downloadsStr) {
    if (typeof downloadsStr === 'string') {
        if (downloadsStr.includes('K')) {
            return parseFloat(downloadsStr.replace('K', '')) * 1000;
        } else if (downloadsStr.includes('M')) {
            return parseFloat(downloadsStr.replace('M', '')) * 1000000;
        } else {
            return parseFloat(downloadsStr) || 0;
        }
    }
    return 0;
}


import { loadGameData, Category_URL, getInfoType, loadCategoryData } from './BaseURL.js';

export async function getCategoryNames() {
    try {
        const data = await loadCategoryData();
        
        
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0].info2) {
            const info2Data = data[0].info2;
            if (typeof info2Data === 'object' && info2Data !== null && !Array.isArray(info2Data)) {
                return info2Data;
            }
        }
        
        return getDefaultCategoryNames();
    } catch (error) {
        return getDefaultCategoryNames();
    }
}


export function getDefaultCategoryNames() {
    return {
        'puzzle': 'Puzzle Games',
        'action': 'Action Games',
        'adventure': 'Adventure Games',
        'racing': 'Racing Games',
        'sports': 'Sports Games',
        'kids': 'Kids Games',
        'girl': 'Girls Games'
    };
}


export async function initCategoryPage() {
    
    const gameDetails = await loadGameData();
    
    const categoryTitle = document.getElementById('categoryTitle');
    const gamesGrid = document.getElementById('gamesGrid');

    async function loadCategoryPage() {
        const category = getUrlParameter('category');
        if (!category) {
            window.location.href = '../index.html' + (window.channel ? `?channel=${window.channel}` : '');
            return;
        }

        
        const categoryNames = await getCategoryNames();
        const categoryName = categoryNames[category] || `${category.charAt(0).toUpperCase() + category.slice(1)} Games`;
        
        if (categoryTitle) {
            categoryTitle.textContent = categoryName;
        }

        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === category) {
                item.classList.add('active');
            }
        });

        generateGamesList(category);
    }

    function generateGamesList(category) {
        const games = gameDetails.filter(game => game.category === category)
            .sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads));
        displayGames(games);
    }

    function displayGames(games) {
        if (!gamesGrid) return;
        
        if (games.length === 0) {
            gamesGrid.innerHTML = '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
            return;
        }

        gamesGrid.innerHTML = games.map(game => {
            const stars = '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating);
            return `
                <div class="game-card" onclick="window.location.href='../detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}'">
                    <img src="${game.image}" alt="${game.name}" loading="lazy">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="homepage-game-info">
                        <div class="homepage-game-rating">
                            <span class="stars">${stars}</span>
                        </div>
                        
                    </div>
                </div>
            `;
        }).join('');
    }

    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadCategoryPage();
        });
    } else {
        
        loadCategoryPage();
    }
}


async function getSidebarDataFromInfoType() {
    const infoType = getInfoType(); 
    try {
        const data = await loadCategoryData();
        
        
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][infoType]) {
            const infoTypeData = data[0][infoType];
            
            if (Array.isArray(infoTypeData) && infoTypeData.length > 0) {
                const items = infoTypeData.map((item) => {
                    if (typeof item === 'string') {
                        
                        return { key: item, name: item };
                    } else if (typeof item === 'object' && item !== null) {
                        
                        const key = item.key || item.id || item.category || item.value || item;
                        const name = item.name || item.title || item.label || item.text || key;
                        return { key: key, name: name };
                    }
                    return null;
                }).filter(item => item !== null);
                
                return { items: items };
            }
        }
        
        return { items: [] };
    } catch (error) {
        return { items: [] };
    }
}


async function generateCategoryMenu() {
    const categoriesMenu = document.getElementById('categoriesMenu');
    if (!categoriesMenu) return;

    
    const sidebarData = await getSidebarDataFromInfoType();
    
    
    const categoriesHeader = categoriesMenu.querySelector('.categories-header');
    if (!categoriesHeader) return;

    
    const existingItems = categoriesMenu.querySelectorAll('.category-item');
    existingItems.forEach(item => {
        if (item.dataset.category !== 'home') {
            item.remove();
        }
    });

    
    const homeItem = categoriesMenu.querySelector('.category-item[data-category="home"]');
    
    
    if (sidebarData.items && Array.isArray(sidebarData.items) && sidebarData.items.length > 0) {
        const currentInfoType = getInfoType();
        const categoryElements = [];
        sidebarData.items.forEach((item) => {
            if (!item || !item.key) return;
            if (item.key === 'home') return; 
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.setAttribute('data-category', item.key);
            
            const categoryName = document.createElement('span');
            categoryName.className = 'category-name';
            
            categoryName.textContent = item.name || item.key;
            
            categoryItem.appendChild(categoryName);
            categoryElements.push(categoryItem);
        });
        
        
        if (homeItem) {
            let insertAfter = homeItem;
            categoryElements.forEach((categoryItem) => {
                
                if (insertAfter.nextSibling) {
                    categoriesMenu.insertBefore(categoryItem, insertAfter.nextSibling);
                } else {
                    categoriesMenu.appendChild(categoryItem);
                }
                insertAfter = categoryItem; 
            });
        } else {
            categoryElements.forEach(categoryItem => {
                categoriesMenu.appendChild(categoryItem);
            });
        }
        
        } else {
        const currentInfoType = getInfoType();
        }
}


export async function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const categoriesMenu = document.getElementById('categoriesMenu');
    const closeCategories = document.getElementById('closeCategories');

    
    await generateCategoryMenu();

    
    const categoryItems = document.querySelectorAll('.category-item');

    if (menuToggle && categoriesMenu) {
        menuToggle.addEventListener('click', () => {
            categoriesMenu.classList.add('active');
        });
    }

    if (closeCategories && categoriesMenu) {
        closeCategories.addEventListener('click', () => {
            categoriesMenu.classList.remove('active');
        });
    }

    if (categoryItems.length > 0) {
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                
                const isInPages = window.location.pathname.includes('/pages/');
                const basePath = isInPages ? '../' : '';
                
                if (category === 'home') {
                    window.location.href = basePath + 'index.html' + (window.channel ? `?channel=${window.channel}` : '');
                } else {
                    if (isInPages) {
                        window.location.href = `category.html?category=${category}` + (window.channel ? `&channel=${window.channel}` : '');
                    } else {
                        window.location.href = `pages/category.html?category=${category}` + (window.channel ? `&channel=${window.channel}` : '');
                    }
                }
                if (categoriesMenu) {
                    categoriesMenu.classList.remove('active');
                }
            });
        });
    }

    
    document.addEventListener('click', (e) => {
        if (categoriesMenu && menuToggle && !categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            categoriesMenu.classList.remove('active');
        }
    });
}


export function initChannel() {
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
}


export async function initPages() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || '';
    
    
    await initMenu();
    initChannel();
    
    
    if (filename === 'category.html') {
        await initCategoryPage();
    }
    
}



(function() {
    const pathname = window.location.pathname;
    const isInPages = pathname.includes('/pages/');
    
    if (isInPages) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initPages();
            });
        } else {
            
            initPages();
        }
    }
})();

