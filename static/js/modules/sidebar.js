export function initSidebar() {
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    adjustChartSize();
}

function adjustChartSize() {
    var chartContainer = document.getElementById('chart-container');
    var sidebar = document.getElementById('sidebar');
    var watchlistPanel = document.getElementById('watchlist-panel');
   
    var sidebarWidth = sidebar.classList.contains('collapsed') ? 50 : 250;
    var watchlistWidth = watchlistPanel.classList.contains('collapsed') ? 0 : 300;
   
    var newWidth = window.innerWidth - sidebarWidth - watchlistWidth;
    chartContainer.style.width = newWidth + 'px';
   
    if (typeof chart !== 'undefined' && chart) {
        chart.applyOptions({ width: newWidth });
    }
}
