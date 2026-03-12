export const REQUIRED_NOTES = 10;
export const FALL_DURATION = 1.8;
export const TEMPO_MULTIPLIER = 1.2;
export const MAX_AUTO_PLAY_SECONDS = 60;

export const PIANO_KEYS = [
    { name: 'C', keyBind: 'a', pos: 10 }, { name: 'C#', keyBind: 'w', pos: 18 },
    { name: 'D', keyBind: 's', pos: 26 }, { name: 'D#', keyBind: 'e', pos: 34 },
    { name: 'E', keyBind: 'd', pos: 42 }, { name: 'F', keyBind: 'f', pos: 50 },
    { name: 'F#', keyBind: 't', pos: 58 }, { name: 'G', keyBind: 'g', pos: 66 },
    { name: 'G#', keyBind: 'y', pos: 74 }, { name: 'A', keyBind: 'h', pos: 82 },
    { name: 'A#', keyBind: 'u', pos: 90 }, { name: 'B', keyBind: 'j', pos: 98 }
];

export const STORIES = {
    1: ["Há coisas que se desfazem sem ruído, como poeira atravessada por luz.", "O ar muda antes que os olhos percebam.", "Por um instante, tudo parece suspenso entre presença e desaparecimento.", "O silêncio não interrompe. Ele molda.", "E o que resta vibra, invisível, dentro do espaço."],
    2: ["As superfícies guardam marcas que só a luz revela.", "Fendas douradas atravessam a matéria como memórias acesas.", "Nada aqui pede para voltar ao que era.", "A fratura também compõe.", "E cada linha quebrada aprende a refletir de outro modo."],
    3: ["A água toca sem pedir licença.", "Escorre entre os dedos, contorna a forma, leva consigo o excesso.", "Não há como deter o que nasceu para seguir.", "O fluxo conhece caminhos que o corpo ainda não entende.", "Resta abrir as mãos e ouvir a passagem."],
    4: ["A névoa ocupa o lugar das certezas.", "Os contornos respiram devagar, quase desaparecendo diante do olhar.", "Há um frio delicado no que ainda não se revela.", "Mas até a sombra cansa de esconder.", "E pouco a pouco, o espaço volta a ter profundidade."],
    5: ["Depois de tudo, uma escuridão vazia se abre.", "Não como ausência, mas como campo.", "Uma superfície limpa, pronta para receber outro gesto, outra luz, outro som.", "Nada termina de fato dentro da experiência.", "A última nota apenas se dissolve no infinito."]
};

export const FALLBACKS = {
    1: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['C', 'E', 'G', 'B'][i % 4], midi: 60 + (i % 4) * 2, time: i * 0.5, duration: 0.5 })),
    2: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['D', 'F', 'A', 'C'][i % 4], midi: 62 + (i % 4) * 2, time: i * 0.5, duration: 0.5 })),
    3: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['E', 'G', 'B', 'D'][i % 4], midi: 64 + (i % 4) * 2, time: i * 0.8, duration: 0.8 })),
    4: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['A', 'C', 'E', 'A'][i % 4], midi: 57 + (i % 4) * 3, time: i * 0.6, duration: 0.6 })),
    5: Array.from({ length: 120 }).map((_, i) => ({ pitch: ['C', 'F', 'A', 'E'][i % 4], midi: 65 + (i % 4) * 3, time: i * 0.6, duration: 1.0 }))
};

export const PHASE_TITLES = {
    1: 'Ato I: O Eco', 2: 'Ato II: O Ouro', 3: 'Ato III: A Maré', 4: 'Ato IV: A Travessia', 5: 'Ato V: O Vazio'
};

export const PHASE_SUBTITLES = {
    1: 'Sincronize as notas para revelar a memória.', 2: 'Há beleza no que foi quebrado. Continue tocando.',
    3: 'O final de um ciclo. Liberte o som.', 4: 'O escuro antes do amanhecer. Siga em frente.',
    5: 'O último compasso. Escreva a sua saída.'
};