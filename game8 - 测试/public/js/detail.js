import { loadGameData, getGameDetail, getGameUrl } from './BaseURL.js';

const gameIcon = document.getElementById('gameIcon');
const gameTitle = document.getElementById('gameTitle');
const gameCategory = document.getElementById('gameCategory');
const gameStars = document.getElementById('gameStars');
const ratingText = document.getElementById('ratingText');
const gameDescription = document.getElementById('gameDescription');
const playButton = document.getElementById('playButton');
const recommendedGames = document.getElementById('recommendedGames');


function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function createDefaultGameDetail(gameId) {
    const numericId = parseInt(gameId, 10);
    return {
        id: numericId,
        name: `Game ${gameId}`,
        category: 'action',
        rating: 5,
        description: 'Game description not available.',
        image: `./icons/${gameId}.jpg`
    };
}

async function loadGameDetail() {
    const gameId = getUrlParameter('id');
    
    if (!gameId) {
        window.location.href = 'index.html'
         + (window.channel ? "?channel=" + window.channel : "");
        return;
    }

    
    const gameDetails = await loadGameData();
    const game = getGameDetail(gameId);
    
    if (!game) {
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
    generateRecommendedGames(game, gameDetails);
}

function displayGameDetail(game) {
   
    gameIcon.src = game.image;
    gameIcon.alt = game.name;

    gameTitle.textContent = game.name;
    gameCategory.textContent = game.category.toUpperCase();
    gameStars.innerHTML = '★'.repeat(game.rating);
    ratingText.textContent = `${game.rating}/5`;
    gameDescription.textContent = game.description;
   
    
    const gamePath = getGameUrl(game.id) + (window.channel ? "?channel=" + window.channel : "");
    playButton.href = gamePath;
}

function generateRecommendedGames(currentGame, gameDetails) {
    
    const availableGames = gameDetails.filter(game => {
        
        if (!game || !game.id) return false;
        
        
        if (game.id === currentGame.id) return false;
        
        
        const numericId = parseInt(game.id, 10);
        if (isNaN(numericId)) return false;
        
        
        const foundGame = gameDetails.find(g => g.id === numericId);
        return foundGame !== undefined;
    });
    
    const shuffledGames = availableGames.sort(() => Math.random() - 0.5);
    const recommended = shuffledGames.slice(0, 6);
    
    recommendedGames.innerHTML = recommended.map(game => {
        return `
            <div class="recommended-game" onclick="window.location.href='detail.html?id=${game.id}${window.channel ? "&channel=" + window.channel : ""}'">
                <img src="${game.image}" alt="${game.name}" loading="lazy">
                <h3>${game.name}</h3>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadGameDetail();
});

