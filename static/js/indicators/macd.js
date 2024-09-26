class MACD {
    constructor(fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        this.fastPeriod = fastPeriod;
        this.slowPeriod = slowPeriod;
        this.signalPeriod = signalPeriod;
    }

    calculate(data) {
        const fastEMA = this.calculateEMA(data, this.fastPeriod);
        const slowEMA = this.calculateEMA(data, this.slowPeriod);
        const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
        const signalLine = this.calculateEMA(macdLine, this.signalPeriod);
        const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

        return {
            macdLine,
            signalLine,
            histogram
        };
    }

    calculateEMA(data, period) {
        const k = 2 / (period + 1);
        let ema = [data[0]];

        for (let i = 1; i < data.length; i++) {
            ema.push(data[i] * k + ema[i - 1] * (1 - k));
        }

        return ema;
    }
}

export default MACD;
