import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    const stored = localStorage.getItem('theme');
    const isDark = ref(stored === 'dark');

    const apply = () => {
        document.documentElement.classList.toggle('dark', isDark.value);
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    };

    const toggle = () => {
        isDark.value = !isDark.value;
    };

    watch(isDark, apply, { immediate: true });

    return { isDark, toggle };
});
