# Ecos da Sinfonia 🎵✨


<div align="center">
  <img src="src/assets/projeto.gif" alt="Ecos da Sinfonia" />
</div>

Uma experiência interativa e imersiva baseada na web onde música, poesia e luz se encontram. Sincronize as notas em queda com o teclado para revelar memórias e trilhas sonoras.

## 🚀 Visão Geral do Projeto

O **Eco da sinfonia** não é apenas um jogo rítmico, mas uma demonstração de como integrar processamento de áudio nativo do navegador com interfaces reativas modernas. O projeto foi desenhado com foco absoluto em **Clean Code** e **Separação de Responsabilidades (SoC)**, garantindo um código limpo, escalável e de fácil manutenção.

## 🏗️ Arquitetura e Padrões Utilizados

Para evitar um "Monolito" no componente principal, a aplicação segue uma arquitetura modularizada:

* 📂 **`src/services/audioEngine.js`**: Isola completamente a **Web Audio API**. O React apenas aciona os métodos, sem precisar entender os cálculos de frequência ou criação de osciladores.
* 📂 **`src/constants/gameData.js`**: Extração de todos os dados estáticos (textos de história, posições das teclas, configurações de tempo e fallbacks MIDI). 
* 📂 **`src/components/`**: Utilização de *Dumb Components* (ex: `Keyboard.jsx`) que recebem `props` e apenas se preocupam em renderizar a UI.
* ⚙️ **Game Loop Customizado**: Uso intenso de `requestAnimationFrame` dentro de `useRef` para calcular colisões perfeitas e interpolação de frames, garantindo que as animações de luz não "vazem" e sejam executadas a 60FPS.

## 🛠️ Tecnologias e Bibliotecas

* **React** (Vite)
* **JavaScript (ES6+)**
* **Web Audio API** (Sintetizador gerado matematicamente via código)
* **@tonejs/midi** (Para decodificação das trilhas)
* **CSS3 Avançado** (Animações, transições suaves, variáveis dinâmicas e design responsivo)

## 🎮 Como Executar Localmente

ECOS DO PASSADO
================

 CATEGORIA: INSTALAÇÃO DO PROJETO

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/eco-da-sinfonia.git
```

2. Entre na pasta do projeto:
```bash
cd ecos-da-sinfonia
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o projeto:
```bash
npm run dev
```

CATEGORIA: OBSERVAÇÃO

- Certifique-se de ter o Node.js e o npm instalados em sua máquina antes de executar os comandos.
- Substitua "seu-usuario" pelo nome correto do usuário no GitHub, caso necessário.
