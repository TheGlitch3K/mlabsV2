import MACD from '../indicators/macd.js';
import DivergenceDetector from '../indicators/divergence.js';

class MyriadLabsStrategy {
    constructor(chart, params) {
        this.chart = chart;
        this.params = params;
        this.macd = new MACD(params.macdFastLen, params.macdSlowLen, params.macdSigLen);
        this.divergenceDetector = new DivergenceDetector(
            params.divPivotLeftbars,
            params.divPivotRightbars,
            params.divPivotLookBackLen,
            params.divPivotHowManyToCheck
        );
        this.setup = {
            position_is_long: false,
            position_is_short: false,
            entry_time: null,
            entry_price: null,
            sl: null,
            tp1: null,
            tp2: null,
            tp3: null,
            risk: null
        };
        this.performance = {
            net_profit: 0,
            total_trades_closed: 0,
            winning_trades: 0,
            max_drawdown: 0,
            gross_profit: 0,
            gross_loss: 0
        };
    }

    run(data) {
        const closes = data.map(d => d.close);
        const macdResult = this.macd.calculate(closes);
        const divergences = this.divergenceDetector.detect(closes, macdResult.histogram);

        this.checkEntryConditions(data, divergences);
        this.manageTrades(data);
        this.updateChart(data, macdResult, divergences);
    }

    checkEntryConditions(data, divergences) {
        const lastCandle = data[data.length - 1];
        const lastDivergence = divergences[divergences.length - 1];

        if (lastDivergence && !this.setup.position_is_long && !this.setup.position_is_short) {
            if (lastDivergence.type === 'bullish' && lastCandle.close > lastDivergence.y2) {
                this.enterLong(lastCandle, lastDivergence.y1);
            } else if (lastDivergence.type === 'bearish' && lastCandle.close < lastDivergence.y2) {
                this.enterShort(lastCandle, lastDivergence.y1);
            }
        }
    }

    enterLong(candle, sl) {
        this.setup = {
            position_is_long: true,
            position_is_short: false,
            entry_time: candle.time,
            entry_price: candle.close,
            sl: sl,
            risk: candle.close - sl
        };
        this.calculateTakeProfit();
        this.chart.addMarker({
            time: candle.time,
            position: 'belowBar',
            color: '#2196F3',
            shape: 'arrowUp',
            text: 'Long'
        });
    }

    enterShort(candle, sl) {
        this.setup = {
            position_is_long: false,
            position_is_short: true,
            entry_time: candle.time,
            entry_price: candle.close,
            sl: sl,
            risk: sl - candle.close
        };
        this.calculateTakeProfit();
        this.chart.addMarker({
            time: candle.time,
            position: 'aboveBar',
            color: '#FF5252',
            shape: 'arrowDown',
            text: 'Short'
        });
    }

    calculateTakeProfit() {
        const { entry_price, risk } = this.setup;
        this.setup.tp1 = entry_price + this.params.tp1Ratio * risk * (this.setup.position_is_long ? 1 : -1);
        this.setup.tp2 = entry_price + this.params.tp2Ratio * risk * (this.setup.position_is_long ? 1 : -1);
        this.setup.tp3 = entry_price + this.params.tp3Ratio * risk * (this.setup.position_is_long ? 1 : -1);
    }

    manageTrades(data) {
        if (!this.setup.position_is_long && !this.setup.position_is_short) return;

        const lastCandle = data[data.length - 1];
        if (this.setup.position_is_long) {
            if (lastCandle.low <= this.setup.sl) {
                this.exitTrade(lastCandle, 'Stop Loss');
            } else if (lastCandle.high >= this.setup.tp1) {
                this.partialExit(lastCandle, this.setup.tp1, this.params.tp1Share, 'TP1');
            } else if (lastCandle.high >= this.setup.tp2) {
                this.partialExit(lastCandle, this.setup.tp2, this.params.tp2Share, 'TP2');
            } else if (lastCandle.high >= this.setup.tp3) {
                this.exitTrade(lastCandle, 'TP3');
            }
        } else if (this.setup.position_is_short) {
            if (lastCandle.high >= this.setup.sl) {
                this.exitTrade(lastCandle, 'Stop Loss');
            } else if (lastCandle.low <= this.setup.tp1) {
                this.partialExit(lastCandle, this.setup.tp1, this.params.tp1Share, 'TP1');
            } else if (lastCandle.low <= this.setup.tp2) {
                this.partialExit(lastCandle, this.setup.tp2, this.params.tp2Share, 'TP2');
            } else if (lastCandle.low <= this.setup.tp3) {
                this.exitTrade(lastCandle, 'TP3');
            }
        }

        if (this.params.sltpmode === 'Trailing') {
            this.updateTrailingStop(lastCandle);
        }
    }

    partialExit(candle, price, share, reason) {
        const profit = (price - this.setup.entry_price) * (this.setup.position_is_long ? 1 : -1);
        this.updatePerformance(profit * (share / 100));
        this.chart.addMarker({
            time: candle.time,
            position: this.setup.position_is_long ? 'aboveBar' : 'belowBar',
            color: '#4CAF50',
            shape: 'circle',
            text: reason
        });
    }

    exitTrade(candle, reason) {
        const profit = (candle.close - this.setup.entry_price) * (this.setup.position_is_long ? 1 : -1);
        this.updatePerformance(profit);
        this.chart.addMarker({
            time: candle.time,
            position: this.setup.position_is_long ? 'aboveBar' : 'belowBar',
            color: '#FF9800',
            shape: 'circle',
            text: reason
        });
        this.setup = {
            position_is_long: false,
            position_is_short: false,
            entry_time: null,
            entry_price: null,
            sl: null,
            tp1: null,
            tp2: null,
            tp3: null,
            risk: null
        };
    }

    updateTrailingStop(candle) {
        if (this.setup.position_is_long) {
            const newSL = candle.close - this.params.trailingStopDistance;
            if (newSL > this.setup.sl) {
                this.setup.sl = newSL;
            }
        } else if (this.setup.position_is_short) {
            const newSL = candle.close + this.params.trailingStopDistance;
            if (newSL < this.setup.sl) {
                this.setup.sl = newSL;
            }
        }
    }

    updatePerformance(profit) {
        this.performance.net_profit += profit;
        this.performance.total_trades_closed += 1;
        if (profit > 0) {
            this.performance.winning_trades += 1;
            this.performance.gross_profit += profit;
        } else {
            this.performance.gross_loss -= profit;
        }
        this.performance.max_drawdown = Math.min(this.performance.max_drawdown, this.performance.net_profit);
    }

    updateChart(data, macdResult, divergences) {
        // Update MACD series
        this.chart.updateSeries('MACD Line', macdResult.macdLine.map((value, index) => ({ time: data[index].time, value })));
        this.chart.updateSeries('Signal Line', macdResult.signalLine.map((value, index) => ({ time: data[index].time, value })));
        this.chart.updateSeries('Histogram', macdResult.histogram.map((value, index) => ({ time: data[index].time, value })));

        // Draw divergences
        divergences.forEach(div => {
            this.chart.addShape({
                time1: data[div.x1].time,
                price1: div.y1,
                time2: data[div.x2].time,
                price2: div.y2,
                color: div.type === 'bullish' ? '#4CAF50' : '#FF5252',
                lineWidth: 2,
                lineStyle: 2,
            });
        });

        // Update stop loss and take profit lines
        if (this.setup.position_is_long || this.setup.position_is_short) {
            this.chart.updateSeries('Stop Loss', [{ time: data[data.length - 1].time, value: this.setup.sl }]);
            this.chart.updateSeries('TP1', [{ time: data[data.length - 1].time, value: this.setup.tp1 }]);
            this.chart.updateSeries('TP2', [{ time: data[data.length - 1].time, value: this.setup.tp2 }]);
            this.chart.updateSeries('TP3', [{ time: data[data.length - 1].time, value: this.setup.tp3 }]);
        } else {
            this.chart.updateSeries('Stop Loss', []);
            this.chart.updateSeries('TP1', []);
            this.chart.updateSeries('TP2', []);
            this.chart.updateSeries('TP3', []);
        }

        // Update performance table
        this.updatePerformanceTable();
    }

    updatePerformanceTable() {
        const table = document.getElementById('performance-table');
        if (!table) return;

        table.innerHTML = `
            <tr><td>Net Profit</td><td>${this.performance.net_profit.toFixed(2)}</td></tr>
            <tr><td>Total Trades Closed</td><td>${this.performance.total_trades_closed}</td></tr>
            <tr><td>Percent Profitable</td><td>${(this.performance.winning_trades / this.performance.total_trades_closed * 100).toFixed(2)}%</td></tr>
            <tr><td>Profit Factor</td><td>${(this.performance.gross_profit / this.performance.gross_loss).toFixed(2)}</td></tr>
            <tr><td>Max Drawdown</td><td>${this.performance.max_drawdown.toFixed(2)}</td></tr>
            <tr><td>Avg Trade</td><td>${(this.performance.net_profit / this.performance.total_trades_closed).toFixed(2)}</td></tr>
        `;
    }
}

export default MyriadLabsStrategy;