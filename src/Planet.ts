import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Legacy/legacy";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Legacy/legacy";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Icosphere, IcosahedronMesh } from "./Icosphere";

export interface PlanetTile {
  id: number;
  center: Vector3;
  corners: Array<PlanetCorner>;
}

export interface PlanetCorner {
  position: Vector3;
  uv: Vector2;
}

export interface PlanetData {
  faceToTile: Array<number>;
  tiles: Array<PlanetTile>;
}

export interface PlanetRenderData {
  indices: SharedArrayBuffer, // faces.length * 2 * 3
  positions: SharedArrayBuffer, // faces.length * 3 * 3
  colors: SharedArrayBuffer, // faces.length * 3 * 4
  uvs: SharedArrayBuffer, // faces.length * 2
}

export class Planet {
  scale: number;
  degree: number;

  icosphere: Icosphere;
  planet: PlanetData;

  // Render Earth.jpg from the Asset subfolder
  renderDiffuseTexture: boolean = false;

  // Render the procedurally created heightmap texture(s) to debug canvas
  renderDebugTextureCanvas: boolean = true;

  // Deform mesh based on heightmap values
  renderDeformedMesh: boolean = false;

  constructor(scale: number, degree: number, seed: string) {
    this.scale = scale;
    this.degree = degree;

    this.planet = {
      faceToTile: [],
      tiles: []
    };

    console.time("Icosphere");
    this.icosphere = new Icosphere(scale, degree);
    console.timeEnd("Icosphere");
  }

  calculateUVCoord(p: Vector3) {
    // Calculate the Miller Spherical Projection and map it to UV coordinates
    var lat: number = Math.asin(p.y / this.scale);
    var lon: number = Math.atan2(p.z, p.x);

    var x: number = lon / Math.PI;
    var y: number =
      ((5 / 4) * Math.log(Math.tan(Math.PI / 4 + (2 * lat) / 5))) /
      2.2523234430803587;
    if (y < -1.0) y = 1.0;

    x = (x + 1) / 2;
    y = (y + 1) / 2;
    return new Vector2(x, 1 - y);
  }

  render(): PlanetRenderData {
    const totalFaceCount = this.icosphere.icosahedron.faces.length;
    const indicesSAB: SharedArrayBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * totalFaceCount * 2 * 3);
    const positionsSAB: SharedArrayBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * totalFaceCount * 3 * 3);
    const colorsSAB: SharedArrayBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * totalFaceCount * 3 * 4);
    const uvsSAB: SharedArrayBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * totalFaceCount * 2);

    const indices: Uint32Array = new Uint32Array(indicesSAB);
    const positions: Float32Array = new Float32Array(positionsSAB);
    const colors: Float32Array = new Float32Array(colorsSAB);
    const uvs: Float32Array = new Float32Array(uvsSAB);

    // Generate dual polyhedron position and face indices
    let positionCount = 0;
    let uvsCount = 0;
    let colorsCount = 0;
    let indicesCount = 0;
    let facesCount = 0;
    for (var n = 0; n < this.icosphere.icosahedron.nodes.length; n++) {
      var relativeZeroIndex: number = positionCount / 3;
      var numFaces: number = this.icosphere.icosahedron.nodes[n].f.length;
      var tile: PlanetTile = {
        id: n,
        center: new Vector3(0, 0, 0),
        corners: []
      };

      // Get all the centroids of the faces adjacent to this vertex
      for (var f = 0; f < numFaces; f++) {
        var centroid: Vector3 = this.icosphere.icosahedron.faces[
          this.icosphere.icosahedron.nodes[n].f[f]
        ].centroid as any;
        var uv: Vector2 = this.calculateUVCoord(centroid);

        var height = Math.random();
        var normal = centroid.clone().normalize();

        tile.center.addInPlace(centroid.scale(1.0 / numFaces));
        if (this.renderDeformedMesh) {
          centroid = centroid.add(normal.scaleInPlace(height * 2));
        }

        var corner: PlanetCorner = {
          position: centroid,
          uv: uv
        };

        tile.corners.push(corner);

        positions[positionCount + 0] = centroid.x;
        positions[positionCount + 1] = centroid.y;
        positions[positionCount + 2] = centroid.z;
        positionCount += 3;

        if (this.renderDiffuseTexture) {
          uvs[uvsCount + 0] = corner.uv.x;
          uvs[uvsCount + 1] = 1 - corner.uv.y;
          uvsCount += 2;
        }
      }
      this.planet.tiles.push(tile);

      var center_uv: Vector2 = this.calculateUVCoord(tile.center);
      const color = new Color3(0, Math.random() * 0.5, Math.random() * 1);

      for (var f = 0; f < numFaces; f++) {
        colors[colorsCount + 0] = color.r;
        colors[colorsCount + 1] = color.g;
        colors[colorsCount + 2] = color.b;
        colors[colorsCount + 3] = 1.0;
        colorsCount += 4;
      }

      for (var i = relativeZeroIndex; i < positionCount / 3 - 2; i++) {
        this.planet.faceToTile[indicesCount / 3] = n;
        indices[indicesCount + 0] = relativeZeroIndex;
        indices[indicesCount + 1] = i + 1;
        indices[indicesCount + 2] = i + 2;
        indicesCount += 3;
      }

      //Fix Zipper for Legitimate Diffuse Texture
      for (var i = relativeZeroIndex; i < uvsCount / 2 - 2; i++) {
        var i1: number = relativeZeroIndex * 2;
        var i2: number = (i + 1) * 2;
        var i3: number = (i + 2) * 2;

        var A: Vector3 = new Vector3(uvs[i1], uvs[i1 + 1], 0);
        var BA: Vector3 = new Vector3(uvs[i2], uvs[i2 + 1], 0).subtract(A);
        var CA: Vector3 = new Vector3(uvs[i3], uvs[i3 + 1], 0).subtract(A);

        var cross: Vector3 = Vector3.Cross(BA, CA);
        if (cross.z < 0) {
          if (uvs[i1] < 0.25) uvs[i1] += 1;
          if (uvs[i2] < 0.25) uvs[i2] += 1;
          if (uvs[i3] < 0.25) uvs[i3] += 1;
        }
      }
    }

    return {
      indices: indicesSAB,
      positions: positionsSAB,
      colors: colorsSAB,
      uvs: uvsSAB,
    };
  }
}
