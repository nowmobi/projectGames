import { 
    getGameDetails, 
    getCategoryInfo, 
    parseDownloads,
    DEFAULT_CATEGORIES,
    HOMEPAGE_CATEGORY_NAME_MAP,
    getCategoryDisplayName,
    calculateCategoryCounts,
    buildUrlWithChannel,
    getCategoryPagePath,
    generateStarsHTML
} from './inpublic.js';

const categorySectionsContainer = document.getElementById('categorySectionsContainer');


function createGameCardHTML(game) {
   
    const rating = game.rating || 5;
    const stars = generateStarsHTML(rating);
    
    const detailPath = window.location.pathname.includes('/pages/') ? '../specification.html' : 'specification.html';
    return `
        <a href="${buildUrlWithChannel(`${detailPath}?id=${game.id}`, window.channel)}" class="homepage-game-card">
            <div class="game-image-container">
                <img src="${game.image}" alt="${game.name}">
            </div>
            <div class="homepage-game-card-content">
                <h3 class="homepage-game-title">${game.name}</h3>
                <div class="game-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-number">${rating}</span>
                </div>
                <div class="game-tags">
                    <span class="tag">${game.category}</span>
                </div>
                <div class="game-play-count">downloads: ${game.downloads}</div>
                <button class="homepage-play-button">PLAY</button>
            </div>
        </a>
    `;
}


// Fisher-Yates 洗牌算法，用于随机打乱数组
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function generateCategoryGames(category, gridElement, limit = 3) {
    if (!gridElement) return;
    
    const gameDetails = await getGameDetails();
    const games = gameDetails
        .filter(game => game.category === category);
    
    // 随机打乱游戏列表
    const shuffledGames = shuffleArray(games);
    const selectedGames = shuffledGames.slice(0, limit);
    
    gridElement.innerHTML = selectedGames.map(game => createGameCardHTML(game)).join('');
}


async function generateHomepageCategorySections() {
    if (!categorySectionsContainer) {
        return;
    }

    const categoryInfo = await getCategoryInfo();
    const gameDetails = await getGameDetails();
    const categoryCounts = calculateCategoryCounts(gameDetails);
    const categories = categoryInfo || DEFAULT_CATEGORIES;
    
    
    const existingSections = Array.from(categorySectionsContainer.querySelectorAll('.category-section'));
    
    
    for (let i = 0; i < existingSections.length && i < categories.length; i++) {
        const sectionElement = existingSections[i];
        const category = categories[i];
        const count = categoryCounts[category] || 0;
        const name = getCategoryDisplayName(category, true);
        const gridId = `${category}GamesGrid`;
        const countId = `${category}Count`;
        
        
        sectionElement.innerHTML = `
            <div class="section-header">
                <h2 class="section-title" data-category="${category}">${name}</h2>
                <span class="section-count" id="${countId}">${count} games
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </div>
            <div class="homepage-game-grid" id="${gridId}"></div>
        `;
    }
    
    
    for (let i = 0; i < existingSections.length && i < categories.length; i++) {
        const category = categories[i];
        const gridId = `${category}GamesGrid`;
        const gridElement = document.getElementById(gridId);
        if (gridElement) {
            await generateCategoryGames(category, gridElement, 2);
        }
    }
    
    
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.addEventListener('click', () => {
            const category = title.dataset.category;
            if (category) {
                window.location.href = buildUrlWithChannel(`${getCategoryPagePath()}?category=${category}`, window.channel);
            }
        });
    });

    const sectionCounts = document.querySelectorAll('.section-count');
    sectionCounts.forEach(count => {
        count.addEventListener('click', () => {
            const sectionHeader = count.closest('.section-header');
            const sectionTitle = sectionHeader.querySelector('.section-title');
            const category = sectionTitle.dataset.category;
            if (category) {
                window.location.href = buildUrlWithChannel(`${getCategoryPagePath()}?category=${category}`, window.channel);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
   
    await generateHomepageCategorySections();
});



