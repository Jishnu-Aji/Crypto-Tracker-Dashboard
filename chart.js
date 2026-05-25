// chart.js - Chart.js integration helpers for Crypto Tracker

/**
 * Fetch market chart data for a coin.
 * @param {string} coinId - CoinGecko coin id (e.g., 'bitcoin')
 * @param {number} days - Number of days for history (7, 30, 365)
 * @returns {Promise<{prices: Array<[timestamp, price]>>}>}
 */
export async function fetchMarketChart(coinId, days) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chart API error: ${res.status}`);
  const data = await res.json();
  return data; // data.prices is array of [timestamp, price]
}

/**
 * Create or update a Chart.js line chart.
 * @param {HTMLCanvasElement} canvas - Canvas element where chart is rendered.
 * @param {Array<[number, number]>} priceData - Array of [timestamp, price].
 * @param {string} trend - 'up' or 'down' for line color.
 * @returns {Chart} Chart.js instance.
 */
export function renderChart(canvas, priceData, trend) {
  const ctx = canvas.getContext('2d');
  // Convert timestamps to readable dates (MM/DD)
  const labels = priceData.map(p => new Date(p[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const prices = priceData.map(p => p[1]);

  // Destroy previous chart if exists (Chart.js stores instance on canvas)
  if (canvas.chart) {
    canvas.chart.destroy();
  }

  const lineColor = trend === 'up' ? 'rgba(0, 200, 83, 0.9)' : 'rgba(255, 69, 58, 0.9)';
  const bgColor = trend === 'up' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 69, 58, 0.2)';

  canvas.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (USD)',
        data: prices,
        borderColor: lineColor,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          },
        },
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { beginAtZero: false },
      },
    },
  });
  return canvas.chart;
}
