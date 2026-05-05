<template>
    <div class="w-full h-full min-h-[300px] relative overflow-hidden">

        <!-- Live indicator -->
        <div class="absolute top-4 left-4 flex items-center gap-2 z-10">
            <div class="w-2.5 h-2.5 bg-[#CC3333] rounded-full animate-ping" v-if="normalizedCandles.length > 0"></div>
            <div class="w-2.5 h-2.5 bg-white/20 rounded-full" v-else></div>
            <span class="text-[10px] font-bold tracking-widest uppercase text-[#1a1a1a]/40">Market Stream</span>
        </div>

        <!-- Price + pair -->
        <div v-if="market.currentPrice > 0" class="absolute top-4 right-4 z-10 flex flex-col items-end gap-0.5">
            <span class="font-mono text-xl md:text-3xl text-[#1a1a1a]/70 tracking-wider">${{ market.currentPrice.toFixed(2) }}</span>
            <span class="text-[10px] font-bold tracking-widest uppercase text-[#1a1a1a]/25">₿ BTC/USDT</span>
        </div>

        <!-- Center line -->
        <div class="absolute left-0 right-0 h-px bg-black/10 z-0" style="top: 50%"></div>

        <!-- Candle strip: centered horizontally, fills full container height -->
        <div class="absolute inset-0 flex items-center justify-center z-10">
            <div class="flex items-center gap-[3px] h-full">
                <TransitionGroup name="candle-fade">
                <div v-for="candle in normalizedCandles" :key="candle._id"
                     class="relative flex justify-center h-full cursor-pointer"
                     style="width: 14px;"
                     @click="replayCandle(candle)">

                    <!-- Price label above (green) or below (red) — hidden for zero moves -->
                    <div v-if="candle.label !== '0'"
                         class="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono font-bold pointer-events-none z-20"
                         :style="candle.labelStyle"
                         :class="[
                           candle.isActive ? 'text-[9px] opacity-80' : 'text-[8px] opacity-30',
                           candle.isGreen ? 'text-emerald-600' : 'text-persian'
                         ]">
                        {{ candle.label }}
                    </div>

                    <!-- Bar -->
                    <div class="absolute w-full rounded-sm transition-colors duration-500"
                         :class="[
                           candle.isActive
                             ? (candle.isGreen ? 'bg-emerald-500' : 'bg-persian')
                             : (candle.isGreen ? 'bg-emerald-500/30' : 'bg-persian/30'),
                           candle.isNew ? (candle.isGreen ? 'animate-candle-grow-up' : 'animate-candle-grow-down') : '',
                           candle.isActive && candle.isGreen ? 'shadow-[0_0_14px_rgba(16,185,129,0.9)]' : '',
                           candle.isActive && !candle.isGreen ? 'shadow-[0_0_14px_rgba(204,51,51,0.9)]' : '',
                           (flashId?.value === candle._id) ? (candle.isGreen ? 'animate-flash-green' : 'animate-flash-red') : ''
                         ]"
                         :style="candle.bodyStyle">
                    </div>
                </div>
                </TransitionGroup>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="normalizedCandles.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-[#1a1a1a]/40 gap-4 text-[10px] uppercase tracking-widest z-10">
            <div class="w-8 h-8 border-2 border-black/10 border-t-[#CC3333] rounded-full animate-spin mb-2"></div>
            <p class="animate-pulse flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-[#CC3333] rounded-full animate-ping"></span>
                Awaiting Live Market Data
            </p>
        </div>
    </div>
</template>

<style scoped>
@keyframes candle-grow-up {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
}
@keyframes candle-grow-down {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
}
.animate-candle-grow-up {
    transform-origin: bottom;
    animation: candle-grow-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.animate-candle-grow-down {
    transform-origin: top;
    animation: candle-grow-down 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes flash-green {
    0%   { filter: brightness(1); }
    40%  { filter: brightness(2.5) drop-shadow(0 0 8px #10b981); }
    100% { filter: brightness(1); }
}
@keyframes flash-red {
    0%   { filter: brightness(1); }
    40%  { filter: brightness(2.5) drop-shadow(0 0 8px #CC3333); }
    100% { filter: brightness(1); }
}
.animate-flash-green { animation: flash-green 0.4s ease-out; }
.animate-flash-red   { animation: flash-red   0.4s ease-out; }

/* fade-out when candle leaves the list */
.candle-fade-leave-active {
    transition: opacity 0.6s ease, transform 0.6s ease;
    position: absolute;
}
.candle-fade-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
</style>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useMarketStore } from '../stores/useMarketStore';
import { useAudioStore } from '../stores/useAudioStore';
import { playCandleSound } from '../composables/useAudio';

const market      = useMarketStore();
const audio       = useAudioStore();
const flashId  = ref(null);
const isMobile = ref(window.innerWidth < 640);
const onResize = () => { isMobile.value = window.innerWidth < 640; };
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));

let flashTimer = null;
const replayCandle = (candle) => {
    if (!audio.soundEnabled) return;
    playCandleSound(candle, audio);
    flashId.value = candle._id;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { flashId.value = null; }, 420);
};

const normalizedCandles = computed(() => {
    if (market.candles.length === 0) return [];
    const maxVisible = isMobile.value ? 5 : 30;
    const candles = market.candles.slice(-maxVisible);

    const bodies = candles.map(c => Math.abs(c.close - c.open) * 100);
    const logBodies = bodies.map(b => Math.log1p(b));
    const maxLog = Math.max(...logBodies, Math.log1p(1000));

    return candles.map((c, idx) => {
        const rawDelta = Math.abs(c.close - c.open);
        const isTiny   = rawDelta < 0.5; // rounds to 0 on label
        const bodySize = rawDelta * 100;
        const logSize  = Math.log1p(bodySize);
        const bodyHPct   = isTiny ? 2 : Math.max(2, (logSize / maxLog) * 46);
        const bodyTopPct = c.isGreen ? (50 - bodyHPct) : 50;

        // Label: signed delta — show 1 decimal for sub-$1 moves
        const delta   = c.close - c.open;
        const rounded = Math.round(delta);
        const label   = rounded === 0 ? '0' : (delta > 0 ? '+' : '−');

        // Position label just outside the bar tip (4px gap)
        const labelStyle = c.isGreen
            ? { bottom: (100 - bodyTopPct) + '%', transform: 'translateX(-50%) translateY(-4px)' }
            : { top: (bodyTopPct + bodyHPct) + '%', transform: 'translateX(-50%) translateY(4px)' };

        const isActive = idx === market.candles.length - 1;
        return {
            ...c,
            bodyStyle: { top: bodyTopPct + '%', height: bodyHPct + '%' },
            label,
            labelStyle,
            isActive,
            isNew: isActive && !isTiny,
        };
    });
});

</script>
