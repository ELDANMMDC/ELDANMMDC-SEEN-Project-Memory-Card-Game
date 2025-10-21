(function () {
  const q = new URLSearchParams(window.location.search);

  const size = parseInt(q.get('size'), 10) || 4;
  const moves = parseInt(q.get('moves'), 10) || 0;
  const misses = parseInt(q.get('misses'), 10) || 0;
  const timeSec = parseInt(q.get('time'), 10) || 0;
  const speed = q.get('speed') || '';
  const theme = q.get('theme') || '';

  const totalPairs = (size * size) / 2;
  const matches = totalPairs; 

  // accuracy calc
  const accuracyPct = moves > 0 ? Math.round((matches / moves) * 100) : 0;

  // score calc
  const score = Math.max(0, Math.round(accuracyPct * 10 - timeSec * 0.5 - misses * 5));

  function formatTime(totalSeconds) {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  const el = (id) => document.getElementById(id);
  if (el('time')) el('time').textContent = formatTime(timeSec);
  if (el('score')) el('score').textContent = String(score);
  if (el('moves')) el('moves').textContent = String(moves);
  if (el('misses')) el('misses').textContent = String(misses);
  if (el('accuracy')) el('accuracy').textContent = `${accuracyPct}%`;

  // log to console
  console.log('Results', { size, theme, speed, moves, misses, timeSec, score, accuracyPct });
})();