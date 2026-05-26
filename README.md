# 🕯️ Candle Music

<p>
  <img src="https://img.shields.io/badge/vue-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/pinia-%23FFE066.svg?style=for-the-badge&logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/tone.js-%23000000.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="Tone.js" />
  <img src="https://img.shields.io/badge/Binance_API-%23FCD535.svg?style=for-the-badge&logo=binance&logoColor=black" alt="Binance" />
</p>

> **Live BTC price candles — turned into music.**  
> Every market move plays a note. Every beat is a candle close.

**Live demo → [play.miiiira.com/candle](https://play.miiiira.com/candle)**

---

## What is this?

Candle Music streams real-time BTC/USDT data from Binance and translates each candlestick into sound:

- **Price direction** → note pitch (up = higher, down = lower) on a Blues scale
- **Candle size** → note intensity and duration
- **Zero / flat candles** → green gets a quick synth blip, red triggers a kick drum
- **Background groove** → kick, snare, hi-hat, open hat, and bass line — perfectly synced to each candle close (not a separate clock)

---

## Features

- 📈 Live BTC/USDT candlestick chart (30 candles desktop, 5 on mobile)
- 🎵 Monophonic **MonoSynth** melody on Blues scale
- 🥁 Rhythmic groove with 4 subdivisions per candle (kick, snare, hi-hat, bass walk)
- 🎚️ Master volume slider
- 📱 Mobile-first responsive layout (70vh chart panel)
- 🔇 Tap **▶ Play** to unlock audio (required by all mobile browsers)
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/miiiira) widget

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Vue 3 (Composition API) |
| State | Pinia |
| Audio | Tone.js v15 |
| Styling | Tailwind CSS v4 |
| Build | Vite 6 |
| Data | Binance WebSocket API (BTC/USDT) |
| Font | Source Sans 3 (Google Fonts) |

---

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Dev server runs at `http://localhost:3000`

---

## Project Structure

```
src/
├── App.vue                  # Root layout, audio unlock overlay
├── components/
│   ├── Header.vue           # Logo, volume slider
│   └── CandleChart.vue      # Candle rendering + click-to-replay
├── composables/
│   ├── useAudio.js          # Tone.js synth chain, groove engine, note mapping
│   └── useBinance.js        # WebSocket connection, candle parsing
└── stores/
    ├── useMarketStore.js    # Candle state (max 30)
    └── useAudioStore.js     # Sound enabled, master volume
```

---

## Audio Architecture

- `initAudioContext()` — builds the full Tone.js chain (synth → reverb → masterGain)
- `playCandleSound(candle)` — maps candle delta to Blues scale note + triggers MonoSynth
- `tickGroove()` — fires one groove subdivision; called 4× per candle (0ms, 250ms, 500ms, 750ms) for 4× rhythmic density, perfectly synced to market closes
- All triggers use `Tone.now() + 0.02` lookahead to avoid scheduling errors on mobile

---

## Made by

**[MIRA](https://www.miiiira.com)** · © 2026 Candle Music
