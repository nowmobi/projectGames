const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("channel")) {
  window.channel = urlParams.get("channel");
}

if (window.channel) {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    if (link.href && !link.href.includes("channel=")) {
      const url = new URL(link.href);
      url.searchParams.set("channel", window.channel);
      link.href = url.toString();
    }
  });
}

const topBtn = document.getElementById("topBtn");
if (topBtn) {
  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      topBtn.style.display = "flex";
    } else {
      topBtn.style.display = "none";
    }
  });
}

(async () => {
  const searchToggle = document.getElementById("searchToggle");
  const searchContainer = document.getElementById("searchContainer");
  const closeSearch = document.getElementById("closeSearch");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchToggle && searchContainer && searchInput && searchResults) {
    let gameDetails = [];

    const getDetailPagePath = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes("/pages/")) {
        return "../productDetails.html";
      } else {
        return "productDetails.html";
      }
    };

    searchToggle.addEventListener("click", (e) => {
      e.preventDefault();
      searchContainer.classList.add("active");
      searchInput.focus();
    });

    if (closeSearch) {
      closeSearch.addEventListener("click", (e) => {
        e.preventDefault();
        hideSearch();
      });
    }

    function hideSearch() {
      searchContainer.classList.remove("active");
      searchResults.classList.remove("active");
      searchInput.value = "";
    }

    searchInput.addEventListener("input", async (e) => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        if (!gameDetails || gameDetails.length === 0) {
          const { loadGameData } = await import("./BaseURL.js");
          gameDetails = await loadGameData();
        }
        performSearch(query);
        searchResults.classList.add("active");
      } else {
        searchResults.classList.remove("active");
      }
    });

    function performSearch(query) {
      if (!gameDetails || gameDetails.length === 0) {
        displaySearchResults([]);
        return;
      }

      const results = gameDetails.filter(
        (game) =>
          (game.name &&
            game.name.toLowerCase().includes(query.toLowerCase())) ||
          (game.description &&
            game.description.toLowerCase().includes(query.toLowerCase())) ||
          (game.category &&
            game.category.toLowerCase().includes(query.toLowerCase()))
      );

      displaySearchResults(results);
    }

    function displaySearchResults(results) {
      if (!searchResults) {
        return;
      }

      if (results.length === 0) {
        searchResults.innerHTML =
          '<div class="no-results"><h3>No results found</h3><p>Please try different search terms</p></div>';
        return;
      }

      const detailPath = getDetailPagePath();
      searchResults.innerHTML = results
        .slice(0, 5)
        .map(
          (game) => `
        <a href="${detailPath}?id=${game.id}${
            window.channel ? "&channel=" + window.channel : ""
          }" class="search-result-item">
            <img src="${game.image || ""}" alt="${game.name || "Game"}">
            <div class="search-result-info">
                <h4>${game.name || "Unknown Game"}</h4>
            </div>
        </a>
    `
        )
        .join("");
    }

    document.addEventListener("click", (e) => {
      if (
        searchContainer &&
        !searchContainer.contains(e.target) &&
        !searchToggle.contains(e.target)
      ) {
        hideSearch();
      }
    });
  }
})();

// Common menu toggle and categories menu functionality for all pages
(function () {
  const menuToggle = document.getElementById("menuToggle");
  const categoriesMenu = document.getElementById("categoriesMenu");
  const closeCategories = document.getElementById("closeCategories");

  if (menuToggle && categoriesMenu) {
    menuToggle.addEventListener("click", () => {
      categoriesMenu.classList.add("active");
    });
  }

  if (closeCategories && categoriesMenu) {
    closeCategories.addEventListener("click", () => {
      categoriesMenu.classList.remove("active");
    });
  }

  if (categoriesMenu && menuToggle) {
    document.addEventListener("click", (e) => {
      if (
        !categoriesMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        categoriesMenu.classList.remove("active");
      }
    });
  }
})();

// Common function to generate category items for sidebar
// This will be used by all pages that have a categoryItemsContainer
(async () => {
  const categoryItemsContainer = document.getElementById(
    "categoryItemsContainer"
  );
  const homeCount = document.getElementById("homeCount");

  if (categoryItemsContainer) {
    try {
      const { loadGameData, getCategoryOrder } = await import("./BaseURL.js");

      const categoryNameMap = {
        puzzle: "Puzzle",
        action: "Action",
        adventure: "Adventure",
        racing: "Racing",
        sports: "Sports",
        kids: "Kids",
        girl: "Girls",
      };

      const gameDetails = await loadGameData();
      const categories = await getCategoryOrder();

      if (homeCount) {
        homeCount.textContent = gameDetails.length;
      }

      if (categories && Array.isArray(categories) && categories.length > 0) {
        categoryItemsContainer.innerHTML = categories
          .map((category) => {
            const count = gameDetails.filter(
              (game) => game.category === category
            ).length;
            return `
                <div class="category-item" data-category="${category}">
                  <span class="category-name">${
                    categoryNameMap[category] || category
                  }</span>
                  <span class="category-count">${count}</span>
                </div>
              `;
          })
          .join("");

        const newCategoryItems =
          categoryItemsContainer.querySelectorAll(".category-item");
        const categoriesMenu = document.getElementById("categoriesMenu");

        newCategoryItems.forEach((item) => {
          item.addEventListener("click", () => {
            const category = item.dataset.category;
            if (category !== "home") {
              const currentPath = window.location.pathname;
              let categoryUrl = "category.html";

              if (currentPath.includes("/pages/")) {
                categoryUrl = "category.html";
              } else if (currentPath.includes("productDetails.html")) {
                categoryUrl = "pages/category.html";
              } else {
                categoryUrl = "pages/category.html";
              }

              window.location.href = `${categoryUrl}?category=${category}${
                window.channel ? "&channel=" + window.channel : ""
              }`;
            }
            if (categoriesMenu) {
              categoriesMenu.classList.remove("active");
            }
          });
        });

        const homeItem = document.querySelector(
          '.category-item[data-category="home"]'
        );
        if (homeItem) {
          homeItem.addEventListener("click", () => {
            const currentPath = window.location.pathname;
            let homeUrl = "index.html";

            if (currentPath.includes("/pages/")) {
              homeUrl = "../index.html";
            } else if (currentPath.includes("productDetails.html")) {
              homeUrl = "index.html";
            }

            window.location.href = `${homeUrl}${
              window.channel ? "?channel=" + window.channel : ""
            }`;
            if (categoriesMenu) {
              categoriesMenu.classList.remove("active");
            }
          });
        }
      }
    } catch (error) {
      console.error("Error generating category items:", error);
    }
  }
})();

// Category page functionality
if (document.body.classList.contains("category-page")) {
  (async () => {
    const { loadGameData } = await import("./BaseURL.js");
    let gameDetails = await loadGameData();

    const categoryInfo = {
      action: {
        name: "Action Games",
        subtitle: "Fast-paced action and adventure",
      },
      adventure: {
        name: "Adventure Games",
        subtitle: "Explore amazing worlds",
      },
      racing: {
        name: "Racing Games",
        subtitle: "Speed and excitement",
      },
      puzzle: {
        name: "Puzzle Games",
        subtitle: "Challenge your mind",
      },
      sports: {
        name: "Sports Games",
        subtitle: "Athletic competition",
      },
      kids: {
        name: "Kids Games",
        subtitle: "Fun for children",
      },
      girl: {
        name: "Girls Games",
        subtitle: "Games for girls",
      },
    };

    const categoryTitle = document.getElementById("categoryTitle");
    const gamesGrid = document.getElementById("gamesGrid");

    function getUrlParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    function loadCategoryPage() {
      const category = getUrlParameter("category");

      if (!category) {
        window.location.href =
          "../index.html" +
          (window.channel ? "?channel=" + window.channel : "");
        return;
      }

      const categoryGames = gameDetails.filter(
        (game) => game.category === category
      );
      if (categoryGames.length === 0) {
        window.location.href =
          "../index.html" +
          (window.channel ? "?channel=" + window.channel : "");
        return;
      }

      const info = categoryInfo[category] || {
        name: category.charAt(0).toUpperCase() + category.slice(1) + " Games",
        subtitle: "",
      };

      if (categoryTitle) {
        categoryTitle.textContent = info.name;
      }

      const allCategoryItems = document.querySelectorAll(".category-item");
      if (allCategoryItems && allCategoryItems.length > 0) {
        allCategoryItems.forEach((item) => {
          item.classList.remove("active");
          if (item.dataset.category === category) {
            item.classList.add("active");
          }
        });
      }

      generateGamesList(category);
    }

    function generateGamesList(category) {
      if (!gameDetails || gameDetails.length === 0) {
        if (gamesGrid) {
          gamesGrid.innerHTML =
            '<div class="no-results"><h3>Loading games...</h3></div>';
        }
        return;
      }

      const games = gameDetails
        .filter((game) => game.category === category)
        .sort(
          (a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads)
        );

      displayGames(games);
    }

    function parseDownloads(downloadsStr) {
      if (typeof downloadsStr === "string") {
        if (downloadsStr.includes("K")) {
          return parseFloat(downloadsStr.replace("K", "")) * 1000;
        } else if (downloadsStr.includes("M")) {
          return parseFloat(downloadsStr.replace("M", "")) * 1000000;
        } else {
          return parseFloat(downloadsStr) || 0;
        }
      }
      return 0;
    }

    function displayGames(games) {
      if (!gamesGrid) {
        return;
      }

      if (games.length === 0) {
        gamesGrid.innerHTML =
          '<div class="no-results"><h3>No games found</h3><p>No games available in this category</p></div>';
        return;
      }

      gamesGrid.innerHTML = games
        .map(
          (game) => `
        <a href="../productDetails.html?id=${game.id}${
            window.channel ? "&channel=" + window.channel : ""
          }" class="game-card">
            <img src="${game.image}" alt="${game.name}">
            <div class="game-card-content">
                <h3 class="game-title">${game.name}</h3>
                <p class="game-description">${game.description || ""}</p>
                <div class="game-meta">
                    <div class="game-rating">
                        <span class="stars">${"★".repeat(
                          game.rating || 5
                        )}${"☆".repeat(5 - (game.rating || 5))}</span>
                    </div>
                    <span>${game.downloads || "0"}</span>
                </div>
            </div>
        </a>
    `
        )
        .join("");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", async () => {
        if (!gameDetails || gameDetails.length === 0) {
          gameDetails = await loadGameData();
        }
        loadCategoryPage();
      });
    } else {
      (async () => {
        if (!gameDetails || gameDetails.length === 0) {
          gameDetails = await loadGameData();
        }
        loadCategoryPage();
      })();
    }
  })();
}

// 图片懒加载和优化功能
(function() {
  // 图片懒加载
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    // 观察所有带有 data-src 属性的图片
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // 图片加载错误处理
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      const img = e.target;
      if (!img.dataset.errorHandled) {
        img.dataset.errorHandled = 'true';
        img.style.opacity = '0.7';
        img.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        // 添加占位符图标
        if (!img.parentElement.querySelector('.image-placeholder')) {
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            opacity: 0.5;
            pointer-events: none;
          `;
          placeholder.textContent = '📷';
          img.parentElement.style.position = 'relative';
          img.parentElement.appendChild(placeholder);
        }
      }
    }
  }, true);

  // 图片加载完成动画
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
    }
  });

  // 优化图片性能：预加载关键图片
  function preloadImage(src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }

  // 预加载logo和关键图片
  const logoImg = document.querySelector('.logo img');
  if (logoImg && logoImg.src) {
    preloadImage(logoImg.src);
  }
})();