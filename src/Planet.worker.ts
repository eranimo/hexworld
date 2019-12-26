import { Planet, PlanetOptions } from './Planet';
import * as Comlink from 'comlink';


let planet: Planet;

type PlanetWorkerEvents = {
  onDraw: () => void,
}

export const PlanetWorker = {
  generate(
    seed: string,
    options: PlanetOptions
  ) {
    planet = new Planet(options, seed);
    console.log('Planet', planet);

    // setInterval(() => {
    //   console.time('updateColors');
    //   planet.updateColors();
    //   console.timeEnd('updateColors');
    // }, 1000);

    return planet.render();
  }
};
Comlink.expose(PlanetWorker)