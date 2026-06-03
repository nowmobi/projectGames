import { loadGameData, getGameDetail, getGameUrl } from './BaseURL.js';
import { initSearch, getUrlParameter } from './inpublic.js';

let gameDetails = [];
let gameDetailContainer = null;
let backBtn = null;

function createDefaultGameDetail(gameId) {
    return {
        id: parseInt(gameId, 10),
        name: `Game ${gameId}`,
        description: 'Game description not available.',
        category: 'action',
        downloads: '0',
        image: '',
        tags: 'No tags'
    };
}

async function loadGameDetail() {
    const gameId = getUrlParameter('id');
    if (!gameId) {
        window.location.href = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
        return;
    }

    if (gameDetails.length === 0) {
        gameDetails = await loadGameData();
    }
   
    const numericId = parseInt(gameId, 10);
    const game = gameDetails.find(g => g.id === numericId);
        
    if (!game) {
        const defaultGame = createDefaultGameDetail(gameId);
        displayGameDetail(defaultGame);
        return;
    }

    displayGameDetail(game);
}

function displayGameDetail(game) {
    if (!gameDetailContainer) {
        console.error('gameDetailContainer is null');
        return;
    }
    console.log('Displaying game detail:', game);
    
    let tagsHTML = '<span class="game-tag">No tags</span>';
    if (game.tags) {
        const tagsArray = Array.isArray(game.tags) ? game.tags : game.tags.split(',');
        tagsHTML = tagsArray.map(tag => `<span class="game-tag">${String(tag).trim()}</span>`).join('');
    }
    
    gameDetailContainer.innerHTML = `
        <div class="game-detail">
            <div class="game-header-row">
                <div class="game-image-wrapper">
                    <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="game-image-fallback">
                        ${game.name}
                    </div>
                </div>
                <div class="game-info-wrapper">
                    <h1 class="game-title">${game.name}</h1>
                    <a href="${getGameUrl(game.id)}?${window.channel ? 'channel=' + window.channel : ''}" class="play-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                        Play Now
                    </a>
                </div>
            </div>
            
            <div class="game-stats-row">
                <div class="rating">
                    <span class="star filled" style="margin-left: 10px;">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="star filled">★</span>
                    <span class="rating-value">${game.rating || '5'}/5</span>
                </div>
                <span class="download-value">
                    <svg width="24" height="24" viewBox="0 0 1024 1024" fill="#fff" stroke="#fff" stroke-width="40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z"/>
                    </svg>
                    ${game.downloads}
                </span>
            </div>
            
            <div class="game-description">
                <h2>Description</h2>
                <div class="description-content">
                    <p>${game.description}</p>
                </div>
            </div>
            
            <div class="game-tags-section">
                <h3 class="tags-title">Tags</h3>
                <div class="tags-wrapper">
                    ${tagsHTML}
                </div>
            </div>
        </div>
    `;

    generateRecommendedGames(game.id);
}

function generateRecommendedGames(currentGameId) {
    console.log('generateRecommendedGames called, gameDetails length:', gameDetails ? gameDetails.length : 'null');
    
    if (!gameDetails || gameDetails.length === 0) {
        console.log('No game details available');
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
    
    console.log('Valid games found:', validGames.length);
    
    if (validGames.length === 0) {
        return;
    }
    
    const shuffledGames = validGames.sort(() => Math.random() - 0.5);
    const recommendedGames = shuffledGames.slice(0, 4);
    
    const recommendedGamesGrid = document.getElementById('recommendedGamesGrid');
    console.log('recommendedGamesGrid found:', recommendedGamesGrid ? 'yes' : 'no');
    
    if (recommendedGamesGrid) {
        recommendedGamesGrid.innerHTML = recommendedGames.map(game => `
            <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="recommended-game-card">
                <img src="${game.image}" alt="${game.name}">
                <div class="recommended-game-card-content">
                    <p class="recommended-game-title">${game.name}</p>
                    <div class="homepage-game-stats">
                        <svg width="20" height="20" viewBox="0 0 1024 1024" fill="#ff5252" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 832 364.8 h -147.2 s 19.2 -64 32 -179.2 c 6.4 -57.6 -38.4 -115.2 -102.4 -121.6 h -12.8 c -51.2 0 -83.2 32 -102.4 76.8 l -38.4 96 c -32 64 -57.6 102.4 -76.8 115.2 c -25.6 12.8 -121.6 12.8 -128 12.8 H 128 c -38.4 0 -64 25.6 -64 57.6 v 480 c 0 32 25.6 57.6 64 57.6 h 646.4 c 96 0 121.6 -64 134.4 -153.6 l 51.2 -307.2 c 6.4 -70.4 -6.4 -134.4 -128 -134.4 Z m -576 537.6 H 128 V 422.4 h 128 v 480 Z m 640 -409.6 l -51.2 307.2 c -12.8 57.6 -12.8 102.4 -76.8 102.4 H 320 V 422.4 c 44.8 0 70.4 -6.4 89.6 -19.2 c 32 -12.8 64 -64 108.8 -147.2 c 25.6 -64 38.4 -96 44.8 -102.4 c 6.4 -19.2 19.2 -32 44.8 -32 h 6.4 c 32 0 44.8 32 44.8 51.2 c -12.8 102.4 -32 166.4 -32 166.4 l -25.6 83.2 h 243.2 c 19.2 0 32 0 44.8 12.8 c 12.8 12.8 6.4 38.4 6.4 57.6 Z" stroke="#ff5252" stroke-width="60" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                        <span class="homepage-game-download">${game.downloads || '0'}</span>
                        <span class="homepage-game-rating">
                            <svg width="24" height="24" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path d="M544.402286 99.693714a73.142857 73.142857 0 0 1 33.206857 33.206857l84.845714 171.958858 189.805714 27.648a73.142857 73.142857 0 0 1 40.521143 124.708571l-137.289143 133.851429 32.402286 189.074285a73.142857 73.142857 0 0 1-106.130286 77.092572L512 768l-169.764571 89.234286a73.142857 73.142857 0 0 1-106.130286-77.092572l32.402286-189.001143-137.289143-133.851428a73.142857 73.142857 0 0 1 40.521143-124.781714l189.805714-27.648 84.845714-171.958858a73.142857 73.142857 0 0 1 98.011429-33.206857z m69.485714 272.091429L512 165.302857 410.112 371.712l-227.84 33.133714 164.864 160.694857-38.912 226.962286L512 685.348571l203.776 107.154286-38.912-226.962286 164.864-160.694857-227.84-33.133714z" fill="#ffab2a" stroke="#ffab2a" stroke-width="40"/>
                            </svg>
                            ${game.rating || '5.0'}
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    gameDetailContainer = document.getElementById('gameDetailContainer');
    backBtn = document.getElementById('backBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const homeUrl = 'index.html' + (window.channel ? '?channel=' + window.channel : '');
            window.location.href = homeUrl;
        });
    }
    
    try {
        gameDetails = await loadGameData();
       
        await loadGameDetail();
       
        await initSearch();
    } catch (error) {
        console.error('Error loading game data:', error);
        await loadGameDetail();
       
        try {
            await initSearch();
        } catch (searchError) {
            console.error('Failed to init search:', searchError);
        }
    }
});

