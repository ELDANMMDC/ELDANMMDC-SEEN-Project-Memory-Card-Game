export default class UI {
  constructor() {
    this.movesEl = document.getElementById('moves');   
    this.missesEl = document.getElementById('misses'); 
    this.timeEl = document.getElementById('time');     
    this.winModal = document.getElementById('winModal'); 
  }

  updateMoves(n) {
    if (this.movesEl) this.movesEl.textContent = String(n);
  }

  updateMisses(n) {
    if (this.missesEl) this.missesEl.textContent = String(n);
  }

  updateMatches(n) {
    if (this.matchesEl) this.matchesEl.textContent = String(n);
  }

  updateTime(timeString) {
    if (this.timeEl) this.timeEl.textContent = timeString;
  }

  showWinMessage(payload = {}) {
    // payload
    const { time, moves, misses } = payload;

    if (this.winModal) {
      const timeSpan = this.winModal.querySelector('.final-time');
      const movesSpan = this.winModal.querySelector('.final-moves');
      const missesSpan = this.winModal.querySelector('.final-misses');

      if (timeSpan) timeSpan.textContent = time || '--:--';
      if (movesSpan) movesSpan.textContent = String(moves || 0);
      if (missesSpan) missesSpan.textContent = String(misses || 0);

      try {
        const modal = new bootstrap.Modal(this.winModal);
        modal.show();
      } catch (e) {
        console.warn('Bootstrap not available to show modal, redirecting to results.');
        this._redirectToResults(payload);
      }
    } else {
      this._redirectToResults(payload);
    }
  }

  showMessage(text) {
    let el = document.getElementById('game-message');
    if (!el) {
      el = document.createElement('div');
      el.id = 'game-message';
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.bottom = '6rem';
      el.style.transform = 'translateX(-50%)';
      el.style.background = 'rgba(0,0,0,0.8)';
      el.style.color = '#fff';
      el.style.padding = '0.5rem 1rem';
      el.style.borderRadius = '8px';
      el.style.zIndex = '1200';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1500);
  }

  _redirectToResults(payload) {
    const q = new URLSearchParams({
      size: payload.size || '',
      theme: payload.theme || '',
      speed: payload.speed || '',
      moves: payload.moves || 0,
      misses: payload.misses || 0,
      time: payload.seconds || 0
    });
    window.location.href = `results.html?${q.toString()}`;
  }
}
