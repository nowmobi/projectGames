import { loadGameData, getCategoryOrder } from './BaseURL.js';

let gameDetailsData = [];

const menuToggle = document.getElementById('menuToggle');
const categoriesMenu = document.getElementById('categoriesMenu');
const categoriesOverlay = document.getElementById('categoriesOverlay');
const closeCategories = document.getElementById('closeCategories');
const mainContent = document.getElementById('mainContent');
const categoriesMenuItems = document.getElementById('categoriesMenuItems');


let categoriesMenuEventBound = false;

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createGameCardHTML(game) {
    return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="homepage-game-card">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.style.opacity='1';">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="homepage-game-card-content mt-5">
                <p class="homepage-game-title lh2">${game.name}</p>
                <div class="homepage-game-play-count lh2">${game.downloads}+ Play</div>
                <div class="homepage-play-button">Play</div>
            </div>
        </a>
    `;
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


function generateCategorySectionContent(category, isFirst = false) {
    const categoryGames = gameDetailsData.filter(game => game.category === category);
    const randomGames = shuffleArray(categoryGames).slice(0, 6);
    const categoryName = categoryNameMap[category] || category;
    
    if (randomGames.length === 0) {
        return '';
    }

    const sectionId = `${category}GamesGrid`;
    
    return `
        <div class="section-header">
            <h2 class="section-title ${isFirst ? 'base1' : ''}" data-category="${category}">${categoryName} game</h2>
        </div>
        <div class="homepage-game-grid" id="${sectionId}">
            ${randomGames.map(game => createGameCardHTML(game)).join('')}
        </div>
    `;
}


function generateAllCategorySections(categoryOrder) {
    if (!mainContent || !categoryOrder || categoryOrder.length === 0) {
        return;
    }

   
    const categorySections = mainContent.querySelectorAll('.category-section');
    categorySections.forEach((section, index) => {
        if (index < categoryOrder.length) {
            const category = categoryOrder[index];
            const categoryContent = generateCategorySectionContent(category, index === 0);
            if (categoryContent) {
                section.innerHTML = categoryContent;
            }
        }
    });
}


function generateCategoriesMenu(categoryOrder) {
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
   
   
    if (!categoriesMenuEventBound) {
        categoriesMenu.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (!categoryItem) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const category = categoryItem.dataset.category;

            categoriesMenu.classList.remove('active');
            if (categoriesOverlay) {
                categoriesOverlay.classList.remove('active');
            }
            
           
            if (category === 'home') {
                return;
            }
           
            const categoryUrl = `pages/category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
            window.location.href = categoryUrl;
        });
        categoriesMenuEventBound = true;
    }
}



menuToggle.addEventListener('click', () => {
    categoriesMenu.classList.add('active');
    categoriesOverlay.classList.add('active');
});

closeCategories.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
    categoriesOverlay.classList.remove('active');
});

categoriesOverlay.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
    categoriesOverlay.classList.remove('active');
});

function bindSectionTitleEvents() {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.addEventListener('click', () => {
            const category = title.dataset.category;
            if (category) {
                window.location.href = `pages/category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    gameDetailsData = await loadGameData();
    if (gameDetailsData && gameDetailsData.length > 0) {
        const categoryOrder = await getCategoryOrder();
        if (categoryOrder && categoryOrder.length > 0) {
            generateAllCategorySections(categoryOrder);
            bindSectionTitleEvents();
            generateCategoriesMenu(categoryOrder);
        }
    }
});

document.addEventListener('click', (e) => {
    if (categoriesMenu && menuToggle && !categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        categoriesMenu.classList.remove('active');
        if (categoriesOverlay) {
            categoriesOverlay.classList.remove('active');
        }
    }
});

