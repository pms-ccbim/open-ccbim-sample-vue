// eslint-disable-next-line no-undef
onmessage = function (worker) {
  ComputeWireframe.vertices = [];
  ComputeWireframe.faces = [];
  ComputeWireframe.computeEdgesGeometry(worker.data);
};

var ComputeWireframe = {
  loadList: 0,
  vertices: [],
  faces: [],
  workID: undefined,
  computeEdgesGeometry(data) {
    let _this = this;
    for (let i = 0, j = 0; i < data.positions.length; i += 3, j += 2) {
      let v = new Vector3(
        data.positions[i],
        data.positions[i + 1],
        data.positions[i + 2],
      );
      v.setIndex(this.vertices.length);
      this.vertices.push(v);
    }
    function addFace(a, b, c) {
      let face = new Face3(a, b, c);
      _this.faces.push(face);
    }
    if (data.face) {
      for (let i = 0; i < data.face.length; i += 3) {
        addFace(data.face[i], data.face[i + 1], data.face[i + 2]);
      }
    } else {
      for (let i = 0; i < data.positions.length / 3; i += 3) {
        addFace(i, i + 1, i + 2);
      }
    }
    this.workID = data.workID;
    if (!data.isccy) {
      this.mergeVertices();
      this.computeFaceNormals();
      this.computeEdgesVertices();
    } else {
      this.computeCenterLineVertices(data);
    }
  },
  mergeVertices: function () {
    let verticesMap = {};
    let unique = [];
    let changes = [];

    let v, key;
    let precisionPoints = 4;
    let precision = Math.pow(10, precisionPoints);
    let i, il, face;
    let indices;

    for (i = 0, il = this.vertices.length; i < il; i++) {
      v = this.vertices[i];
      key =
        Math.round(v.x * precision) +
        '_' +
        Math.round(v.y * precision) +
        '_' +
        Math.round(v.z * precision);

      if (verticesMap[key] === undefined) {
        verticesMap[key] = i;
        unique.push(this.vertices[i]);
        changes[i] = unique.length - 1;
      } else {
        changes[i] = changes[verticesMap[key]];
      }
    }

    let faceIndicesToRemove = [];

    for (i = 0, il = this.faces.length; i < il; i++) {
      face = this.faces[i];

      face.a = changes[face.a];
      face.b = changes[face.b];
      face.c = changes[face.c];

      indices = [face.a, face.b, face.c];

      // if any duplicate vertices are found in a Face3
      // we have to remove the face as nothing can be saved
      for (let n = 0; n < 3; n++) {
        if (indices[n] === indices[(n + 1) % 3]) {
          faceIndicesToRemove.push(i);
          break;
        }
      }
    }

    for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
      let idx = faceIndicesToRemove[i];

      this.faces.splice(idx, 1);
    }

    let diff = this.vertices.length - unique.length;
    this.vertices = unique;
    return diff;
  },
  computeFaceNormals: function () {
    let cb = new Vector3();
    let ab = new Vector3();
    for (let f = 0, fl = this.faces.length; f < fl; f++) {
      let face = this.faces[f];
      let vA = this.vertices[face.a];
      let vB = this.vertices[face.b];
      let vC = this.vertices[face.c];
      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.crossVectors(cb, ab);
      cb.normalize();
      face.normal.copy(cb);
    }
  },
  computeEdgesVertices: function () {
    let indices = [];
    let thresholdDot = Math.cos((Math.PI / 180) * 30);
    let edge = [0, 0];
    let edges = {};
    let edge1;
    let edge2;
    let key;
    let keys = ['a', 'b', 'c'];
    for (let i = 0, l = this.faces.length; i < l; i++) {
      let face = this.faces[i];

      for (let j = 0; j < 3; j++) {
        edge1 = face[keys[j]];
        edge2 = face[keys[(j + 1) % 3]];
        edge[0] = Math.min(edge1, edge2);
        edge[1] = Math.max(edge1, edge2);

        key = edge[0] + ',' + edge[1];

        if (edges[key] === undefined) {
          edges[key] = {
            index1: edge[0],
            index2: edge[1],
            face1: i,
            face2: undefined,
          };
        } else {
          edges[key].face2 = i;
        }
      }
    }

    // generate vertices
    for (key in edges) {
      let e = edges[key];

      // an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
      if (
        e.face2 === undefined ||
        this.faces[e.face1].normal.dot(this.faces[e.face2].normal) <=
          thresholdDot
      ) {
        indices.push(this.vertices[e.index1].getIndex());
        indices.push(this.vertices[e.index2].getIndex());
      }
    }
    postMessage({
      workID: this.workID,
      indices: new Uint32Array(indices),
    });
  },
  computeCenterLineVertices: function (data) {
    let indices = [];

    for (let i = 1, l = data.face.length; i < l; i++) {
      let pi = data.face[i];
      let pi_before = data.face[i - 1];
      if (pi === 0xffffffff) {
        ++i;
        continue;
      }
      indices.push(pi);
      indices.push(pi_before);
    }

    postMessage({
      workID: this.workID,
      indices: new Uint32Array(indices),
    });
  },
};

function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;

  this.index = 0;
}
Object.assign(Vector3.prototype, {
  isVector3: true,

  setIndex: function (value) {
    this.index = value;
  },

  getIndex: function () {
    return this.index;
  },

  copy: function (v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  },

  clone: function () {
    return new this.constructor(this.x, this.y, this.z);
  },

  subVectors: function (a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  },

  crossVectors: function (a, b) {
    let ax = a.x;
    let ay = a.y;
    let az = a.z;
    let bx = b.x;
    let by = b.y;
    let bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  },

  normalize: function () {
    return this.divideScalar(this.length() || 1);
  },

  divideScalar: function (scalar) {
    return this.multiplyScalar(1 / scalar);
  },

  multiplyScalar: function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  },

  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  dot: function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
});

function Face3(a, b, c, normal) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.normal = normal && normal.isVector3 ? normal : new Vector3();
  this.vertexNormals = Array.isArray(normal) ? normal : [];
}
