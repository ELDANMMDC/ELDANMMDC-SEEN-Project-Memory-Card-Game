import { Timer } from '../../src/utils/timer.js';

export default class Game {
  constructor(board, ui, options = {}) {
    if (!board) throw new Error('Board required');
    this.board = board;
    this.ui = ui || {};
    this.size = Number(options.size) || Number(board.size) || 4;
    this.theme = options.theme || 'animals';
    this.speed = options.speed || 'normal';

    // state
    this.first = null;
    this.second = null;
    this.lock = false;
    this.moves = 0;
    this.misses = 0;
    this.matches = 0;
    this.totalPairs = (this.size * this.size) / 2;

    // timer
    this.timer = new Timer((secs) => {
      if (this.ui && typeof this.ui.updateTime === 'function') {
        this.ui.updateTime(formatTime(secs));
      } else {
        const timeEl = document.getElementById('time');
        if (timeEl) timeEl.textContent = formatTime(secs);
      }
    });
  }

  start() {
    this.board.attachCardClickHandler((cardEl) => this._onCardClicked(cardEl));

    // initialize UI counters
    if (this.ui && typeof this.ui.updateMoves === 'function') this.ui.updateMoves(this.moves);
    if (this.ui && typeof this.ui.updateMisses === 'function') this.ui.updateMisses(this.misses);
    if (this.ui && typeof this.ui.updateMatches === 'function') this.ui.updateMatches(this.matches);
  }

  _onCardClicked(cardEl) {
    if (this.lock) return;
    if (!cardEl) return;
    if (cardEl.classList.contains('is-revealed') || cardEl.classList.contains('is-matched')) return;

    // start timer on first interaction
    if (this.moves === 0 && this.matches === 0 && !this.timer.isRunning()) {
      this.timer.start();
    }

    // reveal card
    this.board.flip(cardEl);

    if (!this.first) {
      this.first = cardEl;
      return;
    }

    // prevent clicking the same card twice
    if (this.first === cardEl) return;

    this.second = cardEl;
    this.lock = true;
    this.moves += 1;
    if (this.ui && typeof this.ui.updateMoves === 'function') this.ui.updateMoves(this.moves);

    const srcA = this.board.getCardImageSrc(this.first);
    const srcB = this.board.getCardImageSrc(this.second);

    if (srcA && srcB && srcA === srcB) {
      // match
      setTimeout(() => {
        this.board.markMatched(this.first);
        this.board.markMatched(this.second);
        this.matches += 1;
        if (this.ui && typeof this.ui.updateMatches === 'function') this.ui.updateMatches(this.matches);

        // reset pointers
        this.first = null;
        this.second = null;
        this.lock = false;

        // win condition
        if (this.matches === this.totalPairs) {
          this._win();
        }
      }, this._speedToMs() / 2);
    } else {
        // no match
      setTimeout(() => {
        this.board.unflip(this.first);
        this.board.unflip(this.second);
        this.misses += 1;
        if (this.ui && typeof this.ui.updateMisses === 'function') this.ui.updateMisses(this.misses);

        this.first = null;
        this.second = null;
        this.lock = false;
      }, this._speedToMs() + 250);
    }
  }

  _speedToMs() {
    if (this.speed === 'fast') return 200;
    if (this.speed === 'slow') return 900;
    return 350; 
  }

  _win() {
    this.timer.stop();
    const secs = this.timer.getTime(); 
    const formatted = formatTime(secs);

    // call UI to show win modal or redirect
    if (this.ui && typeof this.ui.showWinMessage === 'function') {
      this.ui.showWinMessage({
        time: formatted,
        seconds: secs,
        moves: this.moves,
        misses: this.misses,
        size: this.size,
        theme: this.theme,
        speed: this.speed
      });
    } else {
      // fallback
      const q = new URLSearchParams({
        size: this.size, theme: this.theme, speed: this.speed,
        moves: this.moves, misses: this.misses, time: secs
      });
      window.location.href = `results.html?${q.toString()}`;
    }
  }

  // reset (to be implemented)
  reset() {
    this.timer.reset();
    this.first = null;
    this.second = null;
    this.lock = false;
    this.moves = 0;
    this.misses = 0;
    this.matches = 0;
    if (this.ui) {
      this.ui.updateMoves(this.moves);
      this.ui.updateMisses(this.misses);
      this.ui.updateMatches(this.matches);
      this.ui.updateTime('00:00');
    }
  }

  stop() {
    this.timer.stop();
  }
}

/* helpers */
function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
