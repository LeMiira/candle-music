import * as Tone from 'tone';

// ─── State ────────────────────────────────────────────────────────────────────
let isInitialized = false;
let initPromise   = null;
let synth         = null;
let reverb        = null;
let masterGain    = null;

// ─── Available scales ─────────────────────────────────────────────────────────
export const SCALES = {
    'C Pentatonic':  ['C3','D3','E3','G3','A3','C4','D4','E4','G4','A4','C5','D5','E5','G5','A5'],
    'C Major':       ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'],
    'A Minor':       ['A2','B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4'],
    'D Dorian':      ['D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5'],
    'E Phrygian':    ['E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5'],
    'G Mixolydian':  ['G2','A2','B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4'],
    'B Locrian':     ['B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4'],
    'Whole Tone':    ['C3','D3','E3','F#3','G#3','A#3','C4','D4','E4','F#4','G#4','A#4','C5'],
    'Blues':         ['C3','Eb3','F3','F#3','G3','Bb3','C4','Eb4','F4','F#4','G4','Bb4','C5'],
};

let currentScaleKey = 'Blues';
let SCALE = SCALES[currentScaleKey];
let MID   = Math.floor(SCALE.length / 2);

export const setScale = (key) => {
    if (SCALES[key]) {
        currentScaleKey = key;
        SCALE = SCALES[key];
        MID   = Math.floor(SCALE.length / 2);
    }
};
export const getCurrentScaleKey = () => currentScaleKey;

// ─── Available instruments ────────────────────────────────────────────────────
export const INSTRUMENTS = ['Synth','AMSynth','DuoSynth','FMSynth','MembraneSynth','MetalSynth','MonoSynth','NoiseSynth','PluckSynth','PolySynth'];
let currentInstrumentKey = 'MonoSynth';
export const getCurrentInstrumentKey = () => currentInstrumentKey;

const buildSynth = (key) => {
    const base = { volume: -6 };
    switch (key) {
        case 'AMSynth':      return new Tone.AMSynth(base);
        case 'DuoSynth':     return new Tone.DuoSynth(base);
        case 'FMSynth':      return new Tone.FMSynth(base);
        case 'MembraneSynth':return new Tone.MembraneSynth(base);
        case 'MetalSynth':   return new Tone.MetalSynth(base);
        case 'MonoSynth':    return new Tone.MonoSynth(base);
        case 'NoiseSynth':   return new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }, volume: -12 });
        case 'PluckSynth':   return new Tone.PluckSynth(base);
        case 'PolySynth':    return new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 2.0 }, volume: -6 });
        default:             return new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.6 }, volume: -6 });
    }
};

let reverbSendRef = null; // saved so setInstrument can reconnect

export const setInstrument = (key) => {
    if (!isInitialized || !masterGain) return;
    if (synth) { synth.disconnect(); synth.dispose(); }
    currentInstrumentKey = key;
    synth = buildSynth(key);
    synth.connect(masterGain);
    if (reverbSendRef) synth.connect(reverbSendRef);
};

// ─── Groove loop state ────────────────────────────────────────────────────────
let kick       = null;
let hihat      = null;
let bassSynth  = null;
let grooveLoop = null;
let grooveGain = null;
let grooveOn   = false;

// ─── Init AudioContext + build synth chain ────────────────────────────────────
export const initAudioContext = async () => {
    if (isInitialized) return;
    if (initPromise) return initPromise;
    initPromise = (async () => {
        await Tone.start();

        masterGain = new Tone.Gain(0.7).toDestination();

        // Reverb as a parallel wet send
        reverb = new Tone.Reverb({ decay: 3.5, wet: 1 });
        reverb.connect(masterGain);
        reverb.generate();
        reverbSendRef = new Tone.Gain(0.4).connect(reverb);

        synth = buildSynth(currentInstrumentKey);
        synth.connect(masterGain);
        synth.connect(reverbSendRef);

        // ── Groove instruments ──────────────────────────────────────────────
        grooveGain = new Tone.Gain(0.55).connect(masterGain);

        kick = new Tone.MembraneSynth({
            pitchDecay: 0.1, octaves: 7,
            envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.12 },
            volume: -7,
        }).connect(grooveGain);

        // closed hihat
        hihat = new Tone.MetalSynth({
            frequency: 600, envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
            harmonicity: 5.1, modulationIndex: 32, resonance: 5000, octaves: 1.5,
            volume: -24,
        }).connect(grooveGain);

        // snare — use NoiseSynth
        const snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
            volume: -16,
        }).connect(grooveGain);

        // open hihat for accents
        const openHat = new Tone.MetalSynth({
            frequency: 500, envelope: { attack: 0.001, decay: 0.18, release: 0.05 },
            harmonicity: 4, modulationIndex: 28, resonance: 4500, octaves: 1.2,
            volume: -26,
        }).connect(grooveGain);

        bassSynth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.25, sustain: 0.15, release: 0.4 },
            volume: -12,
        }).connect(grooveGain);

        // Patterns — triggered manually on each candle close (perfectly synced)
        grooveLoop = {
            bassLine: ['C2','C2','Eb2','F2','G2','G2','Bb1','C2'],
            kickPat:  [1,0,0,1,0,1,0,0],
            snarePat: [0,0,0,0,1,0,0,0],
            openPat:  [0,0,0,0,0,0,0,1],
            step: 0,
            kick, hihat, snare, openHat, bassSynth,
        };

        isInitialized = true;
        initPromise   = null;
    })();
    return initPromise;
};

export const startGroove = () => { grooveOn = true; };
export const stopGroove  = () => { grooveOn = false; };

// Called on every candle close — perfectly synced to market rhythm
let grooveSubdiv  = 0;
let lastGrooveTick = 0;
export const tickGroove = () => {
    if (!grooveOn || !grooveLoop) return;
    // Debounce: ignore calls within 50ms of the last one (mobile double-fire guard)
    const wallNow = performance.now();
    if (wallNow - lastGrooveTick < 50) return;
    lastGrooveTick = wallNow;

    const g    = grooveLoop;
    const s    = g.step;
    const sub  = grooveSubdiv;
    // Always schedule slightly ahead to avoid "start time must be greater" errors
    const now  = Tone.now() + 0.02;
    const isDownbeat = sub === 0;
    const is8th      = sub === 2;

    try {
        if (isDownbeat || is8th) {
            if (g.kickPat[s])  g.kick.triggerAttackRelease('C1', '8n', now);
            if (g.snarePat[s]) g.snare.triggerAttackRelease('8n', now);
        }
        const hatVol = (isDownbeat || is8th) ? -24 : -32;
        g.hihat.volume.setValueAtTime(hatVol, now);
        g.hihat.triggerAttackRelease('32n', now);
        if (isDownbeat && g.openPat[s]) g.openHat.triggerAttackRelease('16n', now);
        if (isDownbeat && (s === 0 || s === 4)) {
            g.bassSynth.triggerAttackRelease(g.bassLine[s], '8n', now);
        } else if (is8th && Math.random() < 0.3) {
            g.bassSynth.triggerAttackRelease(g.bassLine[s], '16n', now + 0.01);
        }
    } catch (_) {}

    if (isDownbeat) g.step = (s + 1) % 8;
    grooveSubdiv = (sub + 1) % 4;
};

export const setGrooveVolume = (vol) => {
    if (grooveGain) grooveGain.gain.rampTo(vol, 0.2);
};

export const isReady = () => isInitialized;

// ─── Volume control ───────────────────────────────────────────────────────────
export const updateAmbientVolume      = () => {};
export const updateInstrumentVolume   = (vol) => { if (masterGain) masterGain.gain.rampTo(vol * 0.9, 0.2); };
export const updateMarketModeVolume   = () => {};
export const stopInstrument           = () => {};
export const stopMarketMode           = () => {};
export const setEffect                = () => {};
export const setTremoloManual         = () => {};

// ─── Map candle → note index ──────────────────────────────────────────────────
// body size as % of price → log-amplified → maps to scale steps from center
const candleToNoteIndex = (candle) => {
    const delta     = Math.abs(candle.close - candle.open) * 100;
    const intensity = Math.min(1, Math.log1p(delta) / Math.log1p(20000));
    const steps     = Math.round(intensity * 7);
    return candle.isGreen
        ? Math.min(SCALE.length - 1, MID + steps)   // up the scale
        : Math.max(0,                MID - steps);   // down the scale
};

// ─── Apply state (no-op for synth mode, kept for compat) ─────────────────────
export const applyAudioState = (store) => {
    if (masterGain) masterGain.gain.rampTo(store.masterVolume * 0.9, 0.2);
};

// ─── Play note on candle ──────────────────────────────────────────────────────
export const playCandleSound = (candle, store) => {
    if (!store.soundEnabled || !isInitialized || !synth) return;

    const delta     = Math.abs(candle.close - candle.open) * 100;
    const logSize   = Math.log1p(delta);
    const logRef    = Math.log1p(50);   // < $0.50 real ($50 scaled) = tick
    const intensity = Math.min(1, logSize / Math.log1p(20000)); // $200 real = full strength

    // Below threshold → directional blip
    if (logSize < logRef) {
        const now = Tone.now() + 0.02;
        try {
            if (!candle.isGreen) {
                if (grooveLoop) grooveLoop.kick.triggerAttackRelease('C1', '8n', now);
            } else {
                const note = SCALE[MID + 1];
                synth.set({ envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.08 } });
                synth.triggerAttackRelease(note, '16n', now);
            }
        } catch (_) {}
        return;
    }

    const idx      = candleToNoteIndex(candle);
    const note     = SCALE[idx];
    const duration = 0.15 + intensity * 0.5;
    const now      = Tone.now() + 0.02;

    try {
        synth.set({ envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.6 } });
        if (currentInstrumentKey === 'NoiseSynth' || currentInstrumentKey === 'MetalSynth') {
            synth.triggerAttackRelease(duration, now);
        } else {
            synth.triggerAttackRelease(note, duration, now);
        }
    } catch (_) {}
};
