export class Timer {
  constructor(onTick) {
    this.seconds = 0;
    this._interval = null;
    this.onTick = typeof onTick === 'function' ? onTick : () => {};
  }

  start() {
    if (this._interval) return; 
    this._interval = setInterval(() => {
      this.seconds += 1;
      this.onTick(this.seconds);
    }, 1000);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.onTick(this.seconds);
  }

  getTime() {
    return this.seconds;
  }

  isRunning() {
    return !!this._interval;
  }
}

/* utility to format seconds as MM:SS */
export function formatSeconds(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
