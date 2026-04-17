import { gameDetails, getGameDetail, loadGameData, getGameUrl } from './BaseURL.js';
import { createGameCardHTML, createGameCardHTMLWithoutTitle, createGameListItemHTML, getUrlParameter, getHomePagePath, getDetailPagePath, displayEmptyResults } from './inpublic.js';


const DOM_IDS = {
    GAME_ICON: 'gameIcon',
    GAME_TITLE: 'gameTitle',
    GAME_DESCRIPTION: 'gameDescription',
    GAME_RATING_STARS: 'gameRatingStars',
    GAME_RATING_NUMBER: 'gameRatingNumber',
    PLAY_BUTTON: 'playButton',
    RECOMMENDED_GAMES: 'recommendedGames',
    FEATURED_GAMES: 'featuredGames',
    INFO_UPDATED: 'infoUpdated',
    INFO_CATEGORY: 'infoCategory',
    INFO_DOWNLOAD: 'infoDownload',
    INFO_PLAYED_BY: 'infoPlayedBy'
};


const MODAL_STYLES = {
    OVERLAY: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000'
    },
    CONTENT: {
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },
    BUTTON: {
        background: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
    }
};


const FALLBACK_ICON_STYLES = {
    width: '110px',
    height: '110px',
    borderRadius: '18px',
    background: '#20b2aa',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '10px',
    wordWrap: 'break-word',
    lineHeight: '1.2'
};


const RECOMMENDED_GAMES_COUNT = 12;


const TEXT = {
    MODAL_TITLE: 'Game Unavailable',
    MODAL_MESSAGE: 'Sorry, "{gameName}" is currently unavailable or under maintenance.',
    MODAL_HINT: 'Please try again later or choose another game.',
    MODAL_BUTTON: 'OK, I Understand',
    NO_RECOMMENDED_GAMES_TITLE: 'No recommended games',
    NO_RECOMMENDED_GAMES_MESSAGE: 'No other games available at the moment'
};


function stylesToString(styles) {
    return Object.entries(styles)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
        })
        .join('; ');
}


function isValidGame(game) {
    return game && 
           game.id !== null && 
           game.id !== undefined && 
           game.id !== '' &&
           game.name && 
           game.image;
}





function loadGameDetail() {
    const gameId = getUrlParameter('id');
    
    if (!gameId) {
        console.warn('Game ID not found in URL parameters');
        window.location.href = getHomePagePath();
        return;
    }

    const game = getGameDetail(gameId);
    
    if (!game) {
        console.warn(`Game with ID ${gameId} not found`);
        window.location.href = getHomePagePath();
        return;
    }

   
    displayGameDetail(game);
    generateRecommendedGames(game);
}


function createModal({ className, contentHTML }) {
    const modal = document.createElement('div');
    modal.className = className;
    modal.style.cssText = stylesToString(MODAL_STYLES.OVERLAY);
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = stylesToString(MODAL_STYLES.CONTENT);
    modalContent.innerHTML = contentHTML;
    
    modal.appendChild(modalContent);
   
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}


function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.remove();
    }
}


function showGameUnavailableMessage(gameName) {
    const modalHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h3 style="color: #333; margin-bottom: 15px;">${TEXT.MODAL_TITLE}</h3>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
            ${TEXT.MODAL_MESSAGE.replace('{gameName}', gameName)}
        </p>
        <p style="color: #888; font-size: 14px; margin-bottom: 25px;">
            ${TEXT.MODAL_HINT}
        </p>
        <button class="modal-close-btn" style="${stylesToString(MODAL_STYLES.BUTTON)}">
            ${TEXT.MODAL_BUTTON}
        </button>
    `;
    
    const modal = createModal({
        className: 'game-unavailable-modal',
        contentHTML: modalHTML
    });
    
   
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    document.body.appendChild(modal);
}


function getRequiredDOMElements() {
    const elements = {
        gameIcon: document.getElementById(DOM_IDS.GAME_ICON),
        gameTitle: document.getElementById(DOM_IDS.GAME_TITLE),
        gameDescription: document.getElementById(DOM_IDS.GAME_DESCRIPTION),
        gameRatingStars: document.getElementById(DOM_IDS.GAME_RATING_STARS),
        gameRatingNumber: document.getElementById(DOM_IDS.GAME_RATING_NUMBER),
        playButton: document.getElementById(DOM_IDS.PLAY_BUTTON),
        infoUpdated: document.getElementById(DOM_IDS.INFO_UPDATED),
        infoCategory: document.getElementById(DOM_IDS.INFO_CATEGORY),
        infoDownload: document.getElementById(DOM_IDS.INFO_DOWNLOAD),
        infoPlayedBy: document.getElementById(DOM_IDS.INFO_PLAYED_BY)
    };
    
    const missingElements = Object.entries(elements)
        .filter(([name, element]) => !element)
        .map(([name]) => name);
    
    if (missingElements.length > 0) {
        console.error('Required DOM elements not found:', missingElements);
        return null;
    }
    
    return elements;
}


function createImageFallback(originalImg, gameName) {
    originalImg.style.display = 'none';
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'game-icon-fallback';
    fallbackDiv.textContent = gameName;
    fallbackDiv.style.cssText = stylesToString(FALLBACK_ICON_STYLES);
    
    originalImg.parentNode.insertBefore(fallbackDiv, originalImg);
    return fallbackDiv;
}


function setupImageErrorHandler(imgElement, gameName) {
    imgElement.onerror = function() {
        createImageFallback(this, gameName);
    };
}


async function checkGameAvailability(gamePath) {
    try {
        const response = await fetch(gamePath);
        return response.ok;
    } catch (error) {
        console.error('Error checking game availability:', error);
        return false;
    }
}


function setupPlayButtonHandler(playButton, game) {
    const gamePath = getGameUrl(game.id);
    playButton.href = gamePath;
    
    playButton.onclick = async function(e) {
        e.preventDefault();
        
        const isAvailable = await checkGameAvailability(gamePath);
        
        if (isAvailable) {
            window.location.href = gamePath;
        } else {
            showGameUnavailableMessage(game.name);
        }
    };
}


function populateGameDetails(elements, game) {
    elements.gameIcon.src = game.image;
    elements.gameIcon.alt = game.name;
    setupImageErrorHandler(elements.gameIcon, game.name);
    
    elements.gameTitle.textContent = game.name;
    elements.gameDescription.textContent = game.description || '';
    
    if (elements.gameRatingStars && elements.gameRatingNumber) {
        const rating = game.rating || '0';
        const stars = '★'.repeat(Math.floor(parseFloat(rating))) + '☆'.repeat(5 - Math.floor(parseFloat(rating)));
        elements.gameRatingStars.textContent = stars;
        elements.gameRatingNumber.textContent = rating;
    }
    
    if (elements.infoUpdated) {
        elements.infoUpdated.textContent = getRandomDate();
    }
    if (elements.infoCategory) {
        elements.infoCategory.textContent = game.category || '-';
    }
    if (elements.infoDownload) {
        elements.infoDownload.textContent = game.downloads || '0';
    }
    if (elements.infoPlayedBy) {
        elements.infoPlayedBy.textContent = game.playedByCount || '0';
    }
    
    setupPlayButtonHandler(elements.playButton, game);
}

function getRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}


function displayGameDetail(game) {
    const elements = getRequiredDOMElements();
    if (!elements) {
        return;
    }
    
    populateGameDetails(elements, game);
}


function categorizeGames(currentGame) {
    const sameCategoryGames = [];
    const otherGames = [];
    
    gameDetails.forEach(game => {
       
        if (!isValidGame(game) || game.id === currentGame.id) {
            return;
        }
        
       
        if (game.category === currentGame.category) {
            sameCategoryGames.push(game);
        } else {
            otherGames.push(game);
        }
    });
    
    return { sameCategoryGames, otherGames };
}


function generateRecommendedGames(currentGame) {
    const recommendedGamesContainer = document.getElementById(DOM_IDS.RECOMMENDED_GAMES);
    if (!recommendedGamesContainer) {
        return;
    }
    
    const allGames = gameDetails
        .filter(game => isValidGame(game) && game.id !== currentGame.id);
    
    const shuffled = allGames.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, RECOMMENDED_GAMES_COUNT);
    
    if (recommended.length === 0) {
        displayEmptyResults(recommendedGamesContainer, TEXT.NO_RECOMMENDED_GAMES_TITLE, TEXT.NO_RECOMMENDED_GAMES_MESSAGE);
        return;
    }
    
    recommendedGamesContainer.className = 'game-grid game-grid-six-columns';
    recommendedGamesContainer.innerHTML = recommended
        .map(game => createGameCardHTMLWithoutTitle(game))
        .join('');
}

function generateFeaturedGames() {
    const featuredGamesContainer = document.getElementById(DOM_IDS.FEATURED_GAMES);
    if (!featuredGamesContainer) {
        return;
    }
    
    const allGames = gameDetails
        .filter(game => isValidGame(game));
    
    const shuffled = allGames.sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 8);
    
    if (featured.length === 0) {
        featuredGamesContainer.innerHTML = '<p>No featured games available</p>';
        return;
    }
    
    featuredGamesContainer.innerHTML = featured
        .map(game => createFeaturedGameItemHTML(game))
        .join('');
}

function createFeaturedGameItemHTML(game) {
    if (!game || !game.id) {
        console.warn('Invalid game object:', game);
        return '';
    }
    
    const detailPath = getDetailPagePath();
    const gameName = game.name || 'Unknown Game';
    const gameImage = game.image || '';
    const rating = game.rating || '0';
    
    const stars = '★'.repeat(Math.floor(parseFloat(rating))) + '☆'.repeat(5 - Math.floor(parseFloat(rating)));
    
    return `
        <div class="featured-game-item" onclick="window.location.href='${detailPath}?id=${game.id}'">
            <div class="featured-game-thumbnail">
                <img src="${gameImage}" alt="${gameName}" loading="lazy">
            </div>
            <div class="featured-game-info">
                <div class="featured-game-title">${gameName}</div>
                <div class="featured-game-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-number">${rating}</span>
                </div>
            </div>
            <div class="featured-game-lights">
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
                <div class="light-bulb"></div>
            </div>
        </div>
    `;
}

async function initDetailPage() {
    try {
        
        await loadGameData();
        
        loadGameDetail();
        generateFeaturedGames();
    } catch (error) {
        console.error('Failed to initialize detail page:', error);
    }
}


document.addEventListener('DOMContentLoaded', initDetailPage);

