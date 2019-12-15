import { Vector3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Legacy/legacy";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from '@babylonjs/core/Legacy/legacy';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Icosphere } from './Icosphere';

function createPlanetMesh(scale, degree, scene) {
  const material = new StandardMaterial("mat", scene);
  const icosphere = new Icosphere(scale, degree);

  const indices: Array<number> = [];
  const colors: Array<number> = [];
  const positions: Array<number> = [];
  const uvs: Array<number> = [];

  // Generate dual polyhedron position and face indices
  for (var n = 0; n < icosphere.icosahedron.nodes.length; n++) {
    const relativeZeroIndex = positions.length / 3;
    const color = new Color3(0, Math.random() * 0.5, Math.random() * 1);

    // Get all the centroids of the faces adjacent to this vertex
    for (var f = 0; f < icosphere.icosahedron.nodes[n].f.length; f++) {
      var centroid = icosphere.icosahedron.faces[icosphere.icosahedron.nodes[n].f[f]].centroid;
      positions.push(centroid.x);
      positions.push(centroid.y);
      positions.push(centroid.z);
      colors.push(color.r);
      colors.push(color.g);
      colors.push(color.b);
      colors.push(1.0);
    }

    for (var i = relativeZeroIndex; i < positions.length / 3 - 2; i++) {
      indices.push(relativeZeroIndex);
      indices.push(i + 1);
      indices.push(i + 2);
    }
  }

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

export function start(canvas: HTMLCanvasElement) {
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

  console.time('Planet');
  var polygon = createPlanetMesh(20, 150, scene); //This line renders the Icosahedron planet
  console.timeEnd('Planet');

  camera.attachControl(canvas);

  scene.registerBeforeRender(function() {
    polygon.rotation.y += -0.0005;
    polygon.rotation.x += -0.0005 / 4;
  });

  engine.runRenderLoop(function() {
    scene.render();
  });
}