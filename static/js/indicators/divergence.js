class DivergenceDetector {
    constructor(pivotLeftBars, pivotRightBars, lookBackLength, pivotPointsToCheck) {
        this.pivotLeftBars = pivotLeftBars;
        this.pivotRightBars = pivotRightBars;
        this.lookBackLength = lookBackLength;
        this.pivotPointsToCheck = pivotPointsToCheck;
    }

    detect(priceData, indicatorData) {
        const pivotHighs = this.findPivotPoints(priceData, true);
        const pivotLows = this.findPivotPoints(priceData, false);
        const divergences = [];

        // Check for bullish divergences
        for (let i = 1; i < pivotLows.length; i++) {
            const currentLow = pivotLows[i];
            const previousLow = pivotLows[i - 1];

            if (currentLow.price > previousLow.price && 
                indicatorData[currentLow.index] < indicatorData[previousLow.index]) {
                divergences.push({
                    type: 'bullish',
                    x1: previousLow.index,
                    y1: previousLow.price,
                    x2: currentLow.index,
                    y2: currentLow.price
                });
            }
        }

        // Check for bearish divergences
        for (let i = 1; i < pivotHighs.length; i++) {
            const currentHigh = pivotHighs[i];
            const previousHigh = pivotHighs[i - 1];

            if (currentHigh.price < previousHigh.price && 
                indicatorData[currentHigh.index] > indicatorData[previousHigh.index]) {
                divergences.push({
                    type: 'bearish',
                    x1: previousHigh.index,
                    y1: previousHigh.price,
                    x2: currentHigh.index,
                    y2: currentHigh.price
                });
            }
        }

        return divergences;
    }

    findPivotPoints(data, isHigh) {
        const pivots = [];
        for (let i = this.pivotLeftBars; i < data.length - this.pivotRightBars; i++) {
            const slice = data.slice(i - this.pivotLeftBars, i + this.pivotRightBars + 1);
            const centralValue = data[i];
            const isPivot = isHigh 
                ? slice.every(value => value <= centralValue)
                : slice.every(value => value >= centralValue);

            if (isPivot) {
                pivots.push({ index: i, price: centralValue });
            }
        }
        return pivots;
    }
}

export default DivergenceDetector;
