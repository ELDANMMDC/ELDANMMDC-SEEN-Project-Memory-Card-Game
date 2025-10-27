export default class Board {
  constructor(boardElement, size, imagePaths = []) {
    this.boardElement = boardElement;
    this.size = Number(size) || 4;
    this.imagePaths = imagePaths.slice();
    this.cardElements = [];
    this._clickHandler = null; 
  }

  render() {
    this.boardElement.dataset.size = String(this.size);
    this.boardElement.innerHTML = '';
    this.cardElements = [];

    this.imagePaths.forEach((src, idx) => {
      const card = this._createCardElement(src, idx);
      this.boardElement.appendChild(card);
      this.cardElements.push(card);
    });
  }

  _createCardElement(imageSrc, index) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'game-card';
    btn.dataset.index = String(index);
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', 'Hidden card');

    const inner = document.createElement('span');
    inner.className = 'card-inner';

    const front = document.createElement('span');
    front.className = 'card-front';
    front.setAttribute('aria-hidden', 'true');

    const back = document.createElement('span');
    back.className = 'card-back';
    back.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = '';
    img.addEventListener('error', () => {
      img.remove();
      back.classList.add('no-image');
      back.textContent = '❓';
    });

    back.appendChild(img);
    inner.appendChild(front);
    inner.appendChild(back);
    btn.appendChild(inner);
    return btn;
  }

  attachCardClickHandler(handler) {
    this._clickHandler = handler; 

    this.boardElement.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.game-card');
      if (!btn) return;
      handler(btn);
    });
  }

  flip(cardEl) {
    if (!cardEl) return;
    cardEl.classList.add('is-revealed');
    cardEl.setAttribute('aria-pressed', 'true');
  }

  unflip(cardEl) {
    if (!cardEl) return;
    cardEl.classList.remove('is-revealed');
    cardEl.setAttribute('aria-pressed', 'false');
  }

  markMatched(cardEl) {
    if (!cardEl) return;
    cardEl.classList.add('is-matched');
    cardEl.setAttribute('aria-hidden', 'true');
  }

  getCardImageSrc(cardEl) {
    if (!cardEl) return null;
    const img = cardEl.querySelector('.card-back img');
    return img ? img.src : null;
  }

  reset() {
    // remove revealed/matched and restore states
    this.cardElements.forEach(card => {
      card.classList.remove('is-revealed', 'is-matched');
      card.setAttribute('aria-pressed', 'false');
      card.setAttribute('aria-hidden', 'false');
    });

    // shuffle + re-render cards
    this._shuffleImages();
    this.render();
  }

  _shuffleImages() {
    for (let i = this.imagePaths.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.imagePaths[i], this.imagePaths[j]] = [this.imagePaths[j], this.imagePaths[i]];
    }
  }
}
