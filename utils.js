// utils.js - helper functions for Crypto Tracker

/**
 * Debounce a function so it runs after delay ms of inactivity.
 * @param {Function} fn Function to debounce.
 * @param {number} delay milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format large numbers with commas and appropriate units.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}
