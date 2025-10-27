import { Timer } from '../../src/utils/timer.js';

export default class Game {
  constructor(board, ui, options = {}) {
    if (!board) throw new Error('Board required');
    this.board = board;
    this.ui = ui || {};
    this.size = Number(options.size) || Number(board.size) || 4;
    this.theme = options.theme || 'animals';
    this.speed = options.speed || 'normal';

    this.first = null;
    this.second = null;
    this.lock = false;
    this.moves = 0;
    this.misses = 0;
    this.matches = 0;
    this.totalPairs = (this.size * this.size) / 2;

    this.timer = new Timer((secs) => {
      const formatted = formatTime(secs);
      if (this.ui.updateTime) this.ui.updateTime(formatted);
      else {
        const el = document.getElementById('time');
        if (el) el.textContent = formatted;
      }
    });
  }

  start() {
    if (this.board && typeof this.board.attachCardClickHandler === 'function') {
      this.board.attachCardClickHandler((cardEl) => this._onCardClicked(cardEl));
    }

    // initialize UI values
    this.ui?.updateMoves?.(0);
    this.ui?.updateMisses?.(0);
    this.ui?.updateMatches?.(0);
  }

  _onCardClicked(cardEl) {
    if (this.lock) return;
    if (!cardEl) return;
    if (cardEl.classList.contains('is-revealed') || cardEl.classList.contains('is-matched')) return;

    // start timer on first move
    if (this.moves === 0 && this.matches === 0 && !this.timer.isRunning()) {
      this.timer.start();
    }

    this.board.flip(cardEl);

    if (!this.first) {
      this.first = cardEl;
      return;
    }

    if (this.first === cardEl) return; // same card clicked

    this.second = cardEl;
    this.lock = true;
    this.moves++;
    this.ui?.updateMoves?.(this.moves);

    const srcA = this.board.getCardImageSrc(this.first);
    const srcB = this.board.getCardImageSrc(this.second);

    if (srcA && srcB && srcA === srcB) {
      // match
      setTimeout(() => {
        this.board.markMatched(this.first);
        this.board.markMatched(this.second);
        this.matches++;

        this.ui?.updateMatches?.(this.matches);

        this.first = null;
        this.second = null;
        this.lock = false;

        if (this.matches === this.totalPairs) {
          this._win();
        }
      }, this._speedToMs() / 2);
    } else {
      // not a match
      setTimeout(() => {
        this.board.unflip(this.first);
        this.board.unflip(this.second);
        this.misses++;
        this.ui?.updateMisses?.(this.misses);

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

    if (this.ui.showWinMessage) {
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
      const q = new URLSearchParams({
        size: this.size, theme: this.theme, speed: this.speed,
        moves: this.moves, misses: this.misses, time: secs
      });
      window.location.href = `results.html?${q.toString()}`;
    }
  }

  // reset logic
  reset({ reshuffle = true } = {}) {
    this.timer.stop();
    this.timer.reset();
    this.first = null;
    this.second = null;
    this.lock = false;
    this.moves = 0;
    this.misses = 0;
    this.matches = 0;

    this.ui?.updateMoves?.(0);
    this.ui?.updateMisses?.(0);
    this.ui?.updateMatches?.(0);
    this.ui?.updateTime?.('00:00');

    if (reshuffle && this.board) {
      if (typeof this.board.reset === 'function') {
        this.board.reset(); 
      } else {
        const cards = document.querySelectorAll('#board .game-card');
        cards.forEach(card => card.classList.remove('is-revealed', 'is-matched'));
      }
    }
  }
}

/* Utility */
function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
