import { PlanetWorkerEvent } from './workerTypes';
import { Planet } from './Planet';

const ctx: Worker = self as any;



ctx.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  console.log('event', event);
  if (type === PlanetWorkerEvent.GENERATE) {
    const { scale, degree } = payload;
    console.time('Planet');
    const planet = new Planet(scale, degree, 'fuck');
    console.log('Planet', planet);
    console.timeEnd('Planet');

    console.time('Render');
    const renderPayload = planet.render();
    console.timeEnd('Render');
    ctx.postMessage({ type: PlanetWorkerEvent.RENDER, payload: renderPayload });
  }
});