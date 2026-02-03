import { getGameDetail, loadGameData, getGameUrl } from './BaseURL.js';
import { createGameCardHTML, getUrlParameter, getHomePagePath, displayEmptyResults, shuffleArray, isValidGameId } from './inpublic.js';


const DOM_IDS = {
    GAME_ICON: 'gameIcon',
    GAME_TITLE: 'gameTitle',
    GAME_RATING: 'gameRating',
    GAME_CATEGORY: 'gameCategory',
    GAME_DESCRIPTION: 'gameDescription',
    PLAY_BUTTON: 'playButton',
    RECOMMENDED_GAMES: 'recommendedGames',
    RATING_VALUE: 'ratingValue',
    RATING_LABEL: 'ratingLabel',
    PLAYERS_VALUE: 'playersValue',
    PLAYERS_LABEL: 'playersLabel',
    AGE_VALUE: 'ageValue',
    AGE_LABEL: 'ageLabel'
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


const RECOMMENDED_GAMES_COUNT = 10;


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





async function loadGameDetail() {
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
    await generateRecommendedGames(game);
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
        gameRating: document.getElementById(DOM_IDS.GAME_RATING),
        gameCategory: document.getElementById(DOM_IDS.GAME_CATEGORY),
        gameDescription: document.getElementById(DOM_IDS.GAME_DESCRIPTION),
        playButton: document.getElementById(DOM_IDS.PLAY_BUTTON),
        ratingValue: document.getElementById(DOM_IDS.RATING_VALUE),
        ratingLabel: document.getElementById(DOM_IDS.RATING_LABEL),
        playersValue: document.getElementById(DOM_IDS.PLAYERS_VALUE),
        playersLabel: document.getElementById(DOM_IDS.PLAYERS_LABEL),
        ageValue: document.getElementById(DOM_IDS.AGE_VALUE),
        ageLabel: document.getElementById(DOM_IDS.AGE_LABEL)
    };
    
    const requiredElements = ['gameIcon', 'gameTitle', 'gameCategory', 'gameDescription', 'playButton'];
    const missingElements = requiredElements
        .filter(name => !elements[name])
        .map(name => name);
    
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


function formatRating(rating) {
   
    if (rating === undefined || rating === null || rating === '') {
        return '4.9';
    }
    const ratingValue = typeof rating === 'number' ? rating : parseFloat(rating);
    if (isNaN(ratingValue) || ratingValue < 0) {
        return '4.9';
    }
    return Math.min(Math.max(ratingValue, 0), 5).toFixed(1);
}

function formatRatingCount(rating) {
   
    if (rating === undefined || rating === null || rating === '') {
        return '40M';
    }
    
    const ratingValue = typeof rating === 'number' ? rating : parseFloat(rating);
    if (isNaN(ratingValue) || ratingValue < 0) {
        return '40M';
    }
    
   
    const baseCount = Math.floor(ratingValue * 8);
    return `${baseCount}M`;
}

function formatPlayersCount() {
    return '100M+';
}

function formatAgeRating() {
    return '12+';
}

function populateGameDetails(elements, game) {
    elements.gameIcon.src = game.image;
    elements.gameIcon.alt = game.name;
    setupImageErrorHandler(elements.gameIcon, game.name);
    elements.gameTitle.textContent = game.name;
    
   
    if (elements.gameCategory) {
        const categories = game.category ? game.category.split(',').map(c => c.trim()) : ['Game'];
        const categoryTags = categories.map(cat => {
            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
            return `<span>${displayName}</span>`;
        }).join('');
        elements.gameCategory.innerHTML = categoryTags;
    }
    
   
    if (elements.ratingValue) {
        const rating = formatRating(game.rating);
        elements.ratingValue.textContent = rating;
    }
    
    if (elements.ratingLabel) {
        const ratingCount = formatRatingCount(game.rating);
        elements.ratingLabel.textContent = `${ratingCount} Ratings`;
    }
    
   
    if (elements.playersValue) {
        elements.playersValue.textContent = formatPlayersCount();
    }
    
    if (elements.playersLabel) {
        elements.playersLabel.textContent = 'Players';
    }
    
   
    if (elements.ageValue) {
        elements.ageValue.textContent = `Rate of ${formatAgeRating()}`;
    }
    
    if (elements.ageLabel) {
        elements.ageLabel.textContent = formatAgeRating();
    }
    
   
    elements.gameDescription.textContent = game.description || 'Classic Texas Poker';
    
    setupPlayButtonHandler(elements.playButton, game);
}


function displayGameDetail(game) {
    const elements = getRequiredDOMElements();
    if (!elements) {
        return;
    }
    populateGameDetails(elements, game);
}


async function categorizeGames(currentGame) {
    const sameCategoryGames = [];
    const otherGames = [];
    
    const gameDetails = await loadGameData();
    
    gameDetails.forEach(game => {
        if (!game || 
            !isValidGameId(game.id) || 
            !game.name || 
            !game.image || 
            game.id === currentGame.id) {
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


async function generateRecommendedGames(currentGame) {
    const recommendedGamesContainer = document.getElementById(DOM_IDS.RECOMMENDED_GAMES);
    if (!recommendedGamesContainer) {
        return;
    }
    
    const { sameCategoryGames, otherGames } = await categorizeGames(currentGame);
    
    const allGames = [...sameCategoryGames, ...otherGames];
    
    if (allGames.length === 0) {
        displayEmptyResults(recommendedGamesContainer, TEXT.NO_RECOMMENDED_GAMES_TITLE, TEXT.NO_RECOMMENDED_GAMES_MESSAGE);
        return;
    }
    
    const shuffledGames = shuffleArray(allGames);
    const recommended = shuffledGames.slice(0, RECOMMENDED_GAMES_COUNT);
    
    recommendedGamesContainer.innerHTML = recommended
        .map(game => createGameCardHTML(game))
        .join('');
}

async function initDetailPage() {
    try {
       
        await loadGameData();
       
        loadGameDetail();
    } catch (error) {
        console.error('Failed to initialize detail page:', error);
        window.location.href = getHomePagePath();
    }
}


document.addEventListener('DOMContentLoaded', initDetailPage);


