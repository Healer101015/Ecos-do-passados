let audioCtx;
let masterGain;
let activeOscs = [];

export const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
};

export const getAudioContext = () => audioCtx;

export const fadeOutMaster = (duration) => {
    if (!masterGain) return;
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
};

export const resetAudioVolume = () => {
    if (masterGain && audioCtx) {
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
    }
};

export const stopAllScheduledAudio = () => {
    activeOscs.forEach(osc => {
        try {
            osc.stop();
            osc.disconnect();
        } catch (e) { }
    });
    activeOscs = [];
};

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const playTone = (midiNumber, type = 'sine', startTime = 0, duration = 0.5, volume = 0.2) => {
    if (!audioCtx) return;
    const time = startTime === 0 ? audioCtx.currentTime : startTime;
    const freq = midiToFreq(midiNumber);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 1.5);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);

    const stopTime = time + duration + 2;
    try { osc.stop(stopTime); } catch (e) { }

    activeOscs.push(osc);
    osc.onended = () => {
        const idx = activeOscs.indexOf(osc);
        if (idx > -1) activeOscs.splice(idx, 1);
    };
};