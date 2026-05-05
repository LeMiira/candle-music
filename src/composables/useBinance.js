import { ref, onUnmounted } from 'vue';
import { useMarketStore } from '../stores/useMarketStore';
import { useAudioStore } from '../stores/useAudioStore';
import { playCandleSound, tickGroove } from './useAudio';

// Sources in priority order
const SOURCES = ['binance', 'binance-us', 'kraken'];

export function useBinance() {
    const market = useMarketStore();
    const audio  = useAudioStore();
    const ws     = ref(null);

    let currentTickCount = 0;
    let aggregatedCandle = null;
    let retryCount   = 0;
    let retryTimer   = null;
    let sourceIndex  = 0;
    let manualClose  = false;
    let tickTimer    = null; // for tick-based sources

    // ── helpers ──────────────────────────────────────────────────────────────
    const onCandle = (candle) => {
        currentTickCount++;
        if (currentTickCount >= market.interval) {
            playCandleSound(candle, audio);
            tickGroove();
            setTimeout(tickGroove, 250);
            setTimeout(tickGroove, 500);
            setTimeout(tickGroove, 750);
            currentTickCount = 0;
        }
    };

    const scheduleReconnect = () => {
        if (manualClose) return;
        const delay = Math.min(1500 * Math.pow(1.5, retryCount), 15000);
        retryCount++;
        sourceIndex = (sourceIndex + 1) % SOURCES.length;
        retryTimer = setTimeout(connectWs, delay);
    };

    // ── Binance global (most reliable, kline stream) ──────────────────────────
    const connectBinance = (host = 'stream.binance.com') => {
        const url = `wss://${host}/ws/btcusdt@kline_1s`;
        const socket = new WebSocket(url);

        socket.onopen = () => { retryCount = 0; };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (!data.k) return;
            const k     = data.k;
            const price = parseFloat(k.c);
            const open  = parseFloat(k.o);
            const high  = parseFloat(k.h);
            const low   = parseFloat(k.l);

            if (!aggregatedCandle) {
                aggregatedCandle = { open, high, low, close: price, isGreen: price >= open };
                market.addCandle(aggregatedCandle);
            } else {
                aggregatedCandle.close  = price;
                aggregatedCandle.high   = Math.max(aggregatedCandle.high, high);
                aggregatedCandle.low    = Math.min(aggregatedCandle.low, low);
                aggregatedCandle.isGreen = aggregatedCandle.close >= aggregatedCandle.open;
                market.updateCurrentCandle(aggregatedCandle);
            }

            if (k.x) { // candle closed
                const closed = { ...aggregatedCandle };
                aggregatedCandle = null;
                onCandle(closed);
            }
        };

        socket.onerror = () => {};
        socket.onclose = () => { if (!manualClose) scheduleReconnect(); };
        return socket;
    };

    // ── Kraken (ticker feed, build candles from ticks) ────────────────────────
    const connectKraken = () => {
        const socket = new WebSocket('wss://ws.kraken.com/v2');
        let kCandle = null;

        const flushKraken = () => {
            if (kCandle) {
                market.updateCurrentCandle(kCandle);
                onCandle(kCandle);
                kCandle = null;
            }
            tickTimer = setTimeout(flushKraken, 1000);
        };

        socket.onopen = () => {
            retryCount = 0;
            socket.send(JSON.stringify({
                method: 'subscribe',
                params: { channel: 'ticker', symbol: ['BTC/USD'] },
            }));
            tickTimer = setTimeout(flushKraken, 1000);
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.channel !== 'ticker' || !msg.data) return;
            const price = parseFloat(msg.data[0]?.last);
            if (!price) return;
            market.currentPrice = price;
            if (!kCandle) {
                kCandle = { open: price, high: price, low: price, close: price, isGreen: true };
                market.addCandle(kCandle);
            } else {
                kCandle.close  = price;
                kCandle.high   = Math.max(kCandle.high, price);
                kCandle.low    = Math.min(kCandle.low, price);
                kCandle.isGreen = kCandle.close >= kCandle.open;
            }
        };

        socket.onerror = () => {};
        socket.onclose = () => {
            if (tickTimer) { clearTimeout(tickTimer); tickTimer = null; }
            if (!manualClose) scheduleReconnect();
        };
        return socket;
    };

    // ── connect ───────────────────────────────────────────────────────────────
    const connectWs = () => {
        manualClose = false;
        if (ws.value) {
            manualClose = true;
            ws.value.close();
            manualClose = false;
        }
        if (retryTimer)  { clearTimeout(retryTimer);  retryTimer  = null; }
        if (tickTimer)   { clearTimeout(tickTimer);    tickTimer   = null; }

        market.clearCandles();
        currentTickCount = 0;
        aggregatedCandle = null;

        const src = SOURCES[sourceIndex % SOURCES.length];
        try {
            if (src === 'binance')    ws.value = connectBinance('stream.binance.com');
            else if (src === 'binance-us') ws.value = connectBinance('stream.binance.us');
            else                      ws.value = connectKraken();
        } catch (e) {
            scheduleReconnect();
        }
    };

    onUnmounted(() => {
        manualClose = true;
        if (retryTimer) clearTimeout(retryTimer);
        if (tickTimer)  clearTimeout(tickTimer);
        if (ws.value)   ws.value.close();
    });

    return { connectWs };
}
