import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import './App.css';

// --- ENGINE DE ÁUDIO ---
let audioCtx;
let masterGain;
let activeOscs = [];

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const fadeOutMaster = (duration) => {
  if (!masterGain) return;
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
};

const resetAudioVolume = () => {
  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
  }
};

const stopAllScheduledAudio = () => {
  activeOscs.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) { }
  });
  activeOscs = [];
};

// NOVA FUNÇÃO: Limpa qualquer luz que tenha ficado presa nas teclas
const clearActiveKeys = () => {
  document.querySelectorAll('.min-key').forEach(key => {
    key.classList.remove('lit', 'error');
  });
};

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const playTone = (midiNumber, type = 'sine', startTime = 0, duration = 0.5, volume = 0.2) => {
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
  try {
    osc.stop(stopTime);
  } catch (e) { }

  activeOscs.push(osc);
  osc.onended = () => {
    const idx = activeOscs.indexOf(osc);
    if (idx > -1) activeOscs.splice(idx, 1);
  };
};

// --- CONFIGURAÇÕES ---
const REQUIRED_NOTES = 10;
const FALL_DURATION = 1.8;
const TEMPO_MULTIPLIER = 1.2;
const MAX_AUTO_PLAY_SECONDS = 60;

const PIANO_KEYS = [
  { name: 'C', keyBind: 'a', pos: 10 }, { name: 'C#', keyBind: 'w', pos: 18 },
  { name: 'D', keyBind: 's', pos: 26 }, { name: 'D#', keyBind: 'e', pos: 34 },
  { name: 'E', keyBind: 'd', pos: 42 }, { name: 'F', keyBind: 'f', pos: 50 },
  { name: 'F#', keyBind: 't', pos: 58 }, { name: 'G', keyBind: 'g', pos: 66 },
  { name: 'G#', keyBind: 'y', pos: 74 }, { name: 'A', keyBind: 'h', pos: 82 },
  { name: 'A#', keyBind: 'u', pos: 90 }, { name: 'B', keyBind: 'j', pos: 98 }
];

const STORIES = {
  1: [
    "Há coisas que se desfazem sem ruído, como poeira atravessada por luz.",
    "O ar muda antes que os olhos percebam.",
    "Por um instante, tudo parece suspenso entre presença e desaparecimento.",
    "O silêncio não interrompe. Ele molda.",
    "E o que resta vibra, invisível, dentro do espaço."
  ],
  2: [
    "As superfícies guardam marcas que só a luz revela.",
    "Fendas douradas atravessam a matéria como memórias acesas.",
    "Nada aqui pede para voltar ao que era.",
    "A fratura também compõe.",
    "E cada linha quebrada aprende a refletir de outro modo."
  ],
  3: [
    "A água toca sem pedir licença.",
    "Escorre entre os dedos, contorna a forma, leva consigo o excesso.",
    "Não há como deter o que nasceu para seguir.",
    "O fluxo conhece caminhos que o corpo ainda não entende.",
    "Resta abrir as mãos e ouvir a passagem."
  ],
  4: [
    "A névoa ocupa o lugar das certezas.",
    "Os contornos respiram devagar, quase desaparecendo diante do olhar.",
    "Há um frio delicado no que ainda não se revela.",
    "Mas até a sombra cansa de esconder.",
    "E pouco a pouco, o espaço volta a ter profundidade."
  ],
  5: [
    "Depois de tudo, uma claridade vazia se abre.",
    "Não como ausência, mas como campo.",
    "Uma superfície limpa, pronta para receber outro gesto, outra luz, outro som.",
    "Nada termina de fato dentro da experiência.",
    "A última nota apenas se dissolve no branco."
  ]
};

const FALLBACKS = {
  1: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['C', 'E', 'G', 'B'][i % 4], midi: 60 + (i % 4) * 2, time: i * 0.5, duration: 0.5 })),
  2: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['D', 'F', 'A', 'C'][i % 4], midi: 62 + (i % 4) * 2, time: i * 0.5, duration: 0.5 })),
  3: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['E', 'G', 'B', 'D'][i % 4], midi: 64 + (i % 4) * 2, time: i * 0.5, duration: 0.8 })),
  4: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['A', 'C', 'E', 'A'][i % 4], midi: 57 + (i % 4) * 3, time: i * 0.6, duration: 0.6 })),
  5: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['C', 'F', 'A', 'E'][i % 4], midi: 65 + (i % 4) * 3, time: i * 0.6, duration: 1.0 }))
};

export default function App() {
  const [phase, setPhase] = useState(1);
  const [mode, setMode] = useState('LOADING');

  const [midiData, setMidiData] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [userProgress, setUserProgress] = useState(0);
  const [storyIndex, setStoryIndex] = useState(-1);

  const notesDataRef = useRef([]);
  const noteDOMRefs = useRef([]);
  const progressRef = useRef(null);
  const rafRef = useRef(null);
  const timeouts = useRef([]);

  const isReplayRef = useRef(false);

  useEffect(() => {
    const fetchMidi = async (url, fallback) => {
      try {
        const res = await fetch(`${url}?v=${Date.now()}`);
        if (!res.ok) throw new Error();
        const buf = await res.arrayBuffer();
        const midi = new Midi(buf);
        const track = midi.tracks.find(t => t.notes.length > REQUIRED_NOTES);
        return track ? track.notes : fallback;
      } catch { return fallback; }
    };

    const loadAll = async () => {
      const m1 = await fetchMidi('/memoria1.mid', FALLBACKS[1]);
      const m2 = await fetchMidi('/memoria2.mid', FALLBACKS[2]);
      const m3 = await fetchMidi('/memoria3.mid', FALLBACKS[3]);
      const m4 = await fetchMidi('/memoria4.mid', FALLBACKS[4]);
      const m5 = await fetchMidi('/memoria5.mid', FALLBACKS[5]);
      setMidiData({ 1: m1, 2: m2, 3: m3, 4: m4, 5: m5 });
      setTimeout(() => setMode('INTRO'), 1000);
    };
    loadAll();
  }, []);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const currentTrack = midiData[phase] || [];
  const sequenceToPlay = currentTrack.slice(0, REQUIRED_NOTES);

  const handleStartExperience = () => {
    initAudio();
    stopAllScheduledAudio();
    clearActiveKeys(); // Garante que as teclas comecem apagadas
    resetAudioVolume();
    isReplayRef.current = false;
    playTone(60, 'sine', 0, 1.5, 0.4);
    setMode('STARTING');

    setTimeout(() => {
      spawnGlobalRipple(50);
      setTimeout(() => setMode('MANUAL'), 500);
    }, 800);
  };

  const handleReplayPhase = (targetPhaseId) => {
    initAudio();
    stopAllScheduledAudio();
    clearActiveKeys(); // Limpa resquícios da fase anterior
    resetAudioVolume();
    playTone(64 + targetPhaseId, 'sine', 0, 1.0, 0.3);

    setPhase(targetPhaseId);
    setUserProgress(0);
    setStoryIndex(-1);
    isReplayRef.current = true;

    const container = document.getElementById('global-ripple-container');
    if (container) container.innerHTML = '';

    setMode('WAITING');
    setTimeout(() => startCinematicEngine(targetPhaseId), 500);
  };

  const stopReplayManually = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fadeOutMaster(1);
    clearActiveKeys(); // Desliga todas as luzes imediatamente
    setTimeout(() => {
      stopAllScheduledAudio();
      resetAudioVolume();
      setMode('END');
    }, 1200);
  };

  const spawnElegantShockwave = (xPos) => {
    const container = document.getElementById('shockwave-container');
    if (!container) return;
    const wave = document.createElement('div');
    wave.className = 'elegant-shockwave';
    wave.style.left = `${xPos}%`;
    container.appendChild(wave);
    setTimeout(() => { if (container.contains(wave)) container.removeChild(wave); }, 800);
  };

  const spawnGlobalRipple = (xPos) => {
    const container = document.getElementById('global-ripple-container');
    if (!container) return;
    const ripple = document.createElement('div');
    ripple.className = 'global-liquid-ripple';
    ripple.style.left = `${xPos}%`;
    container.appendChild(ripple);
    setTimeout(() => { if (container.contains(ripple)) container.removeChild(ripple); }, 2000);
  };

  const handlePlay = useCallback((noteName) => {
    initAudio();
    if (mode !== 'MANUAL') return;

    const expectedNote = currentTrack[userProgress]?.pitch;
    const keyEl = document.getElementById(`key-${noteName}`);

    if (noteName === expectedNote) {
      playTone(currentTrack[userProgress].midi, 'sine', 0, 0.5, 0.3);
      const next = userProgress + 1;
      setUserProgress(next);

      if (keyEl) {
        keyEl.classList.add('lit');
        setTimeout(() => keyEl.classList.remove('lit'), 300);
      }

      if (next >= REQUIRED_NOTES) {
        setMode('WAITING');
        setTimeout(() => startCinematicEngine(phase), 1000);
      }
    } else {
      playTone(currentTrack[userProgress]?.midi - 5 || 50, 'sawtooth', 0, 0.2, 0.05);
      if (keyEl) {
        keyEl.classList.add('error');
        setTimeout(() => keyEl.classList.remove('error'), 300);
      }
    }
  }, [mode, phase, midiData, userProgress]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === 'TRANSITION' && (e.key === ' ' || e.key === 'Enter')) {
        setPhase(prev => prev + 1);
        setUserProgress(0);
        setStoryIndex(-1);
        clearActiveKeys(); // Garante o teclado limpo na transição
        if (progressRef.current) progressRef.current.style.width = '0%';
        setMode('MANUAL');
        return;
      }
      const keyInfo = PIANO_KEYS.find(k => k.keyBind === e.key.toLowerCase());
      if (keyInfo) handlePlay(keyInfo.name);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlay, mode]);

  const getCinematicNotes = (targetPhaseId) => {
    const track = midiData[targetPhaseId] || [];
    if (isReplayRef.current) return track;
    if (track.length <= REQUIRED_NOTES) return [];
    const startMidiTime = track[REQUIRED_NOTES].time * TEMPO_MULTIPLIER;
    return track.slice(REQUIRED_NOTES).filter(n => ((n.time * TEMPO_MULTIPLIER) - startMidiTime) <= MAX_AUTO_PLAY_SECONDS);
  };

  const startCinematicEngine = (targetPhaseId) => {
    initAudio();
    clearActiveKeys(); // Mais uma trava de segurança
    const cinematicNotes = getCinematicNotes(targetPhaseId);

    const startMidiTime = cinematicNotes.length > 0 ? cinematicNotes[0].time * TEMPO_MULTIPLIER : 0;

    const preCalculatedNotes = cinematicNotes.map(note => {
      const keyInfo = PIANO_KEYS.find(k => k.name === note.pitch);
      return {
        pitch: note.pitch, pos: keyInfo ? keyInfo.pos : 50, duration: note.duration * TEMPO_MULTIPLIER,
      };
    });

    notesDataRef.current = preCalculatedNotes;
    setMode('CINEMATIC');

    setTimeout(() => {
      const now = audioCtx.currentTime;
      const baseStart = now + FALL_DURATION;

      let lastTime = 0;

      notesDataRef.current.forEach((note, idx) => {
        const originalNote = cinematicNotes[idx];
        const timeFromStart = (originalNote.time * TEMPO_MULTIPLIER) - startMidiTime;
        const absolutePlayTime = baseStart + timeFromStart;

        playTone(originalNote.midi, 'sine', absolutePlayTime, note.duration, 0.25);

        note.hitTime = absolutePlayTime;
        note.releaseTime = absolutePlayTime + Math.max(note.duration, 0.2);
        note.hitTriggered = false; note.releaseTriggered = false;

        lastTime = Math.max(lastTime, timeFromStart);
      });

      const totalDurationMs = lastTime * 1000;
      const intervalMs = totalDurationMs / STORIES[targetPhaseId].length;

      const renderLoop = () => {
        const currentAudioTime = audioCtx.currentTime;
        const viewportH = window.innerHeight;
        const hitY = viewportH * 0.85;
        const speedPxPerSec = hitY / FALL_DURATION;

        notesDataRef.current.forEach((note, idx) => {
          const el = noteDOMRefs.current[idx];
          if (!el) return;

          const timeUntilHit = note.hitTime - currentAudioTime;
          let noteHeight = Math.max(note.duration * speedPxPerSec, 20);
          let currentBottomY = hitY - (timeUntilHit * speedPxPerSec);
          let currentTopY = currentBottomY - noteHeight;

          if (currentBottomY < 0) {
            el.style.opacity = 0;
            el.style.transform = `translate3d(-50%, -500px, 0)`;
          } else if (currentTopY < hitY) {
            if (timeUntilHit <= 0) {
              currentBottomY = hitY;
              currentTopY = hitY - ((note.duration + timeUntilHit) * speedPxPerSec);
              noteHeight = currentBottomY - currentTopY;
            }
            el.style.height = `${Math.max(noteHeight, 0)}px`;
            el.style.transform = `translate3d(-50%, ${currentTopY}px, 0)`;
            el.style.opacity = 1;

            if (timeUntilHit <= 0.05 && !note.hitTriggered) {
              note.hitTriggered = true;
              spawnElegantShockwave(note.pos);
              spawnGlobalRipple(note.pos);
              const keyEl = document.getElementById(`key-${note.pitch}`);
              if (keyEl) keyEl.classList.add('lit');
            }
          } else {
            if (!note.releaseTriggered) {
              note.releaseTriggered = true;
              const keyEl = document.getElementById(`key-${note.pitch}`);
              if (keyEl) keyEl.classList.remove('lit');
            }
            el.style.opacity = 0;
            el.style.transform = `translate3d(-50%, ${viewportH + 200}px, 0)`;
          }
        });

        if (!isReplayRef.current) {
          const currentElapsedMs = (currentAudioTime - baseStart) * 1000;
          if (currentElapsedMs >= 0) {
            let expectedStoryIndex = Math.floor(currentElapsedMs / intervalMs);
            if (currentElapsedMs < 2000) expectedStoryIndex = -1;
            if (expectedStoryIndex >= STORIES[targetPhaseId].length) expectedStoryIndex = STORIES[targetPhaseId].length - 1;
            setStoryIndex(prev => prev !== expectedStoryIndex ? expectedStoryIndex : prev);
          }
        }

        if (currentAudioTime < baseStart + lastTime + 2) {
          rafRef.current = requestAnimationFrame(renderLoop);
        } else {
          setStoryIndex(-1);
          clearActiveKeys(); // Limpa todas as teclas perfeitamente no final da música

          if (isReplayRef.current) {
            fadeOutMaster(8);
            setTimeout(() => setMode('END'), 6000);
          } else if (targetPhaseId < 5) {
            setMode('TRANSITION');
          } else {
            fadeOutMaster(8);
            setTimeout(() => setMode('END'), 6000);
          }
        }
      };

      rafRef.current = requestAnimationFrame(renderLoop);
    }, 150);
  };

  // --- CORREÇÃO DO TEMA ---
  const getThemeClass = () => {
    if (mode === 'INTRO' || mode === 'STARTING') return 'theme-intro';
    if (phase === 1) return 'theme-echo';
    if (phase === 2) return 'theme-kintsugi';
    if (phase === 3) return 'theme-crimson';
    if (phase === 4) return 'theme-eclipse';
    return 'theme-horizon'; // Voltou para o tema branco da fase 5
  };

  const phaseTitles = {
    1: 'Ato I: O Eco', 2: 'Ato II: O Ouro', 3: 'Ato III: A Maré', 4: 'Ato IV: A Travessia', 5: 'Ato V: A Tela em Branco'
  };
  const phaseSubtitles = {
    1: 'Sincronize as notas para revelar a memória.', 2: 'Há beleza no que foi quebrado. Continue tocando.',
    3: 'O final de um ciclo. Liberte o som.', 4: 'O escuro antes do amanhecer. Siga em frente.',
    5: 'O último compasso. Escreva a sua saída.'
  };

  if (mode === 'LOADING') {
    return <div className="world theme-void"><div className="loading-text">Conectando Fragmentos...</div></div>;
  }

  const visualNotes = mode === 'CINEMATIC' ? notesDataRef.current : [];
  const ghostDrops = Array.from({ length: 15 });

  return (
    <div className={`world ${getThemeClass()} ${mode === 'CINEMATIC' ? 'immersed' : ''} ${mode === 'END' ? 'fade-to-black' : ''}`}>

      <div id="global-ripple-container"></div>
      <div className="water-caustics"></div>
      <div className="ambient-particles"></div>
      <div className="fog-bg"></div>
      <div className="fog-pulse"></div>

      {(mode === 'INTRO' || mode === 'STARTING') && (
        <div className="intro-screen fade-in">
          {mode === 'STARTING' && <div className="ignition-beam"></div>}
          <div className={`intro-content ${mode === 'STARTING' ? 'shatter-out' : ''}`}>
            <h1 className="intro-title">O Eco da Sinfonia</h1>
            <p className="intro-desc">Para que a luz encontre o som...</p>

            <div className="ethereal-instructions">
              <span>F11 TELA CHEIA</span>
              <span className="dot-sep">•</span>
              <span>ACELERAÇÃO GRÁFICA</span>
              <span className="dot-sep">•</span>
              <span>DESATIVE SUA EXTENSÃO KK</span>
              <span className="dot-sep">•</span>
              <span>LUZES APAGADAS</span>
            </div>

            <div className="start-prompt" onClick={handleStartExperience}>
              <span className="start-text">MERGULHAR</span>
              <div className="start-underline"></div>
            </div>
          </div>
        </div>
      )}

      {mode === 'TRANSITION' && (
        <div className="transition-block emerge-water">
          <p>
            {phase === 1 && "O silêncio tomou o espaço."}
            {phase === 2 && "O ouro secou nas rachaduras."}
            {phase === 3 && "A maré levou o que tinha que levar."}
            {phase === 4 && "E a névoa abraçou o caminho."}
          </p>
          <div className="space-prompt liquid-text">Pressione <span>[ESPAÇO]</span> para continuar.</div>
        </div>
      )}

      {mode === 'CINEMATIC' && isReplayRef.current && (
        <div className="exit-replay-btn" onClick={stopReplayManually}>
          Interromper Sinfonia <span>×</span>
        </div>
      )}

      <div className="poetry-canvas">
        {(mode === 'MANUAL' || mode === 'WAITING') && (
          <div className={`intro-block emerge-water ${mode === 'WAITING' ? 'dissolve-out' : ''}`}>
            <h1 className="title liquid-text">{phaseTitles[phase]}</h1>
            <p className="subtitle">{phaseSubtitles[phase]}</p>

            <div className="note-constellation">
              {sequenceToPlay.map((noteObj, idx) => {
                const isPlayed = userProgress > idx;
                const isCurrent = userProgress === idx;
                return (
                  <span key={idx} className={`constellation-note ${isPlayed ? 'played' : ''} ${isCurrent ? 'current' : ''}`}>
                    {noteObj.pitch}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {mode === 'CINEMATIC' && !isReplayRef.current && (
          <div className="cinematic-story-layer">
            {STORIES[phase].map((line, idx) => {
              const isActive = storyIndex === idx;
              const words = line.split(" ");
              return (
                <div key={idx} className={`conscious-sentence ${isActive ? 'is-active' : ''}`}>
                  {words.map((word, wIdx) => (
                    <span key={wIdx} className="conscious-word" style={{ transitionDelay: isActive ? `${wIdx * 0.15}s` : '0s' }}>
                      {word}&nbsp;
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {mode === 'END' && (
          <div className="end-screen-wrapper">
            <div className="ghost-rain">
              {ghostDrops.map((_, i) => (
                <div key={i} className="ghost-drop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }}></div>
              ))}
            </div>

            <div className="end-block emerge-water final-fade">
              <h2 className="final-glow liquid-text">A Sinfonia Terminou.</h2>
              <div className="reflection-text">
                <p>O som partiu, mas a ressonância permaneceu.</p>
                <p>Espero que cada nota tenha alcançado os lugares onde as palavras jamais conseguiram tocar.</p>
                <p>Algo de belo continua voltando à memória. Que a luz siga adiante.</p>
                <p className="signature">Siga em frente.</p>
              </div>

              <div className="vinyl-tracklist-section">
                <div className="tracklist-header">
                  <div className="line"></div>
                  <p className="tracklist-hint">Ecos do Passado</p>
                  <div className="line"></div>
                </div>
                <div className="tracklist-menu">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <span key={p} className="track-item liquid-hover" onClick={() => handleReplayPhase(p)}>
                      <span className="track-number">{['I', 'II', 'III', 'IV', 'V'][p - 1]}</span>
                      <span className="track-name">{phaseTitles[p].split(': ')[1]}</span>
                      <span className="duration-hint">[Tocar]</span>
                      <div className="liquid-splash"></div>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="falling-lights-area">
        {visualNotes.map((note, idx) => (
          <div
            key={idx}
            ref={el => noteDOMRefs.current[idx] = el}
            className="engine-beam"
            style={{ left: `${note.pos}%` }}
          >
            <div className="beam-head"></div>
          </div>
        ))}
      </div>

      <div className={`minimal-keyboard ${(mode === 'END' || mode === 'TRANSITION' || mode === 'INTRO' || mode === 'STARTING') ? 'hidden' : ''} ${mode === 'WAITING' ? 'keyboard-fading' : ''}`}>
        {PIANO_KEYS.map((key) => (
          <div
            id={`key-${key.name}`}
            key={key.name}
            className="min-key"
            style={{ left: `${key.pos}%` }}
            onMouseDown={() => handlePlay(key.name)}
          >
            <div className="glow-bar"></div>
            <div className="key-labels">
              <span className="note-name">{key.name}</span>
              <span className="bind-name">[{key.keyBind.toUpperCase()}]</span>
            </div>
          </div>
        ))}
        <div className="baseline"></div>
        <div id="shockwave-container"></div>
      </div>

    </div>
  );
}