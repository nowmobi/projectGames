// 轮播图数据
const carouselData = [
  {
    title: "Discover New Games",
    description: "Explore thousands of fun games tailored to your taste. From puzzle adventures to action-packed excitement.",
    badge: "Featured",
    cta: "Start Playing",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    onClick: "window.location.href='pages/category.html?category=all'"
  },
  {
    title: "Top Rated Games",
    description: "Play the most popular and highest-rated games loved by millions of players worldwide.",
    badge: "Popular",
    cta: "View Now",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    onClick: "window.location.href='pages/category.html?category=top'"
  },
  {
    title: "Exclusive Offers",
    description: "Get access to exclusive deals and special offers for premium gaming experiences.",
    badge: "Exclusive",
    cta: "Learn More",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    onClick: "window.location.href='pages/category.html?category=exclusive'"
  }
];

// 初始化轮播图
function initCarousel() {
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDots = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!carouselTrack || !carouselDots || !prevBtn || !nextBtn) return;

  // 渲染轮播图项
  carouselData.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.backgroundImage = `url(${item.image})`;
    slide.innerHTML = `
      <div class="carousel-content">
        <span class="carousel-badge">${item.badge}</span>
        <h3 class="carousel-title">${item.title}</h3>
        <p class="carousel-description">${item.description}</p>
        <button class="carousel-cta" onclick="${item.onClick}">${item.cta}</button>
      </div>
    `;
    carouselTrack.appendChild(slide);
  });

  // 创建轮播图指示器
  carouselData.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('data-index', index);
    dot.onclick = () => goToSlide(index);
    carouselDots.appendChild(dot);
  });

  let currentIndex = 0;
  const totalSlides = carouselData.length;

  // 更新轮播图位置
  function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    // 更新指示器
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // 切换到指定幻灯片
  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  // 下一张
  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }

  // 上一张
  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  // 自动播放
  let autoPlayInterval = setInterval(nextSlide, 5000);

  // 暂停自动播放（当用户与轮播图交互时）
  function pauseAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // 恢复自动播放
  function resumeAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  // 事件监听器
  nextBtn.addEventListener('click', () => {
    pauseAutoPlay();
    nextSlide();
    resumeAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    pauseAutoPlay();
    prevSlide();
    resumeAutoPlay();
  });

  // 指示器点击事件
  document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      pauseAutoPlay();
      goToSlide(index);
      resumeAutoPlay();
    });
  });

  // 鼠标悬停暂停
  const container = document.querySelector('.carousel-container');
  if (container) {
    container.addEventListener('mouseenter', pauseAutoPlay);
    container.addEventListener('mouseleave', resumeAutoPlay);
  }

  // 初始化轮播图
  updateCarousel();
}

// 在DOM加载完成后初始化轮播图
document.addEventListener("DOMContentLoaded", function() {
  initCarousel();
});