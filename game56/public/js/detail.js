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
    
    const gameDetail = document.getElementById('gameDetail');
    const loadingContainer = document.querySelector('.loading-container');
    
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
    
    if (gameDetail) {
        gameDetail.style.display = 'block';
        
        const gameImage = document.getElementById('gameImage');
        const gameImageFallback = document.getElementById('gameImageFallback');
        const gameTitle = document.getElementById('gameTitle');
        const playBtn = document.getElementById('playBtn');
        const gameRating = document.getElementById('gameRating');
        const gameDownloads = document.getElementById('gameDownloads');
        const gameDescription = document.getElementById('gameDescription');
        const gameTags = document.getElementById('gameTags');
        
        if (gameImage) {
            if (game.image) {
                gameImage.src = game.image;
                gameImage.alt = game.name;
                gameImage.style.display = 'block';
                if (gameImageFallback) {
                    gameImageFallback.style.display = 'none';
                }
            } else {
                gameImage.style.display = 'none';
                if (gameImageFallback) {
                    gameImageFallback.style.display = 'flex';
                    gameImageFallback.textContent = game.name;
                }
            }
        } else if (gameImageFallback) {
            gameImageFallback.style.display = 'flex';
            gameImageFallback.textContent = game.name;
        }
        
        if (gameTitle) {
            gameTitle.textContent = game.name;
        }
        
        if (playBtn) {
            playBtn.href = getGameUrl(game.id) + (window.channel ? '?channel=' + window.channel : '');
        }
        
        if (gameRating) {
            gameRating.textContent = (game.rating || '5') + '/5';
        }
        
        if (gameDownloads) {
            gameDownloads.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 1024 1024" fill="#fff" stroke="#fff" stroke-width="40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z"/>
                </svg>
                ${game.downloads || '0'}
            `;
        }
        
        if (gameDescription) {
            gameDescription.textContent = game.description;
        }
        
        if (gameTags) {
            let tagsHTML = '<span class="game-tag">No tags</span>';
            if (game.tags) {
                const tagsArray = Array.isArray(game.tags) ? game.tags : game.tags.split(',');
                tagsHTML = tagsArray.map(tag => `<span class="game-tag">${String(tag).trim()}</span>`).join('');
            }
            gameTags.innerHTML = tagsHTML;
        }
    }

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
    const recommendedGames = shuffledGames.slice(0, 8);
    
    const recommendedGamesGrid = document.getElementById('recommendedGamesGrid');
    console.log('recommendedGamesGrid found:', recommendedGamesGrid ? 'yes' : 'no');
    
    if (recommendedGamesGrid) {
        recommendedGamesGrid.innerHTML = recommendedGames.map(game => `
            <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="recommended-game-card">
                <div class="top-desc">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 57 67" fill="none">
                        <circle cx="25.4212" cy="54.5" r="10" fill="white" stroke="black" stroke-width="5"></circle>
                        <path d="M23.3467 55.442C24.4192 56.3116 25.9935 56.1471 26.8631 55.0746C27.7327 54.0021 27.5682 52.4278 26.4957 51.5582L23.3467 55.442ZM26.4957 51.5582C8.75064 37.1702 9.22752 20.4111 16.7641 12.1893L13.0784 8.81073C3.01497 19.789 4.09186 39.8298 23.3467 55.442L26.4957 51.5582ZM16.7641 12.1893C20.0902 8.56091 26.4602 8.17602 32.6545 11.0985C38.7455 13.9723 43.4212 19.524 43.4212 26.0001H48.4212C48.4212 16.9761 41.9969 9.97775 34.788 6.57655C27.6823 3.22403 18.5523 2.83916 13.0784 8.81073L16.7641 12.1893Z" fill="black"></path>
                    </svg>
                </div>
                <div class="card-inner">
                    <div class="img-manage">
                        <img src="${game.image}" alt="${game.name}" class="inner-img">
                    </div>
                    <div class="homepage-game-card-content">
                        <p class="homepage-game-title">${game.name}</p>
                    </div>
                    <div class="homepage-game-stats">
                        <span class="homepage-game-rating">
                            <svg width="18" height="18" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path d="M544.402286 99.693714a73.142857 73.142857 0 0 1 33.206857 33.206857l84.845714 171.958858 189.805714 27.648a73.142857 73.142857 0 0 1 40.521143 124.708571l-137.289143 133.851429 32.402286 189.074285a73.142857 73.142857 0 0 1-106.130286 77.092572L512 768l-169.764571 89.234286a73.142857 73.142857 0 0 1-106.130286-77.092572l32.402286-189.001143-137.289143-133.851428a73.142857 73.142857 0 0 1 40.521143-124.781714l189.805714-27.648 84.845714-171.958858a73.142857 73.142857 0 0 1 98.011429-33.206857z m69.485714 272.091429L512 165.302857 410.112 371.712l-227.84 33.133714 164.864 160.694857-38.912 226.962286L512 685.348571l203.776 107.154286-38.912-226.962286 164.864-160.694857-227.84-33.133714z" fill="#ffab2a" stroke="#ffab2a" stroke-width="40"/>
                            </svg>
                            ${game.rating || '5.0'}
                        </span>
                        <span class="homepage-game-download">
                            <svg width="18" height="18" viewBox="0 0 1024 1024" fill="#ff5252" xmlns="http://www.w3.org/2000/svg">
                                <path d="M 832 364.8 h -147.2 s 19.2 -64 32 -179.2 c 6.4 -57.6 -38.4 -115.2 -102.4 -121.6 h -12.8 c -51.2 0 -83.2 32 -102.4 76.8 l -38.4 96 c -32 64 -57.6 102.4 -76.8 115.2 c -25.6 12.8 -121.6 12.8 -128 12.8 H 128 c -38.4 0 -64 25.6 -64 57.6 v 480 c 0 32 25.6 57.6 64 57.6 h 646.4 c 96 0 121.6 -64 134.4 -153.6 l 51.2 -307.2 c 6.4 -70.4 -6.4 -134.4 -128 -134.4 Z m -576 537.6 H 128 V 422.4 h 128 v 480 Z m 640 -409.6 l -51.2 307.2 c -12.8 57.6 -12.8 102.4 -76.8 102.4 H 320 V 422.4 c 44.8 0 70.4 -6.4 89.6 -19.2 c 32 -12.8 64 -64 108.8 -147.2 c 25.6 -64 38.4 -96 44.8 -102.4 c 6.4 -19.2 19.2 -32 44.8 -32 h 6.4 c 32 0 44.8 32 44.8 51.2 c -12.8 102.4 -32 166.4 -32 166.4 l -25.6 83.2 h 243.2 c 19.2 0 32 0 44.8 12.8 c 12.8 12.8 6.4 38.4 6.4 57.6 Z" stroke="#ff5252" stroke-width="60" stroke-linejoin="round" stroke-linecap="round"/>
                            </svg>
                            ${game.downloads || '0'}
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

