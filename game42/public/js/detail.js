import { loadGameData, getGameDetail, getGameUrl } from './BaseURL.js';
import { initSearch, getUrlParameter } from './inpublic.js';

let gameDetails = [];

const gameDetailContainer = document.getElementById('gameDetailContainer');
const backBtn = document.getElementById('backBtn');

function createDefaultGameDetail(gameId) {
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        description: 'Game description not available.',
        category: 'action',
        downloads: '0',
        image: ''
    };
}

function loadGameDetail() {
    const gameId = getUrlParameter('id');
    if (!gameId) {
        window.location.href = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
        return;
    }

   
    const numericId = parseInt(gameId, 10);
    const game = gameDetails.find(g => g.id === numericId);
        
    if (!game) {
       
        const baseGame = getGameDetail(gameId);
        if (baseGame) {
            displayGameDetail(baseGame);
            return;
        }
       
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
}

function displayGameDetail(game) {
    if (!gameDetailContainer) {
        return;
    }
    
    gameDetailContainer.innerHTML = `
        <div class="game-detail">
            <div class="game-header">
                <h1 class="game-title">${game.name}</h1>
                <div class="game-image">
                    <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="game-image-fallback">
                        ${game.name}
                    </div>
                </div>
                <div class="game-info">
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
                <a href="${getGameUrl(game.id)}?${window.channel ? 'channel=' + window.channel : ''}" class="play-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                    Play Now
                </a>
            </div>
        </div>
    `;

    generateRecommendedGames(game.id);
}

function generateRecommendedGames(currentGameId) {
    if (!gameDetails || gameDetails.length === 0) {
        return;
    }
    
   
    const validGames = gameDetails.filter(game => {
        return game && 
               game.id !== null && 
               game.id !== undefined && 
               !isNaN(Number(game.id)) && 
               Number(game.id) !== Number(currentGameId) &&
               game.name && 
               String(game.name).trim().length > 0;
    });
    
    if (validGames.length === 0) {
        return;
    }
    
    const shuffledGames = validGames.sort(() => Math.random() - 0.5);
    const recommendedGames = shuffledGames.slice(0, 4);
    
    const recommendedGamesGrid = document.getElementById('recommendedGamesGrid');
    if (recommendedGamesGrid) {
        recommendedGamesGrid.innerHTML = recommendedGames.map(game => `
            <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="recommended-game-card">
                <img src="${game.image}" alt="${game.name}">
                <div class="recommended-game-title">${game.name}</div>
            </a>
        `).join('');
    }
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        const homeUrl = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
        window.location.href = homeUrl;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        gameDetails = await loadGameData();
       
        loadGameDetail();
       
        await initSearch();
    } catch (error) {
        loadGameDetail();
       
        try {
            await initSearch();
        } catch (searchError) {
            console.error('Failed to init search:', searchError);
        }
    }
});

