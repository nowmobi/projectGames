import { loadGameData, getImgUrl, getGameUrl } from './BaseURL.js';

let gameDetailsData = [];

function createDefaultGameDetail(gameId) {
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        description: 'Game description not available.',
        category: 'action',
        downloads: '0',
        tag: 'action, game',
        image: getImgUrl({ id: gameId })
    };
}

function getTagHTML(game) {
    const tags = game.tags || game.tag;
    
    if (!tags) {
        return '<span class="tag-item">No tags available</span>';
    }
    
    let tagArray = [];
    
    if (Array.isArray(tags)) {
        tagArray = tags;
    } else if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    if (tagArray.length === 0) {
        return '<span class="tag-item">No tags available</span>';
    }
    
    return tagArray.map(tag => {
        const trimmedTag = typeof tag === 'string' ? tag.trim() : String(tag);
        if (!trimmedTag) return '';
        return `
            <span class="tag-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill="var(--color1)"/>
                    <line x1="7" y1="7" x2="7.01" y2="7" stroke="var(--color1)" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span class="tag-text">${trimmedTag}</span>
            </span>
        `;
    }).join('');
}

const gameDetailContainer = document.getElementById('gameDetailContainer');
const recommendedGames = document.getElementById('recommendedGames');
const backButton = document.getElementById('backButton');

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadGameDetail() {
    const gameId = getUrlParameter('id');

    if (!gameId) {
        window.location.href = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
        return;
    }

   
    if (gameDetailsData.length === 0) {
        gameDetailsData = await loadGameData();
    }

   
    const numericId = parseInt(gameId, 10);
    const game = gameDetailsData.find(game => game.id === numericId);

    if (!game) {
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
    generateRecommendedGames(game);
}

function displayGameDetail(game) {
    if (!gameDetailContainer) {
        return;
    }

    
    const gameUrl = getGameUrl(game.id);

    gameDetailContainer.innerHTML = `
        <div class="game-detail">
            <div class="game-header">
                <div class="game-info">
                    <h1 class="game-title">${game.name}</h1>
                    <div class="game-meta">
                        <div class="game-category">type：${game.category}</div>
                        <div class="game-played-by">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="var(--color1)"/>
                            </svg>
                            <span>${game.playedByCount || '0'}</span>
                        </div>
                    </div>
                </div>
                <div class="game-image">
                    <a href="${gameUrl}" class="play-image-link">
                        <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="game-image-fallback" style="display: none; width: 100%; height: 100%; background: #20b2aa; color: white; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; text-align: center; line-height: 1.2;">
                            ${game.name}
                        </div>
                        <div class="play-overlay">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5v14l11-7z" fill="white"/>
                            </svg>
                            <span>Play Now</span>
                        </div>
                    </a>
                </div>
                <div class="game-tags">
                    <div class="tag-list">
                        ${getTagHTML(game)}
                    </div>
                </div>
            </div>
            
            <div class="game-details-section">
                <button class="details-toggle">
                    <span class="toggle-text">View Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="details-content">
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Rating:</span>
                            <div class="rating">
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                                <span class="star filled">★</span>
                            </div>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Downloads:</span>
                            <span class="stat-value">${game.downloads || '0'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Updated:</span>
                            <span class="stat-value">${game.update_time || 'Unknown'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Description:</span>
                            <span class="stat-value description-text">${game.description || 'No description available'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加事件监听器
    const toggleButton = gameDetailContainer.querySelector('.details-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('svg');
            const toggleText = this.querySelector('.toggle-text');
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
                toggleText.textContent = 'View Details';
            } else {
                content.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
                toggleText.textContent = 'Hide Details';
            }
        });
    }
}

const gameCategories = {
    'puzzle': () => gameDetailsData.filter(game => game.category === 'puzzle'),
    'action': () => gameDetailsData.filter(game => game.category === 'action'),
    'adventure': () => gameDetailsData.filter(game => game.category === 'adventure'),
    'racing': () => gameDetailsData.filter(game => game.category === 'racing'),
    'sports': () => gameDetailsData.filter(game => game.category === 'sports'),
    'kids': () => gameDetailsData.filter(game => game.category === 'kids'),
    'girl': () => gameDetailsData.filter(game => game.category === 'girl')
};

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateRecommendedGames(currentGame) {
    if (!recommendedGames) {
        return;
    }
    
    try {
        recommendedGames.innerHTML = '';
        const availableCategories = Object.keys(gameCategories);
        const randomCategoryName = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const categoryGames = gameCategories[randomCategoryName]().filter(game => game.id !== currentGame.id);

        if (categoryGames.length === 0) {
            const allOtherGames = gameDetailsData.filter(game => game.id !== currentGame.id);
            const shuffledAllGames = shuffleArray(allOtherGames);
            const recommended = shuffledAllGames.slice(0, 15);

            if (recommended.length > 0) {
                generateRecommendedHTML(recommended, 'mixed');
            } else {
                recommendedGames.innerHTML = '<div class="no-recommendations">No recommendations available</div>';
            }
            return;
        }

        const shuffledCategoryGames = shuffleArray(categoryGames);
        const recommended = shuffledCategoryGames.slice(0, 15);
        generateRecommendedHTML(recommended, randomCategoryName);
        
    } catch (error) {
        recommendedGames.innerHTML = '<div class="error-message">Error loading recommendations</div>';
    }
}

function generateRecommendedHTML(games, categoryName) {
    const gameHTML = games.map(game => `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="recommended-game" data-game-id="${game.id}">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.classList.add('loaded');"
                     loading="lazy">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="recommended-game-content">
                <h3>${game.name}</h3>
            </div>
        </a>
    `).join('');
    
    recommendedGames.innerHTML = gameHTML;
}

function initializeEventListeners() {
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
   
    gameDetailsData = await loadGameData();
    initializeEventListeners();
    await loadGameDetail();
});

