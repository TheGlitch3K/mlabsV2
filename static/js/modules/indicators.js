export function initIndicators() {
    initializeIndicatorsModal();
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
