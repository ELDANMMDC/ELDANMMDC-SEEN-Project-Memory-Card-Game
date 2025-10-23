import Game from '../../src/game/game.js';
import Board from '../../src/game/board.js';
import UI from '../../src/game/ui.js';
import { Timer } from '../../src/utils/timer.js';

document.addEventListener('DOMContentLoaded', async () => {

  const size = parseInt(localStorage.getItem('size'), 10) || 4;      // 4,6,8
  const theme = localStorage.getItem('theme') || 'animals';         // animals, fruits, symbols
  const speed = localStorage.getItem('speed') || 'normal';          // fast, normal, slow

  const totalCards = Number(size) * Number(size);
  if (totalCards % 2 !== 0) {
    console.error('Board total must be even');
    return;
  }
  const pairs = totalCards / 2;

  // image paths
  const basePath = `assets/img/${theme}`;
  const images = [];
  for (let i = 0; i < pairs; i++) {
    images.push(`${basePath}/${i}.png`);
  }

  // preload helper
  async function preloadImages(paths = [], timeoutMs = 1800) {
    if (!paths || !paths.length) return [];

    const loaders = paths.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;

        if (img.decode) {
          img.decode()
            .then(() => resolve({ src, status: 'ok', img }))
            .catch(() => resolve({ src, status: 'error', img }));
        } else {
          img.onload = () => resolve({ src, status: 'ok', img });
          img.onerror = () => resolve({ src, status: 'error', img });
        }
      });
    });
    
    const allPromise = Promise.all(loaders);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));

    const result = await Promise.race([allPromise, timeoutPromise]);
    if (result === 'timeout') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => { allPromise.catch(() => {}); });
      } else {
        allPromise.catch(() => {});
      }
      return []; 
    }
    return result; 
  }

  try {
    // preload images with timeout
    await preloadImages(images, 1800);
  } catch (e) {
    console.warn('Image preload failed or timed out', e);
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

  // render and start
  board.render();
  game.start();
  window.game = game;
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