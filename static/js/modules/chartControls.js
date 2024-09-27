export function initChartControls() {
    initializeTimeframeButtons();
    initializeChartButtons();
}

function initializeTimeframeButtons() {
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.timeframe-btn[selected]').removeAttribute('selected');
            e.target.setAttribute('selected', '');
            window.currentTimeframe = e.target.dataset.timeframe;
            window.chartFunctions.switchTimeframe(e.target.dataset.timeframe);
        });
    });
}

function initializeChartButtons() {
    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.target.closest('.tool-button').dataset.tool;
            window.chartFunctions.setActiveDrawingTool(tool);
        });
    });
}

// You might want to add more functions here to handle other chart controls
