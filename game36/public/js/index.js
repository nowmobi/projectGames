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
            <div class="homepage-game-card-content">
                <p class="homepage-game-title">${game.name}</p>
                <p class="homepage-game-meta">
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#666"/>
                        </svg>
                        <span class="played-by-count">${game.playedByCount || '0'} </span>
                        <span class="meta-label">Views</span>
                    </span>
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="update-time">${game.update_time || 'Unknown'}</span>
                        <span class="meta-label">Updated</span>
                    </span>
                </p>
            </div>
        </a>
    `;
}

function createGameCardWithDescriptionHTML(game) {
    return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="homepage-game-card-with-description">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.style.opacity='1';">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="homepage-game-card-content">
                <p class="homepage-game-title">${game.name}</p>
                <p class="homepage-game-description">${game.description ? game.description.substring(0, 50) + '...' : 'No description available'}</p>
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


function generateCategorySectionContent(category, isFirst = false, showDescription = false, showMetaFields = true) {
    const categoryGames = gameDetailsData.filter(game => game.category === category);
    const randomGames = shuffleArray(categoryGames).slice(0, showDescription ? 4 : 6);
    const categoryName = categoryNameMap[category] || category;
    
    if (randomGames.length === 0) {
        return '';
    }

    const sectionId = `${category}GamesGrid`;
    const gridClass = showDescription ? 'homepage-game-grid-with-description' : 'homepage-game-grid';
    const cardClass = showDescription ? 'homepage-game-card-with-description featured' : 'homepage-game-card';
    
    console.log(`Generating section for ${category}, showDescription: ${showDescription}`);
    
    const cardHTML = randomGames.map(game => {
        console.log(`Game: ${game.name}, has description: ${!!game.description}`);
        if (showDescription) {
            const categoryName = categoryNameMap[game.category] || game.category;
            const rating = game.rating || 0;
            const stars = Math.round(rating);
            const starHTML = Array(5).fill().map((_, i) => {
                return `<span class="star ${i < stars ? 'filled' : ''}">★</span>`;
            }).join('');
            return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="${cardClass}">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.style.opacity='1';">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="homepage-game-card-content">
                <p class="homepage-game-title">${game.name}</p>
                <p class="homepage-game-description">${game.description ? game.description.substring(0, 50) + '...' : 'No description available'}</p>
                <div class="homepage-game-rating">
                    <span class="rating-label">rating：</span>
                    <div class="stars">${starHTML}</div>
                </div>
                <div class="homepage-game-meta">
                    <span class="homepage-game-category">${categoryName}</span>
                    <span class="homepage-game-downloads">${game.downloads || '0'}</span>
                    ${showMetaFields ? `
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="var(--color1)"/>
                        </svg>
                        <span class="played-by-count">${game.playedByCount || '0'}</span>
                        <span class="meta-label">Views</span>
                    </span>
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="update-time">${game.update_time || 'Unknown'}</span>
                        <span class="meta-label">Updated</span>
                    </span>
                    ` : ''}
                </div>
            </div>
        </a>
    `;
        } else {
            return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="${cardClass}">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.style.opacity='1';">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="homepage-game-card-content">
                <p class="homepage-game-title">${game.name}</p>
                ${showMetaFields ? `
                <p class="homepage-game-meta">
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="var(--color1)"/>
                        </svg>
                        <span class="played-by-count">${game.playedByCount || '0'}</span>
                        <span class="meta-label">Views</span>
                    </span>
                    <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6V12L16 14M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="update-time">${game.update_time || 'Unknown'}</span>
                        <span class="meta-label">Updated</span>
                    </span>
                </p>
                ` : ''}
            </div>
        </a>
    `;
        }
    }).join('');
    
    return `
        <div class="section-header">
            <h2 class="section-title ${isFirst ? 'base1' : ''}" data-category="${category}">${categoryName} game</h2>
            <div class="section-tag">
                <img src="public/images/tag.svg" alt="Tag" width="40" height="40">
            </div>
        </div>
        <div class="${gridClass}" id="${sectionId}">
            ${cardHTML}
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
            // 检查是否是第1、3、5、7个section（索引为0、2、4、6）
            const showDescription = [0, 2, 4, 6].includes(index);
            // 第1、3、5、7个section（索引为0、2、4、6）不要添加playedByCount和update_time字段
            const showMetaFields = ![0, 2, 4, 6].includes(index);
            console.log(`Section ${index + 1}, showDescription: ${showDescription}, showMetaFields: ${showMetaFields}`);
            const categoryContent = generateCategorySectionContent(category, index === 0, showDescription, showMetaFields);
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

