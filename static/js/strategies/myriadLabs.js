// MyriadLabs Strategy Implementation in JavaScript

const MyriadLabsStrategy = (function() {

    function calculateMACD(priceData, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const macdLine = [];
        const signalLine = [];
        const histogram = [];

        const emaFast = calculateEMA(priceData.map(p => p.close), fastPeriod);
        const emaSlow = calculateEMA(priceData.map(p => p.close), slowPeriod);

        for (let i = 0; i < priceData.length; i++) {
            const macdValue = emaFast[i] - emaSlow[i];
            macdLine.push(macdValue);
        }

        const signalEMA = calculateEMA(macdLine, signalPeriod);

        for (let i = 0; i < priceData.length; i++) {
            signalLine.push(signalEMA[i]);
            histogram.push(macdLine[i] - signalLine[i]);
        }

        return { macdLine, signalLine, histogram };
    }

    function calculateEMA(data, period) {
        const k = 2 / (period + 1);
        const emaArray = [];
        let ema = data[0];
        for (let i = 0; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
            emaArray.push(ema);
        }
        return emaArray;
    }

    function detectDivergence(priceData, macdHistogram) {
        const divergences = [];

        for (let i = 2; i < priceData.length; i++) {
            const currentPrice = priceData[i].close;
            const prevPrice = priceData[i - 1].close;
            const prevPrevPrice = priceData[i - 2].close;

            const currentHist = macdHistogram[i];
            const prevHist = macdHistogram[i - 1];
            const prevPrevHist = macdHistogram[i - 2];

            // Bullish Divergence
            if (currentPrice < prevPrice && prevPrice < prevPrevPrice &&
                currentHist > prevHist && prevHist > prevPrevHist) {
                divergences.push({ index: i, type: 'bullish' });
            }
            // Bearish Divergence
            else if (currentPrice > prevPrice && prevPrice > prevPrevPrice &&
                currentHist < prevHist && prevHist < prevPrevHist) {
                divergences.push({ index: i, type: 'bearish' });
            }
        }

        return divergences;
    }

    let trades = [];
    let performanceMetrics = {
        netProfit: 0,
        grossProfit: 0,
        grossLoss: 0,
        maxDrawdown: 0,
        maxEquity: 0,
        totalTradesClosed: 0,
        winningTrades: 0,
        percentProfitable: 0,
        avgTrade: 0,
        profitFactor: 0,
    };

    function evaluateStrategy(priceData, macdData, divergences) {
        trades = [];
        performanceMetrics = {
            netProfit: 0,
            grossProfit: 0,
            grossLoss: 0,
            maxDrawdown: 0,
            maxEquity: 0,
            totalTradesClosed: 0,
            winningTrades: 0,
            percentProfitable: 0,
            avgTrade: 0,
            profitFactor: 0,
        };

        let openTrade = null;

        for (let i = 0; i < priceData.length; i++) {
            const price = priceData[i];
            const divergence = divergences.find(d => d.index === i);

            // Entry Signals
            if (!openTrade && divergence) {
                if (divergence.type === 'bullish') {
                    openTrade = {
                        type: 'long',
                        entryPrice: price.close,
                        entryIndex: i,
                        sl: price.close - (calculateATR(priceData, i) * 2),
                        tp: price.close + (calculateATR(priceData, i) * 4),
                        isClosed: false,
                    };
                    trades.push(openTrade);
                } else if (divergence.type === 'bearish') {
                    openTrade = {
                        type: 'short',
                        entryPrice: price.close,
                        entryIndex: i,
                        sl: price.close + (calculateATR(priceData, i) * 2),
                        tp: price.close - (calculateATR(priceData, i) * 4),
                        isClosed: false,
                    };
                    trades.push(openTrade);
                }
            }

            // Exit Signals
            if (openTrade) {
                if (openTrade.type === 'long') {
                    if (price.low <= openTrade.sl) {
                        // Stop Loss Hit
                        openTrade.exitPrice = openTrade.sl;
                        openTrade.exitIndex = i;
                        openTrade.result = 'loss';
                        openTrade.isClosed = true;
                        updatePerformance(openTrade);
                        openTrade = null;
                    } else if (price.high >= openTrade.tp) {
                        // Take Profit Hit
                        openTrade.exitPrice = openTrade.tp;
                        openTrade.exitIndex = i;
                        openTrade.result = 'profit';
                        openTrade.isClosed = true;
                        updatePerformance(openTrade);
                        openTrade = null;
                    }
                } else if (openTrade.type === 'short') {
                    if (price.high >= openTrade.sl) {
                        // Stop Loss Hit
                        openTrade.exitPrice = openTrade.sl;
                        openTrade.exitIndex = i;
                        openTrade.result = 'loss';
                        openTrade.isClosed = true;
                        updatePerformance(openTrade);
                        openTrade = null;
                    } else if (price.low <= openTrade.tp) {
                        // Take Profit Hit
                        openTrade.exitPrice = openTrade.tp;
                        openTrade.exitIndex = i;
                        openTrade.result = 'profit';
                        openTrade.isClosed = true;
                        updatePerformance(openTrade);
                        openTrade = null;
                    }
                }
            }
        }
    }

    function calculateATR(priceData, index, period = 14) {
        let trValues = [];
        for (let i = index - period + 1; i <= index; i++) {
            if (i <= 0) continue;
            const high = priceData[i].high;
            const low = priceData[i].low;
            const prevClose = priceData[i - 1].close;
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trValues.push(tr);
        }
        const atr = trValues.reduce((a, b) => a + b, 0) / trValues.length;
        return atr;
    }

    function updatePerformance(trade) {
        const profit = trade.type === 'long' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice;
        performanceMetrics.netProfit += profit;
        performanceMetrics.totalTradesClosed += 1;
        if (profit > 0) {
            performanceMetrics.winningTrades += 1;
            performanceMetrics.grossProfit += profit;
        } else {
            performanceMetrics.grossLoss += -profit;
        }
        performanceMetrics.maxEquity = Math.max(performanceMetrics.maxEquity, performanceMetrics.netProfit);
        const drawdown = performanceMetrics.maxEquity - performanceMetrics.netProfit;
        performanceMetrics.maxDrawdown = Math.max(performanceMetrics.maxDrawdown, drawdown);
        performanceMetrics.avgTrade = performanceMetrics.netProfit / performanceMetrics.totalTradesClosed;
        performanceMetrics.percentProfitable = (performanceMetrics.winningTrades / performanceMetrics.totalTradesClosed) * 100;
        performanceMetrics.profitFactor = performanceMetrics.grossLoss > 0 ? performanceMetrics.grossProfit / performanceMetrics.grossLoss : 0;
    }

    function getTrades() {
        return trades;
    }

    function getPerformanceMetrics() {
        return performanceMetrics;
    }

    return {
        calculateMACD,
        detectDivergence,
        evaluateStrategy,
        getTrades,
        getPerformanceMetrics,
    };
})();

// Expose MyriadLabsStrategy to the global scope
if (typeof window !== 'undefined') {
    window.MyriadLabsStrategy = MyriadLabsStrategy;
}
