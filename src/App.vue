<template>
    <div class="flex flex-col h-screen overflow-hidden relative w-full font-sans bg-slate-50 text-slate-800 selection:bg-slate-400/30 selection:text-white">
        <!-- Premium Silver Gradient Background (Default) -->
        <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <!-- Animated silver gradient mesh -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-200 to-slate-300"></div>
            
            <!-- Shining orb 1 - top left silver -->
            <div class="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-300 blur-[100px] opacity-60 animate-pulse-slow"></div>
            
            <!-- Shining orb 2 - bottom right silver -->
            <div class="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-slate-100 via-gray-100 to-white blur-[80px] opacity-50 animate-pulse-slow" style="animation-delay: 1s;"></div>
            
            <!-- Accent shimmer -->
            <div class="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-gradient-to-b from-white/40 to-transparent blur-[60px] animate-pulse-fast"></div>
            
        </div>

        <HeaderComponent class="z-20" />

        <!-- Copyright strip -->
        <div class="w-full text-center px-3 py-1 text-[9px] uppercase tracking-widest text-slate-500 border-b border-black/5 bg-white/30 z-10">
            &copy; 2026 Candle Music &nbsp;·&nbsp; By: <a href="http://www.miiiira.com" class="text-[#CC3333] font-black tracking-[0.2em] hover:text-[#A32929] transition-colors">MIRA</a>
        </div>

        <main class="flex min-h-0 p-2 md:p-6 relative z-10 w-full max-w-[1600px] mx-auto h-[70vh] md:flex-1 md:h-auto">
            <div class="flex-1 rounded-2xl md:rounded-3xl backdrop-blur-2xl relative overflow-hidden flex flex-col bg-white/60 border border-slate-200/60 shadow-xl shadow-slate-300/30">
                <CandleChartComponent />
            </div>
        </main>
        
        <!-- Start overlay — real button for reliable mobile AudioContext unlock -->
        <Transition name="fade">
            <div v-if="showStartOverlay"
                 class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                <div class="flex flex-col items-center gap-6 select-none px-8">
                    <div class="w-20 h-20 rounded-full bg-[#CC3333]/10 border-2 border-[#CC3333]/30 flex items-center justify-center animate-pulse">
                        <span class="text-4xl">🎵</span>
                    </div>
                    <p class="text-xs font-extrabold uppercase tracking-widest text-[#1a1a1a]/50">Candle Music</p>
                    <button
                        @click="startAudio"
                        class="px-10 py-4 rounded-2xl bg-[#CC3333] text-white font-black text-lg uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                        ▶ Play
                    </button>
                </div>
            </div>
        </Transition>

    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import HeaderComponent from './components/Header.vue';
import CandleChartComponent from './components/CandleChart.vue';
import { useBinance } from './composables/useBinance';
import * as Tone from 'tone';
import { initAudioContext, applyAudioState, startGroove } from './composables/useAudio';
import { useAudioStore } from './stores/useAudioStore';

const { connectWs } = useBinance();
const audioStore = useAudioStore(); // kept for applyAudioState call
const showStartOverlay = ref(true);

let audioStarted = false;
const startAudio = () => {
    if (audioStarted) return;
    audioStarted = true;
    showStartOverlay.value = false;
    // Synchronous gesture-bound call — must NOT be inside async before this
    Tone.start().then(() => {
        initAudioContext().then(() => {
            startGroove();
            audioStore.soundEnabled = true;
            applyAudioState(audioStore);
        });
    });
};

onMounted(() => {
    connectWs();
});
</script>
