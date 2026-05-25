# Crypto Tracker Dashboard

A modern, responsive client‑side web application that tracks live cryptocurrency prices using the **CoinGecko API**.

## Features
- Real‑time price, market cap, and 24h change for the top 100 coins
- Search bar with debounce filtering
- Favorites / watchlist stored in **localStorage**
- Dark / Light theme toggle (preference saved)
- Glass‑morphism card UI with hover animations
- Responsive grid that works on mobile and desktop
- Graceful loading states and error handling

## Tech Stack
- **HTML5**
- **CSS3** (custom variables, dark/light mode, glass‑morphism)
- **Vanilla JavaScript (ESM)**
- **Fetch API** for data requests
- **localStorage** for persistence

## Setup & Development
1. **Clone the repository** (or copy the folder `web-api`).
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox). No build step is required.
3. The app will automatically fetch data from CoinGecko. Ensure you have an internet connection.

## Project Structure
```
web-api/
├─ index.html      # Main page with semantic markup
├─ styles.css      # Premium CSS (dark/light, glassmorphism, responsive)
├─ utils.js        # Helper utilities (debounce, number formatting)
├─ app.js          # Core JS – API, rendering, state management
└─ README.md       # This file
```

## Screenshots
*(Add screenshots here – you can generate mockups with the `generate_image` tool if needed.)*

## Deployment
The app consists of static files only, so you can host it on any static site provider:
- **GitHub Pages** – push the folder to a repo and enable Pages.
- **Netlify** – drag‑and‑drop the folder in the Netlify UI.
- **Vercel** – create a new project and point it to the repository.

## Credits
- Data powered by the **CoinGecko API** (https://www.coingecko.com/en/api)
- Font: **Inter** (Google Fonts)
- Icons & logos from CoinGecko

---
*Happy tracking!*
