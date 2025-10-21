import Game from '../../src/game/game.js';
import Board from '../../src/game/board.js';
import UI from '../../src/game/ui.js';
import { Timer } from '../../src/utils/timer.js'; 

document.addEventListener('DOMContentLoaded', () => {
  
  const size = parseInt(localStorage.getItem('size'), 10) || 4;      // 4,6,8
  const theme = localStorage.getItem('theme') || 'animals';         // animals, fruits, symbols
  const speed = localStorage.getItem('speed') || 'normal';          // fast, normal, slow

  // calculate total cards and pairs
  const totalCards = Number(size) * Number(size);
  if (totalCards % 2 !== 0) {
    console.error('Board total must be even');
    return;
  }
  const pairs = totalCards / 2;

  // image paths
  const basePath = `../assets/img/${theme}`;
  const images = [];
  for (let i = 0; i < pairs; i++) {
    images.push(`${basePath}/${i}.png`);
  }

  // duplicate and shuffle
  let deck = [...images, ...images];
  deck = shuffle(deck);

  const boardEl = document.getElementById('board');
  if (!boardEl) {
    console.error('#board element not found');
    return;
  }

  const board = new Board(boardEl, size, deck);
  const ui = new UI();
  const game = new Game(board, ui, { size, theme, speed });

  // start 
  board.render();
  game.start();
});

/* fisher–yates shuffle */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
