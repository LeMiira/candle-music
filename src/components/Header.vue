<template>
    <header class="px-3 py-2 md:px-6 border-b border-black/10 flex items-center justify-between gap-2 md:gap-4 bg-white/70 backdrop-blur-md sticky top-0 z-20 w-full">
        <!-- Logo -->
        <div class="flex items-center gap-2 md:gap-3 shrink-0">
            <div class="relative w-10 h-8 flex items-end justify-center gap-0.5">
                <div class="relative">
                    <div class="w-2 h-3 bg-gradient-to-b from-persian to-red-700 rounded-sm"></div>
                    <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-slate-700"></div>
                </div>
                <div class="relative">
                    <div class="w-3 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-sm"></div>
                    <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-slate-700"></div>
                </div>
            </div>
            <div>
                <h1 class="text-base md:text-lg font-bold tracking-tight text-[#1a1a1a] leading-none">Candle Music</h1>
                <p class="text-[9px] text-[#1a1a1a]/40 tracking-wider hidden sm:block">Trading beats · Market melodies</p>
            </div>
            <!-- GitHub star -->
            <a href="https://github.com/LeMiira/candle-music"
               target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-black text-black text-[10px] font-bold hover:bg-black/5 transition-all shrink-0">
                <svg class="w-3 h-3 fill-black" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                <span class="hidden sm:inline">Star</span>
                <span>★</span>
            </a>
        </div>

        <!-- Controls row -->
        <div class="flex items-center gap-2 md:gap-4 shrink-0">

            <!-- Volume -->
            <div class="flex items-center gap-1.5">
                <input type="range" v-model="audio.masterVolume" @input="onVolumeChange"
                       min="0" max="1" step="0.05"
                       class="w-20 md:w-32 accent-persian h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer" />
                <span class="text-[10px] font-bold opacity-50 w-6 text-right shrink-0 hidden sm:block">{{ Math.round(audio.masterVolume * 100) }}%</span>
            </div>

        </div>
    </header>
</template>

<script setup>
import { useAudioStore } from '../stores/useAudioStore';
import { applyAudioState, updateInstrumentVolume } from '../composables/useAudio';

const audio = useAudioStore();

const onVolumeChange = () => {
    updateInstrumentVolume(audio.masterVolume);
    applyAudioState(audio);
};
</script>
