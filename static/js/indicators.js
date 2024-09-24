const IndicatorManager = (function() {
    let indicators = [];

    function fetchIndicators() {
        return fetch('/api/indicators')
            .then(response => response.json())
            .then(data => {
                indicators = data;
                return data;
            });
    }

    function updateIndicatorsList(containerSelector, category = 'all') {
        const container = document.querySelector(containerSelector);
        container.innerHTML = '';
        const filteredIndicators = category === 'all' 
            ? indicators 
            : indicators.filter(indicator => indicator.category === category);
        
        filteredIndicators.forEach(indicator => {
            const item = document.createElement('div');
            item.className = 'indicator-item';
            item.innerHTML = `
                <span class="indicator-name">${indicator.name}</span>
                <span class="indicator-author">${indicator.author}</span>
                <button class="favorite-btn ${indicator.isFavorite ? 'active' : ''}" data-id="${indicator.id}">
                    <i class="fas fa-star"></i>
                </button>
                <button class="add-indicator-btn" data-id="${indicator.id}">Add</button>
            `;
            item.querySelector('.add-indicator-btn').addEventListener('click', () => addIndicator(indicator));
            item.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e, indicator));
            container.appendChild(item);
        });
    }

    function filterIndicators(query) {
        const filteredIndicators = indicators.filter(indicator => 
            indicator.name.toLowerCase().includes(query.toLowerCase()) ||
            indicator.author.toLowerCase().includes(query.toLowerCase())
        );
        updateIndicatorsList('#indicators-list', filteredIndicators);
    }

    function addIndicator(indicator) {
        console.log(`Adding indicator: ${indicator.name}`);
        // TODO: Implement actual indicator addition to the chart
    }

    function toggleFavorite(event, indicator) {
        const button = event.currentTarget;
        const isFavorite = !indicator.isFavorite;
        button.classList.toggle('active');
        
        fetch('/api/indicators/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: indicator.id, isFavorite: isFavorite }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                indicator.isFavorite = isFavorite;
            }
        })
        .catch(error => console.error('Error:', error));
    }

    return {
        fetchIndicators,
        updateIndicatorsList,
        filterIndicators,
        addIndicator
    };
})();

export default IndicatorManager;
