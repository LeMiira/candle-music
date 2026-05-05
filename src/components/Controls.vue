<template>
    <div class="space-y-6 font-bold text-[#1a1a1a]">
        <!-- Sound Toggle -->
        <button @click="toggleSound"
                class="w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                :class="audio.soundEnabled ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/5 border border-white/20 hover:bg-black/10'">
            <span v-if="audio.soundEnabled">🔊 Sound Active</span>
            <span v-else>🔇 Enable Sound</span>
        </button>

        <!-- Volume -->
        <div :class="audio.soundEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'">
            <label class="text-xs font-extrabold opacity-70 flex justify-between mb-2">
                Master Volume <span>{{ Math.round(audio.masterVolume * 100) }}%</span>
            </label>
            <input type="range" v-model="audio.masterVolume" @input="onVolumeChange"
                   min="0" max="1" step="0.05"
                   class="w-full accent-persian h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div class="w-full h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>

        <!-- Scale selector -->
        <div :class="audio.soundEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'">
            <label class="text-xs font-extrabold opacity-70 mb-2 block uppercase tracking-wider">🎹 Scale</label>
            <select v-model="selectedScale" @change="onScaleChange"
                    class="w-full bg-white text-[#1a1a1a] font-bold border border-black/10 rounded-lg p-2.5 text-xs outline-none focus:border-persian cursor-pointer">
                <option v-for="name in scaleNames" :key="name" :value="name">{{ name }}</option>
            </select>
            <div class="mt-2 text-[10px] font-bold opacity-40 leading-relaxed space-y-0.5">
                <p>🟢 Big green candle → high note</p>
                <p>🔴 Big red candle → low note</p>
            </div>
        </div>

        <div class="w-full h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>

        <!-- Zen Mode -->
        <button @click="audio.playMode = !audio.playMode"
                class="w-full py-3 rounded-md border transition-all text-xs uppercase tracking-[0.2em] font-bold"
                :class="audio.playMode ? 'border-persian bg-persian/10 text-persian shadow-[0_0_20px_rgba(204,51,51,0.3)] animate-pulse-fast' : 'border-white/20 opacity-40 hover:bg-white/5 hover:opacity-70'">
            {{ audio.playMode ? 'Exit Zen Mode' : 'Enter Zen Mode' }}
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAudioStore } from '../stores/useAudioStore';
import { initAudioContext, applyAudioState, updateInstrumentVolume, SCALES, setScale, getCurrentScaleKey } from '../composables/useAudio';

const audio = useAudioStore();
const scaleNames = Object.keys(SCALES);
const selectedScale = ref(getCurrentScaleKey());

const onScaleChange = () => setScale(selectedScale.value);

const toggleSound = async () => {
    if (!audio.soundEnabled) {
        await initAudioContext();
        audio.soundEnabled = true;
    } else {
        audio.soundEnabled = false;
    }
    applyAudioState(audio);
};

const onVolumeChange = () => {
    if (audio.soundEnabled) updateInstrumentVolume(audio.masterVolume);
};


</script>
