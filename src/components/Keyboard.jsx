import React from 'react';
import { PIANO_KEYS } from '../constants/gameData';

export default function Keyboard({ mode, handlePlay }) {
    const isHidden = ['END', 'TRANSITION', 'INTRO', 'STARTING'].includes(mode);
    const isFading = mode === 'WAITING';

    return (
        <div className={`minimal-keyboard ${isHidden ? 'hidden' : ''} ${isFading ? 'keyboard-fading' : ''}`}>
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
    );
}