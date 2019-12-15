import './style.css';
import PlanetView from 'worker-loader!./PlanetView.worker';
import { PlanetViewWorkerEvent } from './workerTypes';

const planetViewWorker = new PlanetView();
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const offscreen = canvas.transferControlToOffscreen();

planetViewWorker.postMessage(
  {
  type: PlanetViewWorkerEvent.INIT, payload: { offscreen }
  },
  [offscreen as any],
);

planetViewWorker.addEventListener('message', event => {
  if (event.type === 'initComplete') {
    console.log('loaded');
  }
});
