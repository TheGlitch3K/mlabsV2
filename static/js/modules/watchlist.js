let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['EUR_USD', 'GBP_USD'];

export function initWatchlist() {
    const watchlistSearch = document.getElementById('watchlist-search');
    const categoryButton = document.getElementById('instrument-category-button');
    const categoryContent = document.getElementById('instrument-category-content');

    watchlistSearch.addEventListener('input', debounce(handleSearch, 300));

    categoryButton.addEventListener('click', () => {
        categoryContent.classList.toggle('show');
    });

    document.querySelectorAll('#instrument-category-content a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            categoryButton.textContent = item.textContent;
            categoryContent.classList.remove('show');
            handleSearch();
        });
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('#instrument-category-button')) {
            categoryContent.classList.remove('show');
        }
    });

    document.getElementById('watchlist-toggle').addEventListener('click', toggleWatchlist);

    updateWatchlistUI();
}

function toggleWatchlist() {
    const watchlistPanel = document.getElementById('watchlist-panel');
    watchlistPanel.classList.toggle('collapsed');
    const toggleButton = document.getElementById('watchlist-toggle');
    toggleButton.classList.toggle('hidden');
    adjustChartSize();
}

function handleSearch() {
    const query = document.getElementById('watchlist-search').value.trim();
    const category = document.getElementById('instrument-category-button').textContent.toLowerCase();
   
    if (query.length > 0 || category !== 'all') {
        searchInstruments(query, category);
    } else {
        document.getElementById('search-results').innerHTML = '';
    }
}

function searchInstruments(query, category) {
    fetch(`/api/search_instruments?query=${query}&category=${category}`)
        .then(response => response.json())
        .then(data => {
            updateSearchResults(data);
        })
        .catch(error => console.error('Error searching instruments:', error));
}

function updateSearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    results.forEach(instrument => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <span class="instrument-name">${instrument}</span>
            <button class="add-btn">${watchlist.includes(instrument) ? '-' : '+'}</button>
        `;
        item.querySelector('.instrument-name').addEventListener('click', () => {
            window.chartFunctions.switchSymbol(instrument);
        });
        item.querySelector('.add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (watchlist.includes(instrument)) {
                removeFromWatchlist(instrument);
            } else {
                addToWatchlist(instrument);
            }
            e.target.textContent = watchlist.includes(instrument) ? '-' : '+';
        });
        searchResults.appendChild(item);
    });
}

function addToWatchlist(symbol) {
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        saveWatchlist();
        updateWatchlistUI();
    }
}

function removeFromWatchlist(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    saveWatchlist();
    updateWatchlistUI();
}

function saveWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function updateWatchlistUI() {
    const container = document.getElementById('watchlist-container');
    container.innerHTML = '';
    watchlist.forEach(symbol => {
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        item.setAttribute('draggable', true);
        item.dataset.symbol = symbol;
        item.innerHTML = `
            <span class="symbol">${symbol}</span>
            <span class="price">--</span>
            <span class="change">--</span>
            <button class="remove-btn">-</button>
        `;
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromWatchlist(symbol);
        });
        item.addEventListener('click', () => {
            window.chartFunctions.switchSymbol(symbol);
        });
        container.appendChild(item);
    });
    updateWatchlistData();
}

function updateWatchlistData() {
    watchlist.forEach(symbol => {
        fetch(`/api/price_data?symbol=${symbol}`)
            .then(response => response.json())
            .then(data => {
                const item = document.querySelector(`.watchlist-item[data-symbol="${symbol}"]`);
                if (item && data.price) {
                    item.querySelector('.price').textContent = data.price.toFixed(5);
                    item.querySelector('.change').textContent = data.change.toFixed(2) + '%';
                }
            })
            .catch(error => console.error('Error fetching price data:', error));
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

setInterval(updateWatchlistData, 60000);
