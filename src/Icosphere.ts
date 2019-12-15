import { Vector3 } from "@babylonjs/core/Maths/math";

export interface IcoNode {
  p: Vector3;
  e: Array<number>;
  f: Array<number>;
}

export interface IcoEdge {
  n: Array<number>;
  f: Array<number>;

  subdivided_n?: Array<number>;
  subdivided_e?: Array<number>;
}

export interface IcoFace {
  n: Array<number>;
  e: Array<number>;
  centroid?: Vector3;
}

export interface IcosahedronMesh {
  nodes: Array<IcoNode>;
  edges: Array<IcoEdge>;
  faces: Array<IcoFace>;
}

export class Icosphere {
  scale: number;
  degree: number;
  icosahedron: IcosahedronMesh = {
    nodes: [],
    edges: [],
    faces: []
  };

  constructor(scale: number, degree: number) {
    this.scale = scale;
    this.degree = degree;

    this.generate();
    this.subdivide();
    this.correctFaceIndices();
  }

  generate(): void {
    var phi: number = (1.0 + Math.sqrt(5.0)) / 2.0;
    var du: number = 1.0 / Math.sqrt(phi * phi + 1.0);
    var dv: number = phi * du;

    this.icosahedron.nodes = [
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

    this.icosahedron.edges = [
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

    this.icosahedron.faces = [
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
  }

  subdivide(): void {
    var nodes: Array<IcoNode> = [];
    for (var i = 0; i < this.icosahedron.nodes.length; ++i) {
      nodes.push({ p: this.icosahedron.nodes[i].p, e: [], f: [] });
    }
    var edges: Array<IcoEdge> = [];
    for (var i = 0; i < this.icosahedron.edges.length; ++i) {
      var edge: IcoEdge = this.icosahedron.edges[i];
      edge.subdivided_n = [];
      edge.subdivided_e = [];
      var n0: IcoNode = this.icosahedron.nodes[edge.n[0]];
      var n1: IcoNode = this.icosahedron.nodes[edge.n[1]];
      var p0: Vector3 = n0.p;
      var p1: Vector3 = n1.p;
      var delta: Vector3 = p1.subtract(p0);
      nodes[edge.n[0]].e.push(edges.length);
      var priorNodeIndex: number = edge.n[0];
      for (var s = 1; s < this.degree; ++s) {
        var edgeIndex: number = edges.length;
        var nodeIndex: number = nodes.length;
        edge.subdivided_e.push(edgeIndex);
        edge.subdivided_n.push(nodeIndex);
        edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
        priorNodeIndex = nodeIndex;
        nodes.push({
          p: Vector3.Lerp(p0, p1, s / this.degree),
          e: [edgeIndex, edgeIndex + 1],
          f: []
        });
      }
      edge.subdivided_e.push(edges.length);
      nodes[edge.n[1]].e.push(edges.length);
      edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
    }

    var faces: Array<IcoFace> = [];
    for (var i = 0; i < this.icosahedron.faces.length; ++i) {
      var face: IcoFace = this.icosahedron.faces[i];
      var edge0: IcoEdge = this.icosahedron.edges[face.e[0]];
      var edge1: IcoEdge = this.icosahedron.edges[face.e[1]];
      var edge2: IcoEdge = this.icosahedron.edges[face.e[2]];
      var point0: Vector3 = this.icosahedron.nodes[face.n[0]].p;
      var point1: Vector3 = this.icosahedron.nodes[face.n[1]].p;
      var point2: Vector3 = this.icosahedron.nodes[face.n[2]].p;
      var delta: Vector3 = point1.subtract(point0);

      var getEdgeNode0 =
        face.n[0] === edge0.n[0]
          ? k => {
              return edge0.subdivided_n[k];
            }
          : k => {
              return edge0.subdivided_n[this.degree - 2 - k];
            };
      var getEdgeNode1 =
        face.n[1] === edge1.n[0]
          ? k => {
              return edge1.subdivided_n[k];
            }
          : k => {
              return edge1.subdivided_n[this.degree - 2 - k];
            };
      var getEdgeNode2 =
        face.n[0] === edge2.n[0]
          ? k => {
              return edge2.subdivided_n[k];
            }
          : k => {
              return edge2.subdivided_n[this.degree - 2 - k];
            };

      var faceNodes: Array<number> = [];
      faceNodes.push(face.n[0]);
      for (var j = 0; j < edge0.subdivided_n.length; ++j)
        faceNodes.push(getEdgeNode0(j));
      faceNodes.push(face.n[1]);
      for (var s = 1; s < this.degree; ++s) {
        faceNodes.push(getEdgeNode2(s - 1));
        var p0: Vector3 = nodes[getEdgeNode2(s - 1)].p;
        var p1: Vector3 = nodes[getEdgeNode1(s - 1)].p;
        for (var t = 1; t < this.degree - s; ++t) {
          faceNodes.push(nodes.length);
          nodes.push({
            p: Vector3.Lerp(p0, p1, t / (this.degree - s)),
            e: [],
            f: []
          });
        }
        faceNodes.push(getEdgeNode1(s - 1));
      }
      faceNodes.push(face.n[2]);

      var getEdgeEdge0 =
        face.n[0] === edge0.n[0]
          ? k => {
              return edge0.subdivided_e[k];
            }
          : k => {
              return edge0.subdivided_e[this.degree - 1 - k];
            };
      var getEdgeEdge1 =
        face.n[1] === edge1.n[0]
          ? k => {
              return edge1.subdivided_e[k];
            }
          : k => {
              return edge1.subdivided_e[this.degree - 1 - k];
            };
      var getEdgeEdge2 =
        face.n[0] === edge2.n[0]
          ? k => {
              return edge2.subdivided_e[k];
            }
          : k => {
              return edge2.subdivided_e[this.degree - 1 - k];
            };

      var faceEdges0: Array<number> = [];
      for (var j = 0; j < this.degree; ++j) faceEdges0.push(getEdgeEdge0(j));
      var nodeIndex: number = this.degree + 1;
      for (var s = 1; s < this.degree; ++s) {
        for (var t = 0; t < this.degree - s; ++t) {
          faceEdges0.push(edges.length);
          var edge: IcoEdge = {
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

      var faceEdges1: Array<number> = [];
      nodeIndex = 1;
      for (var s = 0; s < this.degree; ++s) {
        for (var t = 1; t < this.degree - s; ++t) {
          faceEdges1.push(edges.length);
          var edge: IcoEdge = {
            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + this.degree - s]],
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

      var faceEdges2: Array<number> = [];
      nodeIndex = 1;
      for (var s = 0; s < this.degree; ++s) {
        faceEdges2.push(getEdgeEdge2(s));
        for (var t = 1; t < this.degree - s; ++t) {
          faceEdges2.push(edges.length);
          var edge: IcoEdge = {
            n: [
              faceNodes[nodeIndex],
              faceNodes[nodeIndex + this.degree - s + 1]
            ],
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
      for (var s = 0; s < this.degree; ++s) {
        for (t = 1; t < this.degree - s + 1; ++t) {
          var subFace: IcoFace = {
            n: [
              faceNodes[nodeIndex],
              faceNodes[nodeIndex + 1],
              faceNodes[nodeIndex + this.degree - s + 1]
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
      for (var s = 1; s < this.degree; ++s) {
        for (t = 1; t < this.degree - s + 1; ++t) {
          var subFace: IcoFace = {
            n: [
              faceNodes[nodeIndex],
              faceNodes[nodeIndex + this.degree - s + 2],
              faceNodes[nodeIndex + this.degree - s + 1]
            ],
            e: [
              faceEdges2[edgeIndex + 1],
              faceEdges0[edgeIndex + this.degree - s + 1],
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
    for (var n of nodes) {
      n.p.normalize().scaleInPlace(this.scale);
    }

    for (var f of faces) {
      f.centroid = this.calculateFaceCentroid(
        nodes[f.n[0]].p,
        nodes[f.n[1]].p,
        nodes[f.n[2]].p
      );
    }
    // nodes.map(function (n) {
    //     n.p.normalize().scaleInPlace(this.scale);
    // });

    // faces.map((f) => {
    //     f.centroid = this.calculateFaceCentroid(nodes[f.n[0]].p, nodes[f.n[1]].p, nodes[f.n[2]].p)
    // });

    this.icosahedron.nodes = nodes;
    this.icosahedron.edges = edges;
    this.icosahedron.faces = faces;
  }

  correctFaceIndices(): void {
    for (var i = 0; i < this.icosahedron.nodes.length; ++i) {
      var node: IcoNode = this.icosahedron.nodes[i];
      var faceIndex: number = node.f[0];
      for (var j = 1; j < node.f.length - 1; ++j) {
        faceIndex = this.findNextFaceIndex(i, faceIndex);
        var k: number = node.f.indexOf(faceIndex);
        node.f[k] = node.f[j];
        node.f[j] = faceIndex;
      }
    }
  }

  calculateFaceCentroid(pa: Vector3, pb: Vector3, pc: Vector3): Vector3 {
    var vabHalf: Vector3 = pb.subtract(pa).scale(1.0 / 2.0);
    var pabHalf: Vector3 = pa.add(vabHalf);
    var centroid: Vector3 = pc
      .subtract(pabHalf)
      .scale(1.0 / 3.0)
      .add(pabHalf);
    return centroid;
  }

  getEdgeOppositeFaceIndex(edge: IcoEdge, faceIndex: number): number {
    if (edge.f[0] === faceIndex) return edge.f[1];
    if (edge.f[1] === faceIndex) return edge.f[0];
  }

  findNextFaceIndex(nodeIndex: number, faceIndex: number): number {
    var node: IcoNode = this.icosahedron.nodes[nodeIndex];
    var face: IcoFace = this.icosahedron.faces[faceIndex];
    var nodeFaceIndex: number = face.n.indexOf(nodeIndex);
    var edge: IcoEdge = this.icosahedron.edges[face.e[(nodeFaceIndex + 2) % 3]];
    return this.getEdgeOppositeFaceIndex(edge, faceIndex);
  }
}
