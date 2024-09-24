let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['EUR_USD', 'GBP_USD'];
let currentSymbol = 'EUR_USD';
let currentTimeframe = 'H1';

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
   const chartContainer = document.getElementById('chart-container');
   const sidebar = document.getElementById('sidebar');
   const watchlistPanel = document.getElementById('watchlist-panel');
  
   const sidebarWidth = sidebar.classList.contains('collapsed') ? 50 : 250;
   const watchlistWidth = watchlistPanel.classList.contains('collapsed') ? 0 : 300;
  
   const newWidth = window.innerWidth - sidebarWidth - watchlistWidth;
   chartContainer.style.width = `${newWidth}px`;
  
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
