import { loadGameData, getCategoryOrder } from './BaseURL.js';
import { initSearch } from './inpublic.js';

let gameDetails = [];
let categoryOrder = [];

const menuToggle = document.getElementById('menuToggle');
const closeCategories = document.getElementById('closeCategories');

const recommendedGamesGrid = document.getElementById('recommendedGamesGrid');
const categoriesMenu = document.getElementById('categoriesMenu');
const mainContent = document.querySelector('.main-content');


function updateGridVariable(category, gridElement) {
    const gridIdMap = {
        'action': 'actionGamesGrid',
        'adventure': 'adventureGamesGrid',
        'racing': 'racingGamesGrid',
        'puzzle': 'puzzleGamesGrid',
        'sports': 'sportsGamesGrid',
        'kids': 'kidsGamesGrid',
        'girl': 'girlGamesGrid'
    };
    const gridId = gridIdMap[category];
    if (gridId) {
        window[gridId] = gridElement;
    }
}


function generateGameCardHTML(game) {
    return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="homepage-game-card">
            <img src="${game.image}" alt="${game.name}">
            <div class="homepage-game-card-content">
                <p class="homepage-game-title lh2">${game.name}</p>
            </div>
        </a>
    `;
}


function getCategoryInfo() {
    return {
        'action': { name: 'Action game', generator: generateActionGames },
        'adventure': { name: 'Adventure game', generator: generateAdventureGames },
        'racing': { name: 'Racing game', generator: generateRacingGames },
        'puzzle': { name: 'Puzzle game', generator: generatePuzzleGames },
        'sports': { name: 'Sports game', generator: generateSportsGames },
        'kids': { name: 'Kids game', generator: generateKidsGames },
        'girl': { name: 'Girls game', generator: generateGirlGames },
        'recommended': { name: 'Recommend', generator: generateRecommendedGames }
    };
}


function generateCategoryGames(category, gridId) {
   
    const camelCaseId = gridId.charAt(0).toLowerCase() + gridId.slice(1);
    const grid = window[camelCaseId] || document.getElementById(gridId);
    if (!grid) return;
    const games = gameDetails.filter(game => game.category === category)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    grid.innerHTML = games.map(generateGameCardHTML).join('');
}

function generatePuzzleGames() {
    generateCategoryGames('puzzle', 'puzzleGamesGrid');
}

function generateActionGames() {
    generateCategoryGames('action', 'actionGamesGrid');
}

function generateAdventureGames() {
    generateCategoryGames('adventure', 'adventureGamesGrid');
}

function generateRacingGames() {
    generateCategoryGames('racing', 'racingGamesGrid');
}

function generateSportsGames() {
    generateCategoryGames('sports', 'sportsGamesGrid');
}

function generateKidsGames() {
    generateCategoryGames('kids', 'kidsGamesGrid');
}

function generateGirlGames() {
    generateCategoryGames('girl', 'girlGamesGrid');
}

function generateRecommendedGames() {
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }
    
   
    const validGames = gameDetails.filter(game => {
        return game && 
               game.id !== null && 
               game.id !== undefined && 
               !isNaN(Number(game.id)) && 
               game.name && 
               String(game.name).trim().length > 0;
    });
    
    if (validGames.length === 0) {
        return;
    }
    
    const shuffledGames = [...validGames].sort(() => 0.5 - Math.random());
    const recommendedGames = shuffledGames.slice(0, 4);
    
    recommendedGamesGrid.innerHTML = recommendedGames.map(generateGameCardHTML).join('');
}


menuToggle.addEventListener('click', () => {
    categoriesMenu.classList.add('active');
});

closeCategories.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
});


function generateSidebarCategories(categories) {
    if (!categoriesMenu) return;
    
    const categoriesHeader = categoriesMenu.querySelector('.categories-header');
   
    const existingItems = categoriesMenu.querySelectorAll('.category-item');
    existingItems.forEach(item => item.remove());
    
   
    const homeItem = document.createElement('div');
    homeItem.className = 'category-item active';
    homeItem.setAttribute('data-category', 'home');
    homeItem.innerHTML = `
        <span class="category-name">Home</span>
        <span class="category-count">${gameDetails.length}</span>
    `;
    homeItem.addEventListener('click', () => {
        categoriesMenu.classList.remove('active');
    });
    categoriesHeader.after(homeItem);
    
    const recommendItem = document.createElement('div');
    recommendItem.className = 'category-item';
    recommendItem.setAttribute('data-category', 'recommended');
    recommendItem.innerHTML = `
        <span class="category-name">Recommend</span>
        <span class="category-count">${gameDetails.length}</span>
    `;
    recommendItem.addEventListener('click', () => {
        window.location.href = `pages/category.html?category=recommended` + (window.channel ? '&channel=' + window.channel : '');
        categoriesMenu.classList.remove('active');
    });
    homeItem.after(recommendItem);
    
   
    const categoryInfo = getCategoryInfo();
    let lastItem = recommendItem;
    
    categories.forEach((category) => {
        if (category === 'recommended') return;
        
       
        const categoryLower = String(category).toLowerCase().trim();
        
        const count = gameDetails.filter(game => {
            const gameCategory = String(game.category || '').toLowerCase().trim();
            return gameCategory === categoryLower;
        }).length;
        
        const categoryName = categoryInfo[categoryLower]?.name || category.charAt(0).toUpperCase() + category.slice(1) + ' game';
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.setAttribute('data-category', categoryLower);
        item.innerHTML = `
            <span class="category-name">${categoryName.replace(' game', '')}</span>
            <span class="category-count">${count}</span>
        `;
        item.addEventListener('click', () => {
            window.location.href = `pages/category.html?category=${categoryLower}` + (window.channel ? '&channel=' + window.channel : '');
            categoriesMenu.classList.remove('active');
        });
        
       
        lastItem.after(item);
        lastItem = item;
    });
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('section-title') || e.target.closest('.section-title')) {
        const title = e.target.classList.contains('section-title') ? e.target : e.target.closest('.section-title');
        const category = title.dataset.category;
        if (category) {
            window.location.href = `pages/category.html?category=${category}` + (window.channel ? '&channel=' + window.channel : '');
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
       
        const [gameData, categories] = await Promise.all([
            loadGameData(),
            getCategoryOrder()
        ]);
        
        gameDetails = gameData;
        
       
        if (Array.isArray(categories) && categories.length > 0) {
           
            categoryOrder = categories.filter(cat => typeof cat === 'string' && cat.trim().length > 0);
        } else {
           
            categoryOrder = ['puzzle', 'action', 'adventure', 'racing', 'sports', 'kids', 'girl'];
        }
        
        if (gameDetails.length > 0) {
           
            generateRecommendedGames();
            
           
            generateSidebarCategories(categoryOrder);
            
           
            generateCategorySections(categoryOrder);
            
           
            const categoryInfo = getCategoryInfo();
            categoryOrder.forEach((category) => {
                const categoryLower = String(category).toLowerCase().trim();
                if (categoryInfo[categoryLower] && categoryInfo[categoryLower].generator) {
                    categoryInfo[categoryLower].generator();
                }
            });
            
           
            await initSearch();
        } else {
            console.warn('No game data loaded');
        }
    } catch (error) {
        console.error('Failed to load game data:', error);
    }
});


function generateCategorySectionContent(category, categoryInfo) {
    const categoryLower = String(category).toLowerCase().trim();
    const info = categoryInfo[categoryLower];
    
    if (!info) {
        return '';
    }
    
    const count = gameDetails.filter(game => {
        const gameCategory = String(game.category || '').toLowerCase().trim();
        return gameCategory === categoryLower;
    }).length;
    
    if (count === 0) {
        return '';
    }
    
   
    const gridId = categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1) + 'GamesGrid';
    
    return `
        <div class="section-header">
            <h2 class="section-title" data-category="${categoryLower}">${info.name}</h2>
        </div>
        <div class="homepage-game-grid" id="${gridId}"></div>
    `;
}


function generateCategorySections(categories) {
    if (!mainContent) return;
    
    const categoryInfo = getCategoryInfo();
    
   
    const emptySections = Array.from(mainContent.querySelectorAll('.category-section')).filter(section => {
       
        if (section.querySelector('#recommendedGamesGrid')) {
            return false;
        }
       
        const hasContent = section.querySelector('.section-header') || section.querySelector('.homepage-game-grid');
        return !hasContent;
    });
    
   
    let sectionIndex = 0;
    categories.forEach((category) => {
        if (category === 'recommended') return;
        
        if (sectionIndex >= emptySections.length) {
            return;
        }
        
        const section = emptySections[sectionIndex];
        const categoryLower = String(category).toLowerCase().trim();
        const content = generateCategorySectionContent(category, categoryInfo);
        
        if (content) {
            section.innerHTML = content;
            
           
            const gridId = categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1) + 'GamesGrid';
            const gridElement = document.getElementById(gridId);
            if (gridElement) {
                updateGridVariable(categoryLower, gridElement);
            }
            
            sectionIndex++;
        }
    });
}

document.addEventListener('click', (e) => {
    if (!categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        categoriesMenu.classList.remove('active');
    }
});

