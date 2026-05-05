import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMarketStore = defineStore('market', () => {
    const selectedCoin = ref('btcusdt');
    const interval = ref(1); // play a note on every candle
    const candles = ref([]);
    const maxCandles = 30;
    const currentPrice = ref(0);

    let candleIdCounter = 0;

    const addCandle = (candle) => {
        const id = ++candleIdCounter;
        candles.value.push({ ...candle, _id: id });
        if (candles.value.length > maxCandles) {
            candles.value.shift();
        }
        currentPrice.value = candle.close;
    };

    const updateCurrentCandle = (candleData) => {
        if (candles.value.length === 0) return;
        const last = candles.value[candles.value.length - 1];
        candles.value[candles.value.length - 1] = { ...candleData, _id: last._id };
        currentPrice.value = candleData.close;
    };

    const clearCandles = () => {
        candles.value = [];
        currentPrice.value = 0;
    };

    return { selectedCoin, interval, candles, currentPrice, addCandle, updateCurrentCandle, clearCandles };
});
