// app.js - Main logic for Crypto Tracker

// Constants and selectors
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
const COIN_GRID = document.getElementById("coins-grid");
const FAVORITE_GRID = document.getElementById("favorites-grid");
const FAVORITE_SECTION = document.getElementById("favorites-section");
const SEARCH_INPUT = document.getElementById("search-input");
const THEME_TOGGLE = document.getElementById("theme-toggle");
const TOAST = document.getElementById("toast");

// LocalStorage keys
const LS_FAVORITES = "crypto_favorites";
const LS_THEME = "crypto_theme";

// App state
let allCoins = [];
let favorites = [];
let currentTheme = "light";

/** Utility: Show toast messages */
function showToast(message, type = "info") {
  TOAST.textContent = message;
  TOAST.className = "toast show";
  if (type === "error") TOAST.style.background = "var(--color-error)";
  else if (type === "success") TOAST.style.background = "var(--color-success)";
  else TOAST.style.background = "var(--color-surface)";
  setTimeout(() => {
    TOAST.classList.remove("show");
  }, 3000);
}

/** Load theme from localStorage and apply */
function loadTheme() {
  const saved = localStorage.getItem(LS_THEME);
  if (saved) currentTheme = saved;
  document.documentElement.setAttribute("data-theme", currentTheme);
  THEME_TOGGLE.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

/** Toggle dark/light theme */
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem(LS_THEME, currentTheme);
  THEME_TOGGLE.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

/** Load favorite coin IDs from localStorage */
function loadFavorites() {
  const stored = localStorage.getItem(LS_FAVORITES);
  if (stored) {
    try {
      favorites = JSON.parse(stored);
    } catch {
      favorites = [];
    }
  }
}

/** Save current favorites array to localStorage */
function saveFavorites() {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
}

/** Check if a coin ID is favorited */
function isFavorited(id) {
  return favorites.includes(id);
}

/** Toggle favorite status for a coin */
function toggleFavorite(id) {
  if (isFavorited(id)) {
    favorites = favorites.filter((fid) => fid !== id);
    showToast("Removed from watchlist", "info");
  } else {
    favorites.push(id);
    showToast("Added to watchlist", "success");
  }
  saveFavorites();
  renderCoins();
  renderFavorites();
}

/** Create a single card element for a coin */
function createCard(coin) {
  const card = document.createElement("div");
  card.className = "card";
  // Header with logo, name and favorite button
  const header = document.createElement("div");
  header.className = "card-header";

  const img = document.createElement("img");
  img.src = coin.image;
  img.alt = `${coin.name} logo`;
  img.loading = "lazy";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;

  const favBtn = document.createElement("button");
  favBtn.className = "favorite-btn";
  favBtn.innerHTML = isFavorited(coin.id) ? "★" : "☆";
  if (isFavorited(coin.id)) favBtn.classList.add("faved");
  favBtn.title = isFavorited(coin.id) ? "Remove from watchlist" : "Add to watchlist";
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(coin.id);
  });

  header.append(img, title, favBtn);

  // Price information
  const price = document.createElement("div");
  price.className = "price";
  price.textContent = `$${coin.current_price.toLocaleString()}`;

  const change = document.createElement("div");
  change.className = "change";
  const changeVal = coin.price_change_percentage_24h?.toFixed(2) ?? "0";
  change.textContent = `${changeVal}%`;
  change.classList.add(changeVal >= 0 ? "up" : "down");

  const marketCap = document.createElement("div");
  marketCap.textContent = `MCap: $${formatNumber(coin.market_cap)}`;
  marketCap.style.fontSize = "0.85rem";
  marketCap.style.color = "var(--color-muted)";

  card.append(header, price, change, marketCap);

  // Clicking the card could open CoinGecko page (optional)
  card.addEventListener("click", () => {
    window.open(`https://www.coingecko.com/en/coins/${coin.id}`, "_blank");
  });

  return card;
}

/** Render the main coin list (filtered by search) */
function renderCoins() {
  const query = SEARCH_INPUT.value.trim().toLowerCase();
  const filtered = allCoins.filter(
    (c) => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
  );
  COIN_GRID.innerHTML = "";
  if (filtered.length === 0) {
    COIN_GRID.innerHTML = `<p>No coins match your search.</p>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  filtered.forEach((coin) => {
    fragment.appendChild(createCard(coin));
  });
  COIN_GRID.appendChild(fragment);
}

/** Render the favorites/watchlist section */
function renderFavorites() {
  if (favorites.length === 0) {
    FAVORITE_SECTION.classList.add("hidden");
    FAVORITE_GRID.innerHTML = "";
    return;
  }
  FAVORITE_SECTION.classList.remove("hidden");
  const favCoins = allCoins.filter((c) => favorites.includes(c.id));
  FAVORITE_GRID.innerHTML = "";
  const fragment = document.createDocumentFragment();
  favCoins.forEach((coin) => {
    fragment.appendChild(createCard(coin));
  });
  FAVORITE_GRID.appendChild(fragment);
}

/** Fetch coin data from CoinGecko */
async function fetchCoins() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    allCoins = data;
    renderCoins();
    renderFavorites();
  } catch (err) {
    console.error(err);
    showToast("Failed to load data. Please try again later.", "error");
  }
}

/** Initialize the app */
function init() {
  loadTheme();
  loadFavorites();
  fetchCoins();
  // Event listeners
  THEME_TOGGLE.addEventListener("click", toggleTheme);
  SEARCH_INPUT.addEventListener("input", debounce(renderCoins, 300));
}

// Start the app once the DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
