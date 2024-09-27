export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
   
    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
}

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
