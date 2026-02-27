
import { loadGameData, getGameDetail, getGameUrl } from './BaseURL.js';
import { initMenu, initChannel } from './inpublic.js';

let gameDetails = [];

function createDefaultGameDetail(gameId) {
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        category: 'action',
        rating: 3,
        description: 'Game description not available.',
        image: '',
        downloads: '0'
    };
}


const gameIcon = document.getElementById('gameIcon');
const gameTitle = document.getElementById('gameTitle');
const gameCategory = document.getElementById('gameCategory');
const gameStars = document.getElementById('gameStars');
const gameDescription = document.getElementById('gameDescription');
const playButton = document.getElementById('playButton');
const recommendedGames = document.getElementById('recommendedGames');


function getUrlParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

async function loadGameDetail() {
    
    if (gameDetails.length === 0) {
        gameDetails = await loadGameData();
    }
    
    const gameId = getUrlParameter('id');
    if (!gameId) {
        window.location.href = 'index.html' + (window.channel ? `?channel=${window.channel}` : '');
        return;
    }

    const game = getGameDetail(gameId);
    if (!game) {
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
    await generateRecommendedGames(game);
}

function showGameUnavailableMessage(gameName) {
   
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        margin: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h3 style="color: #333; margin-bottom: 15px;">Game Unavailable</h3>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
            Sorry, "${gameName}" is currently unavailable or under maintenance.
        </p>
        <p style="color: #888; font-size: 14px; margin-bottom: 25px;">
            Please try again later or choose another game.
        </p>
        <button onclick="this.closest('.game-unavailable-modal').remove()" 
                style="background: #007bff; color: white; border: none; padding: 12px 25px; 
                       border-radius: 8px; cursor: pointer; font-size: 16px;">
            OK, I Understand
        </button>
    `;
    
    modal.className = 'game-unavailable-modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
   
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function displayGameDetail(game) {
   
    gameIcon.src = game.image;
    gameIcon.alt = game.name;
    
   
    gameIcon.onerror = function() {
        this.style.display = 'none';
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'game-icon-fallback';
        fallbackDiv.textContent = game.name;
        fallbackDiv.style.cssText = `
            width: 110px;
            height: 110px;
            border-radius: 18px;
            background: var(--theme-color, #20b2aa);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            word-wrap: break-word;
            line-height: 1.2;
        `;
        this.parentNode.insertBefore(fallbackDiv, this);
    };
    
    gameTitle.textContent = game.name;
    gameCategory.textContent = game.category.toUpperCase();
    gameStars.innerHTML = '★'.repeat(game.rating);
    gameDescription.textContent = game.description;
   
    const gamePath = getGameUrl(game.id) + (window.channel ? `?channel=${window.channel}` : '');
    playButton.href = gamePath;
    
   
    playButton.onclick = function(e) {
       
        fetch(gamePath)
            .then(response => {
                if (!response.ok) {
                    e.preventDefault();
                    showGameUnavailableMessage(game.name);
                }
            })
            .catch(error => {
                e.preventDefault();
                showGameUnavailableMessage(game.name);
            });
    };
}

async function generateRecommendedGames(currentGame) {
    
    if (gameDetails.length === 0) {
        gameDetails = await loadGameData();
    }
    
    
    function isValidGame(game) {
        if (!game || !game.id) return false;
        const validGame = getGameDetail(game.id);
        return validGame !== null && validGame.id === game.id;
    }
    
    
    const sameCategoryGames = gameDetails
        .filter(game => 
            game.category === currentGame.category && 
            game.id !== currentGame.id &&
            isValidGame(game)
        );
    
    
    const otherGames = gameDetails
        .filter(game => 
            game.category !== currentGame.category && 
            game.id !== currentGame.id &&
            isValidGame(game)
        );
    
    
    const recommended = [...sameCategoryGames, ...otherGames].slice(0, 4);
    
    
    if (recommended.length === 0) {
        recommendedGames.innerHTML = '<div class="no-results"><p>No recommended games available</p></div>';
        return;
    }
    
    recommendedGames.innerHTML = recommended.map(game => {
        const stars = '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating);
        return `
            <div class="recommended-game" onclick="window.location.href='detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}'">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <h3>${game.name}</h3>
                <div class="recommended-game-info">
                    <div class="recommended-game-rating">
                        <span class="stars">${stars}</span>
                    </div>
                    <div class="recommended-game-downloads">${game.downloads}</div>
                </div>
            </div>
        `;
    }).join('');
}


document.addEventListener('DOMContentLoaded', async () => {
    await loadGameDetail();
});


(async () => {
    await initMenu();
    initChannel();
})();

