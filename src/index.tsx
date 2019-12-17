import { PlanetWorkerEvent } from './workerTypes';

import { Vector3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Legacy/legacy";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from '@babylonjs/core/Legacy/legacy';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { IcosahedronMesh } from './Icosphere';
import { PlanetRenderData } from './Planet';

const planetWorker = new Worker('./Planet.worker.ts');

function getPlanet(scale, degree): Promise<PlanetRenderData> {
  planetWorker.postMessage({ type: PlanetWorkerEvent.GENERATE, payload: { scale, degree } });
  return new Promise((resolve, reject) => {
    planetWorker.addEventListener('message', event => {
      const { type, payload } = event.data;

      if (type === PlanetWorkerEvent.RENDER) {
        resolve(payload);
      }
    });
  });
}


async function createPlanetMesh(scale, degree, scene) {
  const material = new StandardMaterial("mat", scene);
  console.time('getPlanet');
  const renderData = await getPlanet(scale, degree);
  console.log('Render data', renderData);
  console.timeEnd('getPlanet');

  const indices = new Uint32Array(renderData.indices);
  const colors = new Float32Array(renderData.colors);
  const positions = new Float32Array(renderData.positions);
  const uvs: Array<number> = [];

  var mesh = new Mesh("planet", scene);
  mesh.useVertexColors = true;

  var vertexData = new VertexData();

  vertexData.indices = indices;
  vertexData.positions = positions;
  vertexData.colors = colors;

  var normals = [];
  VertexData.ComputeNormals(positions, indices, normals);
  vertexData.normals = normals;

  vertexData.applyToMesh(mesh, false);

  //mesh.convertToFlatShadedMesh();

  mesh.material = material;
  return mesh;
}

async function start(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.5, 0.5, 0.5, 1.0);

  // Camera
  const camera = new ArcRotateCamera(
    "camera1",
    0,
    0,
    0,
    new Vector3(0, 0, -0),
    scene
  );
  camera.setPosition(new Vector3(-60, 0, 0));
  camera.attachControl(canvas, true);

  // Sun & Moon
  var sun = new HemisphericLight("sun", new Vector3(0, 0, 1), scene);
  sun.intensity = 0.6;
  var moon = new HemisphericLight(
    "moon",
    new Vector3(0, 0, -1),
    scene
  );
  moon.intensity = 0.2;

  console.time('createPlanetMesh');
  var polygon = await createPlanetMesh(20, 150, scene); //This line renders the Icosahedron planet
  console.timeEnd('createPlanetMesh');

  scene.registerBeforeRender(function() {
    polygon.rotation.y += -0.0005;
    polygon.rotation.x += -0.0005 / 4;
  });

  engine.runRenderLoop(function() {
    scene.render();
  });
}

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
start(canvas);