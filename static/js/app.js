let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['EUR_USD', 'GBP_USD'];
let currentSymbol = 'EUR_USD';
let currentTimeframe = 'H1';
let strategies = ['Moving Average Crossover', 'RSI Overbought/Oversold', 'MACD Divergence'];
let activeStrategy = null;

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    updateChartTheme();
}

function updateChartTheme() {
    if (typeof chart !== 'undefined' && chart) {
        chart.applyOptions({
            layout: {
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--chart-bg').trim(),
                textColor: getComputedStyle(document.body).getPropertyValue('--text-color').trim(),
            }
        });
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    adjustChartSize();
}

function toggleWatchlist() {
    const watchlistPanel = document.getElementById('watchlist-panel');
    watchlistPanel.classList.toggle('collapsed');
    const toggleButton = document.getElementById('watchlist-toggle');
    toggleButton.classList.toggle('hidden');
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
            currentSymbol = symbol;
            window.chartFunctions.switchSymbol(symbol);
        });
        container.appendChild(item);
    });
    updateWatchlistData();
}

function toggleChatPanel() {
    const chatPanel = document.getElementById('ai-chat-panel');
    chatPanel.classList.toggle('open');
}

function maximizeChatPanel() {
    const chatPanel = document.getElementById('ai-chat-panel');
    chatPanel.classList.toggle('maximized');
}

function sendChatMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (message) {
        appendChatMessage('User', message);
        input.value = '';
        fetch('/api/ai_chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: message,
                chartContext: {
                    symbol: currentSymbol,
                    timeframe: currentTimeframe,
                    price: window.chartFunctions.getLastPrice(),
                    indicators: getActiveIndicators()
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                appendChatMessage('AI', data.response);
            } else {
                appendChatMessage('AI', 'Error: Unable to get a response.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            appendChatMessage('AI', 'Error: Unable to get a response.');
        });
    }
}

function appendChatMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender.toLowerCase()}-message`;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getActiveIndicators() {
    // Implement this function to return active indicators
    return [];
}

function initializeWatchlist() {
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

    // Close the dropdown if the user clicks outside of it
    window.addEventListener('click', (e) => {
        if (!e.target.matches('#instrument-category-button')) {
            categoryContent.classList.remove('show');
        }
    });

    updateWatchlistUI();
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

function initializeStrategiesDropdown() {
    const dropdown = document.getElementById('strategies-dropdown');
    const dropdownBtn = document.getElementById('strategies-dropdown-btn');

    // Populate dropdown with strategies
    strategies.forEach(strategy => {
        const button = document.createElement('button');
        button.textContent = strategy;
        button.addEventListener('click', () => selectStrategy(strategy));
        dropdown.appendChild(button);
    });

    // Toggle dropdown visibility
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

function selectStrategy(strategy) {
    activeStrategy = strategy;
    console.log(`Selected strategy: ${strategy}`);
    // Here you would typically call a function to apply the strategy to the chart
    applyStrategyToChart(strategy);
}

function applyStrategyToChart(strategy) {
    // Remove any existing strategy indicators
    removeExistingStrategyIndicators();

    switch(strategy) {
        case 'Moving Average Crossover':
            addMovingAverageCrossover();
            break;
        case 'RSI Overbought/Oversold':
            addRSIStrategy();
            break;
        case 'MACD Divergence':
            addMACDDivergence();
            break;
    }
}

function removeExistingStrategyIndicators() {
    // Implement this function to remove existing strategy indicators from the chart
    console.log('Removing existing strategy indicators');
}

function addMovingAverageCrossover() {
    // Implement Moving Average Crossover strategy
    console.log('Adding Moving Average Crossover strategy');
    window.chartFunctions.addIndicator('sma', { period: 10, color: 'blue' });
    window.chartFunctions.addIndicator('sma', { period: 20, color: 'red' });
}

function addRSIStrategy() {
    // Implement RSI Overbought/Oversold strategy
    console.log('Adding RSI Overbought/Oversold strategy');
    window.chartFunctions.addIndicator('rsi', { period: 14, overbought: 70, oversold: 30 });
}

function addMACDDivergence() {
    // Implement MACD Divergence strategy
    console.log('Adding MACD Divergence strategy');
    window.chartFunctions.addIndicator('macd', { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
}

function initializeIndicatorsModal() {
    const modal = document.getElementById('indicators-modal');
    const btn = document.getElementById('indicators-button');
    const span = document.getElementsByClassName('close')[0];
    const indicatorsList = document.getElementById('indicators-list');
    const indicatorSearch = document.getElementById('indicator-search');
    const categoryButtons = document.querySelectorAll('.category-btn');

    btn.onclick = () => modal.style.display = 'block';
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Populate indicators list
    const indicators = [
        { name: 'Simple Moving Average', category: 'trend' },
        { name: 'Exponential Moving Average', category: 'trend' },
        { name: 'Relative Strength Index', category: 'momentum' },
        { name: 'Moving Average Convergence Divergence', category: 'momentum' },
        { name: 'Bollinger Bands', category: 'volatility' },
        { name: 'Average True Range', category: 'volatility' },
        { name: 'On-Balance Volume', category: 'volume' },
    ];

    function renderIndicators(filteredIndicators) {
        indicatorsList.innerHTML = '';
        filteredIndicators.forEach(indicator => {
            const item = document.createElement('div');
            item.className = 'indicator-item';
            item.innerHTML = `
                <span>${indicator.name}</span>
                <button class="add-indicator-btn">Add</button>
                <button class="favorite-btn"><i class="far fa-star"></i></button>
            `;
            item.querySelector('.add-indicator-btn').addEventListener('click', () => addIndicator(indicator.name));
            item.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e.target));
            indicatorsList.appendChild(item);
        });
    }

    renderIndicators(indicators);

    indicatorSearch.addEventListener('input', () => {
        const searchTerm = indicatorSearch.value.toLowerCase();
        const filteredIndicators = indicators.filter(indicator => 
            indicator.name.toLowerCase().includes(searchTerm)
        );
        renderIndicators(filteredIndicators);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            const filteredIndicators = category === 'all' 
                ? indicators 
                : indicators.filter(indicator => indicator.category === category);
            renderIndicators(filteredIndicators);
        });
    });
}

function addIndicator(indicatorName) {
    console.log(`Adding indicator: ${indicatorName}`);
    // Implement the logic to add the indicator to the chart
    // You might want to call a function from chartFunctions here
}

function toggleFavorite(button) {
    button.classList.toggle('active');
    // Implement the logic to save favorite indicators
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
   
    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('watchlist-toggle').addEventListener('click', toggleWatchlist);
    document.getElementById('ai-chat-icon').addEventListener('click', toggleChatPanel);
    document.getElementById('close-chat').addEventListener('click', toggleChatPanel);
    document.getElementById('maximize-chat').addEventListener('click', maximizeChatPanel);
    document.getElementById('send-message').addEventListener('click', sendChatMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
   
    initializeWatchlist();
    initializeStrategiesDropdown();
    initializeIndicatorsModal();
   
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.timeframe-btn[selected]').removeAttribute('selected');
            e.target.setAttribute('selected', '');
            currentTimeframe = e.target.dataset.timeframe;
            window.chartFunctions.switchTimeframe(e.target.dataset.timeframe);
        });
    });

    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.target.closest('.tool-button').dataset.tool;
            window.chartFunctions.setActiveDrawingTool(tool);
        });
    });

    window.addEventListener('resize', adjustChartSize);
    adjustChartSize();
});

setInterval(updateWatchlistData, 60000);

// Export functions to be used by other modules if needed
window.appFunctions = {
    toggleTheme,
    toggleSidebar,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleChatPanel,
    maximizeChatPanel,
    sendChatMessage,
    selectStrategy,
    addIndicator
};