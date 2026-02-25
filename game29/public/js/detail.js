import { loadGameData, getImgUrl, getGameUrl } from './BaseURL.js';

let gameDetailsData = [];

function createDefaultGameDetail(gameId) {
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        description: 'Game description not available.',
        category: 'action',
        downloads: '0',
        image: getImgUrl({ id: gameId })
    };
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
                <div class="game-image">
                    <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="game-image-fallback" style="display: none; width: 100%; height: 100%; background: #20b2aa; color: white; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; text-align: center; line-height: 1.2;">
                        ${game.name}
                    </div>
                </div>
                <div class="game-info">
                    <h1 class="game-title">${game.name}</h1>
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
                            <span class="stat-value">${game.downloads}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Category:</span>
                            <span class="stat-value">${game.category}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="game-description">
                <h2>Description</h2>
                <div class="description-content">
                    <p>${game.description}</p>
                </div>
            </div>
            
            <div class="game-actions">
                <a href="${gameUrl}" class="play-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                    Play Now
                </a>
                <a href="index.html${window.channel ? '?channel=' + window.channel : ''}" class="back-btn">Back to Home</a>
            </div>
        </div>
    `;
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
            const recommended = shuffledAllGames.slice(0, 4);

            if (recommended.length > 0) {
                generateRecommendedHTML(recommended, 'mixed');
            } else {
                recommendedGames.innerHTML = '<div class="no-recommendations">No recommendations available</div>';
            }
            return;
        }

        const shuffledCategoryGames = shuffleArray(categoryGames);
        const recommended = shuffledCategoryGames.slice(0, 4);
        generateRecommendedHTML(recommended, randomCategoryName);
        
    } catch (error) {
        recommendedGames.innerHTML = '<div class="error-message">Error loading recommendations</div>';
    }
}

function generateRecommendedHTML(games, categoryName) {
    const gameHTML = games.map(game => `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="recommended-game" data-game-id="${game.id}">
            <img src="${game.image}" alt="${game.name}" loading="lazy" onerror="this.style.display='none'">
            <h3>${game.name}</h3>
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

