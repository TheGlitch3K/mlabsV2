let chart;
let candleSeries;
let activeDrawingTool = null;
let drawings = [];

function createChart() {
   const chartContainer = document.getElementById('candlestick-chart');
   chart = LightweightCharts.createChart(chartContainer, {
       width: chartContainer.offsetWidth,
       height: chartContainer.offsetHeight,
       layout: {
           backgroundColor: getComputedStyle(document.body).getPropertyValue('--chart-bg').trim(),
           textColor: getComputedStyle(document.body).getPropertyValue('--text-color').trim(),
       },
       grid: {
           vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
           horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
       },
       crosshair: {
           mode: LightweightCharts.CrosshairMode.Normal,
       },
       rightPriceScale: {
           borderColor: 'rgba(197, 203, 206, 0.8)',
       },
       timeScale: {
           borderColor: 'rgba(197, 203, 206, 0.8)',
           timeVisible: true,
           secondsVisible: false,
       },
   });

   candleSeries = chart.addCandlestickSeries({
       upColor: '#26a69a',
       downColor: '#ef5350',
       borderVisible: false,
       wickUpColor: '#26a69a',
       wickDownColor: '#ef5350',
   });

   chart.subscribeCrosshairMove(param => {
       if (param.time) {
           const data = param.seriesData.get(candleSeries);
           if (data) {
               const symbolInfo = document.getElementById('symbol-info');
               symbolInfo.innerHTML = `O: ${data.open.toFixed(5)} H: ${data.high.toFixed(5)} L: ${data.low.toFixed(5)} C: ${data.close.toFixed(5)}`;
           }
       }
   });

   chart.timeScale().fitContent();

   chartContainer.addEventListener('mousedown', handleMouseDown);
   chartContainer.addEventListener('mousemove', handleMouseMove);
   chartContainer.addEventListener('mouseup', handleMouseUp);
   chartContainer.addEventListener('contextmenu', handleContextMenu);

   window.addEventListener('resize', () => {
       chart.applyOptions({
           width: chartContainer.offsetWidth,
           height: chartContainer.offsetHeight
       });
   });

   fetchLatestData();
}

function fetchLatestData() {
   fetch(`/api/candlestick_data?symbol=${currentSymbol}&timeframe=${currentTimeframe}&count=1000`)
       .then(response => response.json())
       .then(data => {
           if (data && data.length > 0) {
               const formattedData = data.map(d => ({
                   time: new Date(d.time).getTime() / 1000,
                   open: parseFloat(d.open),
                   high: parseFloat(d.high),
                   low: parseFloat(d.low),
                   close: parseFloat(d.close)
               }));
               candleSeries.setData(formattedData);
               updateSymbolInfo(currentSymbol, formattedData[formattedData.length - 1]);
           }
       })
       .catch(error => console.error('Error fetching candlestick data:', error));
}

function updateSymbolInfo(symbol, lastCandle) {
   const symbolInfo = document.getElementById('symbol-info');
   symbolInfo.innerHTML = `${symbol} O: ${lastCandle.open.toFixed(5)} H: ${lastCandle.high.toFixed(5)} L: ${lastCandle.low.toFixed(5)} C: ${lastCandle.close.toFixed(5)}`;
}

function switchTimeframe(timeframe) {
   currentTimeframe = timeframe;
   fetchLatestData();
}

function switchSymbol(symbol) {
   currentSymbol = symbol;
   fetchLatestData();
}

let drawingStartPoint = null;
let currentDrawing = null;

function handleMouseDown(e) {
   if (activeDrawingTool) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);
       drawingStartPoint = { time: coords, price: price };
   }
}

function handleMouseMove(e) {
   if (activeDrawingTool && drawingStartPoint) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);

       if (currentDrawing) {
           chart.removeSeries(currentDrawing);
       }

       if (activeDrawingTool === 'trendline') {
           currentDrawing = chart.addLineSeries({
               color: '#2962FF',
               lineWidth: 2,
           });
           currentDrawing.setData([
               { time: drawingStartPoint.time, value: drawingStartPoint.price },
               { time: coords, value: price }
           ]);
       } else if (activeDrawingTool === 'horizontalLine') {
           currentDrawing = chart.addLineSeries({
               color: '#2962FF',
               lineWidth: 2,
               priceLineVisible: false,
           });
           currentDrawing.setData([
               { time: chart.timeScale().getVisibleLogicalRange().from, value: drawingStartPoint.price },
               { time: chart.timeScale().getVisibleLogicalRange().to, value: drawingStartPoint.price }
           ]);
       }
   }
}

function handleMouseUp(e) {
   if (activeDrawingTool && drawingStartPoint) {
       const coords = chart.timeScale().coordinateToLogical(e.clientX);
       const price = chart.priceScale('right').coordinateToPrice(e.clientY);

       if (currentDrawing) {
           drawings.push(currentDrawing);
           currentDrawing = null;
       }

       drawingStartPoint = null;
   }
}

function handleContextMenu(e) {
   e.preventDefault();
   showChartContextMenu(e.clientX, e.clientY);
}

function showChartContextMenu(x, y) {
   const contextMenu = document.getElementById('chart-context-menu');
   contextMenu.style.display = 'block';
   contextMenu.style.left = `${x}px`;
   contextMenu.style.top = `${y}px`;

   // Populate context menu options
   contextMenu.innerHTML = `
       <div class="context-menu-item" onclick="toggleLogScale()">Toggle Log Scale</div>
       <div class="context-menu-item" onclick="showChartSettings()">Chart Settings</div>
   `;
}

function toggleLogScale() {
   const currentScale = chart.priceScale('right').mode();
   chart.priceScale('right').applyOptions({
       mode: currentScale === 0 ? 1 : 0, // 0 for normal, 1 for logarithmic
   });
   hideChartContextMenu();
}

function showChartSettings() {
   // Implement chart settings dialog
   console.log("Chart settings clicked");
   hideChartContextMenu();
}

function hideChartContextMenu() {
   const contextMenu = document.getElementById('chart-context-menu');
   contextMenu.style.display = 'none';
}

function setActiveDrawingTool(tool) {
   activeDrawingTool = tool;
}

function getLastPrice() {
   const visibleData = candleSeries.visibleData();
   if (visibleData.length > 0) {
       return visibleData[visibleData.length - 1].close;
   }
   return null;
}

document.addEventListener('DOMContentLoaded', createChart);

// Expose functions to be used in app.js
window.chartFunctions = {
   switchTimeframe,
   switchSymbol,
   fetchLatestData,
   setActiveDrawingTool,
   getLastPrice
};
