// script.js - Main logic for Crypto Tracker (renamed from app.js)

// Constants and selectors
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
const COIN_GRID = document.getElementById("coins-grid");
const FAVORITE_GRID = document.getElementById("favorites-grid");
const FAVORITE_SECTION = document.getElementById("favorites-section");
const SEARCH_INPUT = document.getElementById("search-input");
const THEME_TOGGLE = document.getElementById("theme-toggle");
const TOAST = document.getElementById("toast");

// LocalStorage keys
const LS_FAVORITES = "favorites";
const LS_THEME = "theme";

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

function loadTheme() {
  const saved = localStorage.getItem(LS_THEME);
  if (saved) currentTheme = saved;
  document.documentElement.setAttribute("data-theme", currentTheme);
  THEME_TOGGLE.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem(LS_THEME, currentTheme);
  THEME_TOGGLE.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

function loadFavorites() {
  const stored = localStorage.getItem(LS_FAVORITES);
  if (stored) {
    try { favorites = JSON.parse(stored); } catch { favorites = []; }
  }
}

function saveFavorites() {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
}

function isFavorited(id) { return favorites.includes(id); }

function toggleFavorite(id) {
  if (isFavorited(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast("Removed from watchlist", "info");
  } else {
    favorites.push(id);
    showToast("Added to watchlist", "success");
  }
  saveFavorites();
  renderCoins();
  renderFavorites();
}

function createCard(coin) {
  const card = document.createElement("div");
  card.className = "card";

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
  favBtn.addEventListener("click", e => { e.stopPropagation(); toggleFavorite(coin.id); });

  header.append(img, title, favBtn);

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
  card.addEventListener("click", () => {
    window.open(`https://www.coingecko.com/en/coins/${coin.id}`, "_blank");
  });
  return card;
}

function renderCoins() {
  const query = SEARCH_INPUT.value.trim().toLowerCase();
  const filtered = allCoins.filter(c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query));
  COIN_GRID.innerHTML = "";
  if (filtered.length === 0) { COIN_GRID.innerHTML = `<p>No coins match your search.</p>`; return; }
  const fragment = document.createDocumentFragment();
  filtered.forEach(c => fragment.appendChild(createCard(c)));
  COIN_GRID.appendChild(fragment);
}

function renderFavorites() {
  if (favorites.length === 0) { FAVORITE_SECTION.classList.add("hidden"); FAVORITE_GRID.innerHTML = ""; return; }
  FAVORITE_SECTION.classList.remove("hidden");
  const favCoins = allCoins.filter(c => favorites.includes(c.id));
  FAVORITE_GRID.innerHTML = "";
  const fragment = document.createDocumentFragment();
  favCoins.forEach(c => fragment.appendChild(createCard(c)));
  FAVORITE_GRID.appendChild(fragment);
}

async function fetchCoins() {
  // Show loading state
  COIN_GRID.innerHTML = `<p>Loading...</p>`;
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

function init() {
  loadTheme();
  loadFavorites();
  fetchCoins();
  loadChart();
  THEME_TOGGLE.addEventListener("click", toggleTheme);
  SEARCH_INPUT.addEventListener("input", debounce(renderCoins, 300));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else { init(); }

// Import debounce & formatNumber from utils.js
import { debounce, formatNumber } from "./utils.js";

// Chart.js integration
async function loadChart(coinId = 'bitcoin', days = 7) {
  const chartContainer = document.getElementById('priceChart').parentElement;
  chartContainer.innerHTML = '<p>Loading chart...</p>';
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    if (!res.ok) throw new Error(`Chart API error: ${res.status}`);
    const data = await res.json();
    const prices = data.prices;
    const labels = prices.map(p => new Date(p[0]).toLocaleDateString());
    const values = prices.map(p => p[1]);
    const trend = values[values.length - 1] >= values[0] ? 'up' : 'down';
    // Recreate canvas
    chartContainer.innerHTML = '<canvas id="priceChart"></canvas>';
    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${coinId.charAt(0).toUpperCase() + coinId.slice(1)} Price`,
          data: values,
          borderColor: trend === 'up' ? 'rgba(0,200,83,0.9)' : 'rgba(255,69,58,0.9)',
          backgroundColor: trend === 'up' ? 'rgba(0,200,83,0.2)' : 'rgba(255,69,58,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: { mode: 'index', intersect: false },
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { beginAtZero: false }
        }
      }
    });
  } catch (err) {
    console.error(err);
    showToast('Failed to load chart data.', 'error');
    chartContainer.innerHTML = '<p>Error loading chart.</p>';
  }
}

