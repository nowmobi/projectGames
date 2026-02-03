
import { loadGameData, getInfoType, Category_URL, loadCategoryData } from './BaseURL.js';
import { initMenu, initChannel, getCategoryNames } from './inpublic.js';

let gameDetails = [];


let searchInput;
let searchBtn;
let homepageGameGrid;

let categoryGrids = {};

function displaySearchResults(games) {
    if (!homepageGameGrid) return;
    
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.textContent = 'Search Results';
    }
    
    
    const categorySections = document.querySelectorAll('.category-section');
    categorySections.forEach((section, index) => {
        if (index === 0) {
            
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    if (games.length === 0) {
        homepageGameGrid.innerHTML = '<div class="no-results"><h3>No games found</h3><p>Try searching with different keywords</p></div>';
        return;
    }

    homepageGameGrid.innerHTML = games.map(game => generateGameCardHTML(game)).join('');
}


function generateHomepageGames() {
    if (!homepageGameGrid) return;
    
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.textContent = 'Featured Games';
    }
    
    
    const categorySections = document.querySelectorAll('.category-section');
    categorySections.forEach(section => {
        section.style.display = 'block';
    });

   
    const validGames = gameDetails.filter(game => 
        game && 
        game.id && 
        game.name && 
        typeof game.id === 'number' && 
        game.id > 0
    );

   
    const shuffledGames = [...validGames].sort(() => Math.random() - 0.5);
    const selectedGames = shuffledGames.slice(0, 4);

    homepageGameGrid.innerHTML = selectedGames.map(game => generateGameCardHTML(game, true)).join('');
}




async function generateCategorySections() {
    const infoType = getInfoType();
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    
    const allSections = mainContent.querySelectorAll('.category-section');
    if (!allSections || allSections.length < 2) {
        return;
    }

    
    
    const categorySections = Array.from(allSections).slice(1);
    
    try {
        const data = await loadCategoryData();
        
        
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][infoType]) {
            const infoTypeData = data[0][infoType];
            
            if (Array.isArray(infoTypeData) && infoTypeData.length > 0) {
                
                const categoryNames = await getCategoryNames();

                
                infoTypeData.forEach((category, index) => {
                    if (typeof category !== 'string') return;
                    
                    
                    if (index >= categorySections.length) return;
                    
                    const section = categorySections[index];
                    
                    
                    section.style.display = 'block';
                    
                    
                    let sectionHeader = section.querySelector('.section-header');
                    if (!sectionHeader) {
                        sectionHeader = document.createElement('div');
                        sectionHeader.className = 'section-header';
                        section.appendChild(sectionHeader);
                    }
                    
                    let sectionTitle = sectionHeader.querySelector('.section-title');
                    if (!sectionTitle) {
                        sectionTitle = document.createElement('h2');
                        sectionTitle.className = 'section-title';
                        sectionHeader.appendChild(sectionTitle);
                    }
                    sectionTitle.textContent = categoryNames[category] || `${category.charAt(0).toUpperCase() + category.slice(1)} Games`;
                    
                    let sectionRight = sectionHeader.querySelector('.section-right');
                    if (!sectionRight) {
                        sectionRight = document.createElement('div');
                        sectionRight.className = 'section-right';
                        sectionHeader.appendChild(sectionRight);
                    }
                    
                    let moreLink = sectionRight.querySelector('.section-more');
                    if (!moreLink) {
                        moreLink = document.createElement('a');
                        moreLink.className = 'section-more';
                        moreLink.textContent = 'MORE';
                        sectionRight.appendChild(moreLink);
                    }
                    moreLink.href = `pages/category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
                    
                    
                    let gameGrid = section.querySelector('.game-grid');
                    if (!gameGrid) {
                        gameGrid = document.createElement('div');
                        gameGrid.className = 'game-grid';
                        section.appendChild(gameGrid);
                    }
                    gameGrid.id = `${category}GamesGrid`;
                    
                    
                    categoryGrids[category] = gameGrid;
                });
                
                
                for (let i = infoTypeData.length; i < categorySections.length; i++) {
                    categorySections[i].style.display = 'none';
                }
                
                }
        }
    } catch (error) {
        }
}



function parseDownloads(downloadsStr) {
    if (typeof downloadsStr !== 'string') return 0;
    if (downloadsStr.includes('K')) {
        return parseFloat(downloadsStr.replace('K', '')) * 1000;
    } else if (downloadsStr.includes('M')) {
        return parseFloat(downloadsStr.replace('M', '')) * 1000000;
    }
    return parseFloat(downloadsStr) || 0;
}


function generateGameCardHTML(game, useHomepageCard = false) {
    const stars = '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating);
    const cardClass = useHomepageCard ? 'homepage-game-card' : 'game-card';
    const imgClass = useHomepageCard ? 'homepage-game-image' : '';
    const titleClass = useHomepageCard ? '' : 'game-title';
    
    return `
        <div class="${cardClass}" onclick="window.location.href='detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}'">
            <img src="${game.image}" alt="${game.name}" ${imgClass ? `class="${imgClass}"` : ''} loading="lazy">
            <h3 ${titleClass ? `class="${titleClass}"` : ''}>${game.name}</h3>
            <div class="homepage-game-info">
                <div class="homepage-game-rating">
                    <span class="stars">${stars}</span>
                </div>
            </div>
        </div>
    `;
}


function generateCategoryGames(category, gridElement) {
    if (!gridElement) return;
    const categoryGames = gameDetails.filter(game => game.category === category);
    
   
    const shuffledGames = [...categoryGames].sort(() => Math.random() - 0.5);
    
   
    const games = shuffledGames.slice(0, 4);
    gridElement.innerHTML = games.map(game => generateGameCardHTML(game)).join('');
}


function toggleSearchIcon(isSearching) {
    if (!searchBtn) return;
    
    const svg = searchBtn.querySelector('svg');
    if (!svg) return;
    
    if (isSearching) {
        
        svg.innerHTML = `
            <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
        searchBtn.classList.add('clear-btn');
    } else {
        
        svg.innerHTML = `
            <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="white" stroke-width="2" stroke-linecap="round"/>
        `;
        searchBtn.classList.remove('clear-btn');
    }
}


function clearSearch() {
    if (!searchInput) return;
    
    searchInput.value = '';
    toggleSearchIcon(false);
    
    
    generateHomepageGames();
    
    Object.keys(categoryGrids).forEach(category => {
        if (categoryGrids[category]) {
            generateCategoryGames(category, categoryGrids[category]);
        }
    });
    
    
    const categorySections = document.querySelectorAll('.category-section');
    categorySections.forEach(section => {
        section.style.display = 'block';
    });
}


function performSearch() {
    if (!searchInput || !homepageGameGrid || !gameDetails || gameDetails.length === 0) {
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearSearch();
        return;
    }

    const filteredGames = gameDetails.filter(game => 
        (game.name && game.name.toLowerCase().includes(searchTerm)) ||
        (game.description && game.description.toLowerCase().includes(searchTerm))
    );
    
    displaySearchResults(filteredGames);
    
    
    toggleSearchIcon(true);
    
    
    const categorySections = document.querySelectorAll('.category-section');
    categorySections.forEach((section, index) => {
        if (index > 0) { 
            section.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    
    searchInput = document.getElementById('searchInput');
    searchBtn = document.querySelector('.search-btn');
    homepageGameGrid = document.getElementById('homepageGameGrid');
    
    
    await initMenu();
    initChannel();
    
    
    gameDetails = await loadGameData();
    
    
    await generateCategorySections();
    
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            
            if (searchBtn.classList.contains('clear-btn')) {
                clearSearch();
            } else {
                
                performSearch();
            }
        });
    }

    
    if (searchInput) {
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            
            if (searchTerm === '') {
                clearSearch();
            } else {
                performSearch();
            }
        });
    }
    
    
    generateHomepageGames();
    
    
    Object.keys(categoryGrids).forEach(category => {
        if (categoryGrids[category]) {
            generateCategoryGames(category, categoryGrids[category]);
        }
    });
});

