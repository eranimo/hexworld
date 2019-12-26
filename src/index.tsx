import { Vector3 } from "@babylonjs/core/Maths/math";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Legacy/legacy";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from '@babylonjs/core/Legacy/legacy';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import * as Comlink from 'comlink';
import { PlanetWorker } from './Planet.worker';

const worker = new Worker('./Planet.worker.ts');
const planet = Comlink.wrap(worker) as unknown as typeof PlanetWorker;

let material: StandardMaterial;
let mesh: Mesh;

function onDraw() {
  console.log('onDraw');
  mesh.updateCache(true);
}

function cellsForPlanetScale(scale: number): number {
  return 10 * (scale ** 2) + 2;
}

async function createPlanetMesh(scale, degree, scene) {
  material = new StandardMaterial("planet", scene);
  console.time('getPlanet');
  const options = { scale, degree };
  const renderData = await planet.generate('fuck', options);
  console.log('Render data', renderData);
  console.timeEnd('getPlanet');

  const indices = new Uint32Array(renderData.indices);
  let colors = new Float32Array(renderData.colors);
  const positions = new Float32Array(renderData.positions);
  const uvs: Array<number> = [];

  mesh = new Mesh("planet", scene);
  mesh.useVertexColors = true;

  var vertexData = new VertexData();

  vertexData.indices = indices;
  vertexData.positions = positions;
  vertexData.colors = colors;

  var normals = [];
  VertexData.ComputeNormals(positions, indices, normals);
  vertexData.normals = normals;

  vertexData.applyToMesh(mesh, true);

  // mesh.convertToFlatShadedMesh();

  // setInterval(() => {
  //   console.time('update loop');
  //   // colors = new Float32Array(renderData.colors)
  //   // vertexData.colors = colors;
  //   // material.markAsDirty(Material.AllDirtyFlag);
  //   vertexData.updateMesh(mesh);
  //   console.timeEnd('update loop');
  // }, 1000);

  mesh.material = material;
  return mesh;
}

async function start(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.debugLayer.show();
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
  sun.diffuse = new Color3(1, 1, 1);
  sun.specular = new Color3(1, 1, 1);
  sun.groundColor = new Color3(1, 1, 1);
  sun.intensity = 1;
  // var moon = new HemisphericLight(
  //   "moon",
  //   new Vector3(0, 0, -1),
  //   scene
  // );
  // moon.intensity = 0.2;

  console.time('createPlanetMesh');
  var polygon = await createPlanetMesh(20, 150, scene); //This line renders the Icosahedron planet
  console.timeEnd('createPlanetMesh');

  // scene.registerBeforeRender(function() {
  //   polygon.rotation.y += -0.0005;
  //   polygon.rotation.x += -0.0005 / 4;
  // });

  engine.runRenderLoop(function() {
    scene.render();
  });
}

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
start(canvas);