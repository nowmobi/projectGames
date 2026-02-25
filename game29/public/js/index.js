import { loadGameData, getCategoryOrder } from './BaseURL.js';

let gameDetailsData = [];

// 轮播图相关变量
let carouselSlides = [];
let currentSlideIndex = 0;
let carouselInterval;
let isAutoPlaying = true;
const AUTO_PLAY_DELAY = 5000; // 5秒自动切换

const menuToggle = document.getElementById('menuToggle');
const categoriesMenu = document.getElementById('categoriesMenu');
const categoriesOverlay = document.getElementById('categoriesOverlay');
const closeCategories = document.getElementById('closeCategories');
const mainContent = document.getElementById('mainContent');
const categoriesMenuItems = document.getElementById('categoriesMenuItems');

// 轮播图元素
const carouselWrapper = document.getElementById('carouselWrapper');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselIndicators = document.getElementById('carouselIndicators');

let categoriesMenuEventBound = false;

// 轮播图类
class GameCarousel {
    constructor() {
        this.slides = [];
        this.currentIndex = 0;
        this.isPlaying = true;
        this.interval = null;
    }

    // 初始化轮播图
    init(gamesData) {
        this.createSlides(gamesData);
        this.render();
        this.bindEvents();
        this.startAutoPlay();
    }

    // 按分类创建轮播项
    createSlides(gamesData) {
        const categories = ['action', 'adventure', 'puzzle', 'racing', 'sports'];
        this.slides = [];

        categories.forEach(category => {
            const categoryGames = gamesData.filter(game => game.category === category);
            if (categoryGames.length > 0) {
                // 随机选择该分类的一个游戏
                const randomGame = categoryGames[Math.floor(Math.random() * categoryGames.length)];
                this.slides.push({
                    game: randomGame,
                    category: category,
                    gradient: this.getGradientByCategory(category)
                });
            }
        });
    }

    // 根据分类获取渐变色
    getGradientByCategory(category) {
        const gradients = {
            'action': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            'adventure': 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)',
            'puzzle': 'linear-gradient(135deg, #6ab04c 0%, #badc58 100%)',
            'racing': 'linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)',
            'sports': 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)'
        };
        return gradients[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // 渲染轮播图
    render() {
        if (this.slides.length === 0) return;

        carouselWrapper.innerHTML = '';
        carouselIndicators.innerHTML = '';

        this.slides.forEach((slide, index) => {
            // 创建轮播项
            const slideElement = document.createElement('div');
            slideElement.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slideElement.style.background = slide.gradient;
            slideElement.setAttribute('data-category', slide.category); // 添加分类属性
            
            // 优化描述文本长度
            const description = slide.game.description || 'Experience this amazing game now!';
            const truncatedDescription = description.length > 100 
                ? description.substring(0, 100) + '...' 
                : description;
            
            slideElement.innerHTML = `
                <div class="carousel-content">
                    <div class="carousel-text">
                        <span class="carousel-category">${this.formatCategory(slide.category)}</span>
                        <h3 class="carousel-title">${slide.game.name}</h3>
                        <p class="carousel-description">${truncatedDescription}</p>
                        <a href="detail.html?id=${slide.game.id}" class="carousel-play-btn">Play Now</a>
                    </div>
                    <div class="carousel-image">
                        <img src="${slide.game.image}" alt="${slide.game.name}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=Game+Image'">
                    </div>
                </div>
            `;

            carouselWrapper.appendChild(slideElement);

            // 创建指示点
            const indicator = document.createElement('div');
            indicator.className = `indicator-dot ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            carouselIndicators.appendChild(indicator);
        });
    }

    // 格式化分类名称
    formatCategory(category) {
        const categoryNames = {
            'action': 'Action Games',
            'adventure': 'Adventure Games',
            'puzzle': 'Puzzle Games',
            'racing': 'Racing Games',
            'sports': 'Sports Games'
        };
        return categoryNames[category] || category;
    }

    // 绑定事件
    bindEvents() {
        // 导航按钮
        carouselPrev.addEventListener('click', () => this.prevSlide());
        carouselNext.addEventListener('click', () => this.nextSlide());

        // 鼠标悬停暂停
        const carouselContainer = document.getElementById('gameCarousel');
        carouselContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
        carouselContainer.addEventListener('mouseleave', () => this.resumeAutoPlay());

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    }

    // 切换到指定幻灯片
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length || index === this.currentIndex) return;

        const slides = carouselWrapper.querySelectorAll('.carousel-slide');
        const indicators = carouselIndicators.querySelectorAll('.indicator-dot');

        // 移除当前活动状态
        slides[this.currentIndex].classList.remove('active');
        indicators[this.currentIndex].classList.remove('active');

        // 设置新的活动状态
        this.currentIndex = index;
        slides[this.currentIndex].classList.add('active');
        indicators[this.currentIndex].classList.add('active');
    }

    // 下一张
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    // 上一张
    prevSlide() {
        const prevIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
        this.goToSlide(prevIndex);
    }

    // 开始自动播放
    startAutoPlay() {
        if (this.interval) clearInterval(this.interval);
        this.isPlaying = true;
        this.interval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, AUTO_PLAY_DELAY);
    }

    // 暂停自动播放
    pauseAutoPlay() {
        this.isPlaying = false;
    }

    // 恢复自动播放
    resumeAutoPlay() {
        this.isPlaying = true;
    }

    // 停止自动播放
    stopAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isPlaying = false;
    }
}

// 创建轮播图实例
const gameCarousel = new GameCarousel();

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createGameCardHTML(game) {
    return `
        <a href="detail.html?id=${game.id}${window.channel ? '&channel=' + window.channel : ''}" class="homepage-game-card">
            <div class="image-container">
                <img src="${game.image}" 
                     alt="${game.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.style.opacity='1';">
                <div class="image-placeholder" style="display: none;">
                    <span>${game.name}</span>
                </div>
            </div>
            <div class="homepage-game-card-content mt-5">
                <div class="game-info-top">
                    <p class="homepage-game-title lh2">${game.name}</p>
                    <div class="homepage-game-play-count lh2">${game.downloads}+ Play</div>
                </div>
                <div class="homepage-play-button">Play</div>
            </div>
        </a>
    `;
}


const categoryNameMap = {
    'action': 'Action',
    'adventure': 'Adventure',
    'racing': 'Racing',
    'puzzle': 'Puzzle',
    'sports': 'Sports',
    'kids': 'Kids',
    'girl': 'Girls'
};


function generateCategorySectionContent(category, isFirst = false) {
    const categoryGames = gameDetailsData.filter(game => game.category === category);
    const randomGames = shuffleArray(categoryGames).slice(0, 4);
    const categoryName = categoryNameMap[category] || category;
    
    if (randomGames.length === 0) {
        return '';
    }

    const sectionId = `${category}GamesGrid`;
    
    return `
        <div class="section-header">
            <h2 class="section-title ${isFirst ? 'base1' : ''}" data-category="${category}">${categoryName} game</h2>
        </div>
        <div class="homepage-game-grid" id="${sectionId}">
            ${randomGames.map(game => createGameCardHTML(game)).join('')}
        </div>
    `;
}


function generateAllCategorySections(categoryOrder) {
    if (!mainContent || !categoryOrder || categoryOrder.length === 0) {
        return;
    }

   
    const categorySections = mainContent.querySelectorAll('.category-section');
    categorySections.forEach((section, index) => {
        if (index < categoryOrder.length) {
            const category = categoryOrder[index];
            const categoryContent = generateCategorySectionContent(category, index === 0);
            if (categoryContent) {
                section.innerHTML = categoryContent;
            }
        }
    });
}


function generateCategoriesMenu(categoryOrder) {
    if (!categoriesMenuItems || !categoryOrder || categoryOrder.length === 0) {
        return;
    }

    let menuHTML = '';
    let totalCount = gameDetailsData.length;
   
    const homeCategoryCount = document.getElementById('homeCategoryCount');
    if (homeCategoryCount) {
        homeCategoryCount.textContent = totalCount;
    }

   
    categoryOrder.forEach(category => {
        const categoryGames = gameDetailsData.filter(game => game.category === category);
        const categoryName = categoryNameMap[category] || category;
        const count = categoryGames.length;
        menuHTML += `
            <div class="category-item" data-category="${category}">
                <span class="category-name">${categoryName}</span>
                <span class="category-count">${count}</span>
            </div>
        `;
    });

    categoriesMenuItems.innerHTML = menuHTML;
   
   
    if (!categoriesMenuEventBound) {
        categoriesMenu.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (!categoryItem) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const category = categoryItem.dataset.category;

            categoriesMenu.classList.remove('active');
            if (categoriesOverlay) {
                categoriesOverlay.classList.remove('active');
            }
            
           
            if (category === 'home') {
                return;
            }
           
            const categoryUrl = `pages/category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
            window.location.href = categoryUrl;
        });
        categoriesMenuEventBound = true;
    }
}


menuToggle.addEventListener('click', () => {
    categoriesMenu.classList.add('active');
    categoriesOverlay.classList.add('active');
});

closeCategories.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
    categoriesOverlay.classList.remove('active');
});

categoriesOverlay.addEventListener('click', () => {
    categoriesMenu.classList.remove('active');
    categoriesOverlay.classList.remove('active');
});

function bindSectionTitleEvents() {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.addEventListener('click', () => {
            const category = title.dataset.category;
            if (category) {
                window.location.href = `pages/category.html?category=${category}${window.channel ? '&channel=' + window.channel : ''}`;
            }
        });
    });
}

async function initializePage() {
    try {
        const [gamesData, categoryOrder] = await Promise.all([
            loadGameData(),
            getCategoryOrder()
        ]);

        if (!gamesData || gamesData.length === 0) {
            console.error('No game data loaded');
            return;
        }

        gameDetailsData = gamesData;
        
        // 初始化轮播图
        gameCarousel.init(gamesData);
        
        // 生成分类菜单
        generateCategoriesMenu(categoryOrder);
        
        // 生成所有分类区域内容
        generateAllCategorySections(categoryOrder);
        
        // 绑定分类菜单事件
        bindCategoriesMenuEvents();
        
    } catch (error) {
        console.error('Failed to initialize page:', error);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);

document.addEventListener('click', (e) => {
    if (categoriesMenu && menuToggle && !categoriesMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        categoriesMenu.classList.remove('active');
        if (categoriesOverlay) {
            categoriesOverlay.classList.remove('active');
        }
    }
});

