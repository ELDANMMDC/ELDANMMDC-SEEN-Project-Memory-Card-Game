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

  // reset 
  reset(opts = {}) {
    const { reshuffle = true } = opts;

    // stop & reset timer
    this.timer.stop();
    this.timer.reset();

    // clear pointers & state
    this.first = null;
    this.second = null;
    this.lock = false;
    this.moves = 0;
    this.misses = 0;
    this.matches = 0;
    this.totalPairs = (this.size * this.size) / 2;

    // update UI counters
    if (this.ui) {
      if (typeof this.ui.updateMoves === 'function') this.ui.updateMoves(this.moves);
      if (typeof this.ui.updateMisses === 'function') this.ui.updateMisses(this.misses);
      if (typeof this.ui.updateMatches === 'function') this.ui.updateMatches(this.matches);
      if (typeof this.ui.updateTime === 'function') this.ui.updateTime('00:00');
    } else {
      const timeEl = document.getElementById('time');
      if (timeEl) timeEl.textContent = '00:00';
      const movesEl = document.getElementById('moves');
      if (movesEl) movesEl.textContent = '0';
      const missesEl = document.getElementById('misses');
      if (missesEl) missesEl.textContent = '0';
    }

    // attempt to reshuffle / re-render board if requested
    if (reshuffle && this.board) {
      if (typeof this.board.reset === 'function') {
        this.board.reset();
      } else if (typeof this.board.shuffle === 'function') {
        this.board.shuffle();
        if (typeof this.board.render === 'function') this.board.render();
      } else if (typeof this.board.init === 'function') {
        this.board.init();
      } else if (typeof this.board.setup === 'function') {
        this.board.setup();
      } else {
        // fallback: unflip/clear matched classes on elements in DOM
        const cards = (typeof this.board.getAllCardElements === 'function')
          ? this.board.getAllCardElements()
          : document.querySelectorAll('#board [data-card]');
        Array.from(cards).forEach((c) => {
          c.classList.remove('is-revealed', 'is-matched');
        });
      }
    }

    // reattach click handler (in case board was re-rendered)
    if (this.board && typeof this.board.attachCardClickHandler === 'function') {
      this.board.attachCardClickHandler((cardEl) => this._onCardClicked(cardEl));
    }
  }
}

/* helpers */
function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
