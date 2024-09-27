import { initTheme } from './modules/theme.js';
import { initSidebar } from './modules/sidebar.js';
import { initWatchlist } from './modules/watchlist.js';
import { initChat } from './modules/chat.js';
import { initStrategies } from './modules/strategies.js';
import { initIndicators } from './modules/indicators.js';
import { initChartControls } from './modules/chartControls.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initWatchlist();
    initChat();
    initStrategies();
    initIndicators();
    initChartControls();
});
