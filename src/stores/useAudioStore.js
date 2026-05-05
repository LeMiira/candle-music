import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAudioStore = defineStore('audio', () => {
    const soundEnabled = ref(true);           // Default: sound ON
    const masterVolume = ref(0.6);
    const instrument = ref('beach');           // Default: beach selected
    const playMode = ref(false);
    const marketMode = ref('bull');           // 'bear' or 'bull'
    const instrumentEnabled = ref(true);        // Default: instrument ON
    const marketVibeEnabled = ref(false);     // Default: market vibe OFF (special mode)
    const audioLoading = ref(false);          // True while audio files are loading
    const effect = ref('autofilter');         // Active effect type
    return { soundEnabled, masterVolume, instrument, playMode, marketMode, instrumentEnabled, marketVibeEnabled, audioLoading, effect };
});
