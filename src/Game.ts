import { Vector3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Legacy/legacy";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from '@babylonjs/core/Legacy/legacy';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';

function createPlanetMesh(scale, degree, scene) {
  var material = new StandardMaterial("mat", scene);
  var sdIco = generateSubdividedIcosahedron(scale, degree);

  var indices = [];
  var colors = [];
  var positions = [];

  for (var i = 0; i < sdIco.nodes.length; ++i) {
    var node = sdIco.nodes[i];
    var faceIndex = node.f[0];
    for (var j = 1; j < node.f.length - 1; ++j) {
      faceIndex = findNextFaceIndex(sdIco, i, faceIndex);
      var k = node.f.indexOf(faceIndex);
      node.f[k] = node.f[j];
      node.f[j] = faceIndex;
    }
  }

  // Generate dual polyhedron position and face indices
  for (var n = 0; n < sdIco.nodes.length; n++) {
    var relativeZeroIndex = positions.length / 3;

    var color = new Color3(0, Math.random() * 0.5, Math.random() * 1);

    // Get all the centroids of the faces adjacent to this vertex
    for (var f = 0; f < sdIco.nodes[n].f.length; f++) {
      var nodes = sdIco.faces[sdIco.nodes[n].f[f]].n;
      var centroid = sdIco.faces[sdIco.nodes[n].f[f]].centroid;
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

function generateIcosahedron() {
  var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
  var du = 1.0 / Math.sqrt(phi * phi + 1.0);
  var dv = phi * du;

  const nodes = [
    { p: new Vector3(0, +dv, +du), e: [], f: [] },
    { p: new Vector3(0, +dv, -du), e: [], f: [] },
    { p: new Vector3(0, -dv, +du), e: [], f: [] },
    { p: new Vector3(0, -dv, -du), e: [], f: [] },
    { p: new Vector3(+du, 0, +dv), e: [], f: [] },
    { p: new Vector3(-du, 0, +dv), e: [], f: [] },
    { p: new Vector3(+du, 0, -dv), e: [], f: [] },
    { p: new Vector3(-du, 0, -dv), e: [], f: [] },
    { p: new Vector3(+dv, +du, 0), e: [], f: [] },
    { p: new Vector3(+dv, -du, 0), e: [], f: [] },
    { p: new Vector3(-dv, +du, 0), e: [], f: [] },
    { p: new Vector3(-dv, -du, 0), e: [], f: [] }
  ];

  const edges: any[] = [
    { n: [0, 1], f: [] },
    { n: [0, 4], f: [] },
    { n: [0, 5], f: [] },
    { n: [0, 8], f: [] },
    { n: [0, 10], f: [] },
    { n: [1, 6], f: [] },
    { n: [1, 7], f: [] },
    { n: [1, 8], f: [] },
    { n: [1, 10], f: [] },
    { n: [2, 3], f: [] },
    { n: [2, 4], f: [] },
    { n: [2, 5], f: [] },
    { n: [2, 9], f: [] },
    { n: [2, 11], f: [] },
    { n: [3, 6], f: [] },
    { n: [3, 7], f: [] },
    { n: [3, 9], f: [] },
    { n: [3, 11], f: [] },
    { n: [4, 5], f: [] },
    { n: [4, 8], f: [] },
    { n: [4, 9], f: [] },
    { n: [5, 10], f: [] },
    { n: [5, 11], f: [] },
    { n: [6, 7], f: [] },
    { n: [6, 8], f: [] },
    { n: [6, 9], f: [] },
    { n: [7, 10], f: [] },
    { n: [7, 11], f: [] },
    { n: [8, 9], f: [] },
    { n: [10, 11], f: [] }
  ];

  const faces: any[] = [
    { n: [0, 1, 8], e: [0, 7, 3] },
    { n: [0, 4, 5], e: [1, 18, 2] },
    { n: [0, 5, 10], e: [2, 21, 4] },
    { n: [0, 8, 4], e: [3, 19, 1] },
    { n: [0, 10, 1], e: [4, 8, 0] },
    { n: [1, 6, 8], e: [5, 24, 7] },
    { n: [1, 7, 6], e: [6, 23, 5] },
    { n: [1, 10, 7], e: [8, 26, 6] },
    { n: [2, 3, 11], e: [9, 17, 13] },
    { n: [2, 4, 9], e: [10, 20, 12] },
    { n: [2, 5, 4], e: [11, 18, 10] },
    { n: [2, 9, 3], e: [12, 16, 9] },
    { n: [2, 11, 5], e: [13, 22, 11] },
    { n: [3, 6, 7], e: [14, 23, 15] },
    { n: [3, 7, 11], e: [15, 27, 17] },
    { n: [3, 9, 6], e: [16, 25, 14] },
    { n: [4, 8, 9], e: [19, 28, 20] },
    { n: [5, 11, 10], e: [22, 29, 21] },
    { n: [6, 9, 8], e: [25, 28, 24] },
    { n: [7, 10, 11], e: [26, 29, 27] }
  ];

  for (var i = 0; i < edges.length; ++i)
    for (var j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i);

  return { nodes: nodes, edges: edges, faces: faces };
}

function generateSubdividedIcosahedron(scale, degree) {
  var icosahedron = generateIcosahedron();

  var nodes = [];
  for (var i = 0; i < icosahedron.nodes.length; ++i) {
    nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
  }

  var edges = [];
  for (var i = 0; i < icosahedron.edges.length; ++i) {
    var edge = icosahedron.edges[i];
    edge.subdivided_n = [];
    edge.subdivided_e = [];
    var n0 = icosahedron.nodes[edge.n[0]];
    var n1 = icosahedron.nodes[edge.n[1]];
    var p0 = n0.p;
    var p1 = n1.p;
    var delta = p1.subtract(p0);
    nodes[edge.n[0]].e.push(edges.length);
    var priorNodeIndex = edge.n[0];
    for (var s = 1; s < degree; ++s) {
      var edgeIndex = edges.length;
      var nodeIndex = nodes.length;
      edge.subdivided_e.push(edgeIndex);
      edge.subdivided_n.push(nodeIndex);
      edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
      priorNodeIndex = nodeIndex;
      nodes.push({
        p: Vector3.Lerp(p0, p1, s / degree),
        e: [edgeIndex, edgeIndex + 1],
        f: []
      });
    }
    edge.subdivided_e.push(edges.length);
    nodes[edge.n[1]].e.push(edges.length);
    edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
  }

  var faces = [];
  for (var i = 0; i < icosahedron.faces.length; ++i) {
    var face = icosahedron.faces[i];
    var edge0 = icosahedron.edges[face.e[0]];
    var edge1 = icosahedron.edges[face.e[1]];
    var edge2 = icosahedron.edges[face.e[2]];
    var point0 = icosahedron.nodes[face.n[0]].p;
    var point1 = icosahedron.nodes[face.n[1]].p;
    var point2 = icosahedron.nodes[face.n[2]].p;
    var delta = point1.subtract(point0);

    var getEdgeNode0 =
      face.n[0] === edge0.n[0]
        ? function(k) {
            return edge0.subdivided_n[k];
          }
        : function(k) {
            return edge0.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode1 =
      face.n[1] === edge1.n[0]
        ? function(k) {
            return edge1.subdivided_n[k];
          }
        : function(k) {
            return edge1.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode2 =
      face.n[0] === edge2.n[0]
        ? function(k) {
            return edge2.subdivided_n[k];
          }
        : function(k) {
            return edge2.subdivided_n[degree - 2 - k];
          };

    var faceNodes = [];
    faceNodes.push(face.n[0]);
    for (var j = 0; j < edge0.subdivided_n.length; ++j)
      faceNodes.push(getEdgeNode0(j));
    faceNodes.push(face.n[1]);
    for (var s = 1; s < degree; ++s) {
      faceNodes.push(getEdgeNode2(s - 1));
      const p0: Vector3 = nodes[getEdgeNode2(s - 1)].p;
      const p1: Vector3 = nodes[getEdgeNode1(s - 1)].p;
      for (var t = 1; t < degree - s; ++t) {
        faceNodes.push(nodes.length);
        nodes.push({ p: Vector3.Lerp(p0, p1, t / (degree - s)), e: [], f: [] });
      }
      faceNodes.push(getEdgeNode1(s - 1));
    }
    faceNodes.push(face.n[2]);

    var getEdgeEdge0 =
      face.n[0] === edge0.n[0]
        ? function(k) {
            return edge0.subdivided_e[k];
          }
        : function(k) {
            return edge0.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge1 =
      face.n[1] === edge1.n[0]
        ? function(k) {
            return edge1.subdivided_e[k];
          }
        : function(k) {
            return edge1.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge2 =
      face.n[0] === edge2.n[0]
        ? function(k) {
            return edge2.subdivided_e[k];
          }
        : function(k) {
            return edge2.subdivided_e[degree - 1 - k];
          };

    var faceEdges0 = [];
    for (var j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j));
    let nodeIndex = degree + 1;
    for (var s = 1; s < degree; ++s) {
      for (var t = 0; t < degree - s; ++t) {
        faceEdges0.push(edges.length);
        const edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      ++nodeIndex;
    }

    var faceEdges1 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      for (var t = 1; t < degree - s; ++t) {
        faceEdges1.push(edges.length);
        const edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      faceEdges1.push(getEdgeEdge1(s));
      nodeIndex += 2;
    }

    var faceEdges2 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      faceEdges2.push(getEdgeEdge2(s));
      for (var t = 1; t < degree - s; ++t) {
        faceEdges2.push(edges.length);
        const edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      nodeIndex += 2;
    }

    nodeIndex = 0;
    edgeIndex = 0;
    for (var s = 0; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + 1],
            faceNodes[nodeIndex + degree - s + 1]
          ],
          e: [
            faceEdges0[edgeIndex],
            faceEdges1[edgeIndex],
            faceEdges2[edgeIndex]
          ]
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      ++nodeIndex;
    }

    nodeIndex = 1;
    edgeIndex = 0;
    for (var s = 1; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + degree - s + 2],
            faceNodes[nodeIndex + degree - s + 1]
          ],
          e: [
            faceEdges2[edgeIndex + 1],
            faceEdges0[edgeIndex + degree - s + 1],
            faceEdges1[edgeIndex]
          ]
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      nodeIndex += 2;
      edgeIndex += 1;
    }
  }

  //Project all of our points onto the unit sphere
  nodes.map(function(n) {
    n.p.normalize().scaleInPlace(scale);
  });

  faces.map(function(f) {
    f.centroid = calculateFaceCentroid(
      nodes[f.n[0]].p,
      nodes[f.n[1]].p,
      nodes[f.n[2]].p
    );
  });

  return { nodes: nodes, edges: edges, faces: faces };
}

function calculateFaceCentroid(pa, pb, pc) {
  var vabHalf = pb.subtract(pa).scale(1.0 / 2.0);
  var pabHalf = pa.add(vabHalf);
  var centroid = pc
    .subtract(pabHalf)
    .scale(1.0 / 3.0)
    .add(pabHalf);
  return centroid;
}

function getEdgeOppositeFaceIndex(edge, faceIndex) {
  if (edge.f[0] === faceIndex) return edge.f[1];
  if (edge.f[1] === faceIndex) return edge.f[0];
  throw "Given face is not part of given edge.";
}

function findNextFaceIndex(mesh, nodeIndex, faceIndex) {
  var node = mesh.nodes[nodeIndex];
  var face = mesh.faces[faceIndex];
  var nodeFaceIndex = face.n.indexOf(nodeIndex);
  var edge = mesh.edges[face.e[(nodeFaceIndex + 2) % 3]];
  return getEdgeOppositeFaceIndex(edge, faceIndex);
}

export function start() {
  if (Engine.isSupported()) {

    var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);
    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1.0);

    // Camera
    var camera = new ArcRotateCamera(
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
    var polygon = createPlanetMesh(20, 200, scene); //This line renders the Icosahedron planet
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
  return scene;
}