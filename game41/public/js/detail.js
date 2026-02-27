import { getGameDetail, getGameUrl, getDataBaseUrl, getUrlParameter } from './BaseURL.js';
import { getGameDetails, buildUrlWithChannel, generateStarsHTML } from './inpublic.js';


function createDefaultGameDetail(gameId) {
    const baseUrl = getDataBaseUrl();
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        description: 'Game description not available',
        category: 'unknown',
        downloads: '0',
        image: `${baseUrl}/icons/${gameId}.jpg`
    };
}

const gameImage = document.getElementById('gameImage');
const gameNameFallback = document.getElementById('gameNameFallback');
const playButton = document.getElementById('playButton');
const gameTitle = document.getElementById('gameTitle');
const gameDownloads = document.getElementById('gameDownloads');
const gameCategory = document.getElementById('gameCategory');
const gameDescription = document.getElementById('gameDescription');
const gameRating = document.querySelector('.rating');

async function loadGameDetail() {
    const gameId = getUrlParameter('id');

    if (!gameId) {
        const indexPath = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        window.location.href = buildUrlWithChannel(indexPath, window.channel);
        return;
    }

   
    await getGameDetails();
    const game = getGameDetail(gameId);

    if (!game) {
        
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
}

function displayGameDetail(game) {

    if (gameImage) {
        const imagePath = game.image;

        gameImage.style.display = 'block';
        gameImage.nextElementSibling.style.display = 'none';
        
        gameImage.src = imagePath;
        gameImage.alt = game.name;

        gameImage.onerror = function() {
            this.style.display = 'none';
            this.nextElementSibling.style.display = 'flex';
        };
    }
    
    if (gameNameFallback) {
        gameNameFallback.textContent = game.name;
    }
    
    if (playButton) {
       
        const gameUrl = getGameUrl(game.id);
        playButton.href = buildUrlWithChannel(gameUrl, window.channel);
    }
    
    if (gameTitle) {
        gameTitle.textContent = game.name;
    }
    
    if (gameDownloads) {
        gameDownloads.textContent = game.downloads;
    }
    
    if (gameCategory) {
        gameCategory.textContent = game.category;
    }
    
    if (gameDescription) {
        gameDescription.textContent = game.description;
    }

   
    if (gameRating) {
        const rating = game.rating || 5;
        const stars = generateStarsHTML(rating);
        gameRating.innerHTML = stars;
    }

    loadRecommendedGames(game.id).catch(err => console.error('Failed to load recommended games:', err));
}

async function getRandomRecommendedGames(currentGameId, count = 4) {
    const gameDetails = await getGameDetails();
   
    const availableGames = gameDetails.filter(game => {
        const gameId = parseInt(game.id, 10);
        const currentId = parseInt(currentGameId, 10);
       
        return !isNaN(gameId) && gameId > 0 && gameId !== currentId && game.id != null;
    });

   
    if (availableGames.length === 0) {
        return [];
    }

    const shuffled = availableGames.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, Math.min(count, availableGames.length));
}

async function loadRecommendedGames(currentGameId) {
    const recommendedGames = await getRandomRecommendedGames(currentGameId);
    const recommendedGrid = document.getElementById('recommendedGrid');
    
    if (!recommendedGrid) {
        
        return;
    }

   
    if (recommendedGames.length === 0) {
        recommendedGrid.innerHTML = '<div class="no-results"><p>No recommended games available</p></div>';
        return;
    }

   
    const detailPath = window.location.pathname.includes('/pages/') ? '../detail.html' : 'detail.html';
    recommendedGrid.innerHTML = recommendedGames.map(game => `
        <a href="${buildUrlWithChannel(`${detailPath}?id=${game.id}`, window.channel)}" class="recommended-game-item">
            <img src="${game.image}" alt="${game.name}" class="recommended-game-image" onerror="this.style.display='none'">
            <div class="recommended-game-info">
                <div class="recommended-game-name">${game.name || 'Unknown Game'}</div>
                <div class="recommended-game-stats">
                    <span class="recommended-game-downloads">${game.downloads || '0'}+ Play</span>
                    <span class="recommended-game-category">${game.category || 'unknown'}</span>
                </div>
            </div>
        </a>
    `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadGameDetail();
});

