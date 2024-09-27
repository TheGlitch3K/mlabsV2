let strategies = ['Moving Average Crossover', 'RSI Overbought/Oversold', 'MACD Divergence'];
let activeStrategy = null;

export function initStrategies() {
    initializeStrategiesDropdown();
}

function initializeStrategiesDropdown() {
    const dropdown = document.getElementById('strategies-dropdown');
    const dropdownBtn = document.getElementById('strategies-dropdown-btn');

    strategies.forEach(strategy => {
        const button = document.createElement('button');
        button.textContent = strategy;
        button.addEventListener('click', () => selectStrategy(strategy));
        dropdown.appendChild(button);
    });

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    window.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

function selectStrategy(strategy) {
    activeStrategy = strategy;
    console.log(`Selected strategy: ${strategy}`);
    applyStrategyToChart(strategy);
}

function applyStrategyToChart(strategy) {
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
    console.log('Removing existing strategy indicators');
}

function addMovingAverageCrossover() {
    console.log('Adding Moving Average Crossover strategy');
    window.chartFunctions.addIndicator('sma', { period: 10, color: 'blue' });
    window.chartFunctions.addIndicator('sma', { period: 20, color: 'red' });
}

function addRSIStrategy() {
    console.log('Adding RSI Overbought/Oversold strategy');
    window.chartFunctions.addIndicator('rsi', { period: 14, overbought: 70, oversold: 30 });
}

function addMACDDivergence() {
    console.log('Adding MACD Divergence strategy');
    window.chartFunctions.addIndicator('macd', { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
}
