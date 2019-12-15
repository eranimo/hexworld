import { PlanetViewWorkerEvent } from './workerTypes';
import { start } from './Game';

const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  console.log('event', event);
  if (type === PlanetViewWorkerEvent.INIT) {
    console.log('init')
    start(payload.offscreen)
    ctx.postMessage({ type: 'initComplete' });
  }
});