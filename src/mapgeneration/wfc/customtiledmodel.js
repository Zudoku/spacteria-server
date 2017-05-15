

const Model = require('./model');

/**
 *
 * @param {object} data Tiles, subset and constraints definitions
 * @param {string} subsetName Name of the subset to use from the data, use all tiles if falsy
 * @param {int} width The width of the generation
 * @param {int} height The height of the generation
 * @param {bool} periodic Whether the source image is to be considered as periodic / as a repeatable texture
 * @constructor
 */
const CustomTiledModel = function CustomTiledModel(data, subsetName, width, height, periodic) {
  let unique = !!data.unique,
    subset = null,
    tilesize = data.tilesize || 16,
    action = [],
    firstOccurrence = {},
    currentTile,
    cardinality = 4,
    funcA,
    funcB,
    x,
    y,
    t,
    t2,
    i;

  let neighbor,
    left,
    right,
    L,
    R,
    D,
    U;

  this.FMX = width;
  this.FMY = height;
  this.periodic = !!periodic;
  this.tilesize = tilesize;

  this.tiles = [];
  this.stationary = [];

  if (subsetName && data.subsets && !!data.subsets[subsetName]) {
    subset = data.subsets[subsetName];
  }


  const rotate = function rotate(array) {
    return array;
  };

  for (i = 0; i < data.tiles.length; i++) {
    currentTile = data.tiles[i];

    if (subset !== null && subset.indexOf(currentTile.name) === -1) {
      continue;
    }

    switch (currentTile.symmetry) {
      case 'L':
        cardinality = 4;
        funcA = function (i) {
          return (i + 1) % 4;
        };
        funcB = function (i) {
          return i % 2 == 0 ? i + 1 : i - 1;
        };
        break;
      case 'T':
        cardinality = 4;
        funcA = function (i) {
          return (i + 1) % 4;
        };
        funcB = function (i) {
          return i % 2 == 0 ? i : 4 - i;
        };
        break;
      case 'I':
        cardinality = 2;
        funcA = function (i) {
          return 1 - i;
        };
        funcB = function (i) {
          return i;
        };
        break;
      case '\\':
        cardinality = 2;
        funcA = function (i) {
          return 1 - i;
        };
        funcB = function (i) {
          return 1 - i;
        };
        break;
      case 'X':
      default:
        cardinality = 1;
        funcA = function (i) {
          return i;
        };
        funcB = function (i) {
          return i;
        };
        break;
    }

    this.T = action.length;
    firstOccurrence[currentTile.name] = this.T;

    for (t = 0; t < cardinality; t++) {
      action.push([
        this.T + t,
        this.T + funcA(t),
        this.T + funcA(funcA(t)),
        this.T + funcA(funcA(funcA(t))),
        this.T + funcB(t),
        this.T + funcB(funcA(t)),
        this.T + funcB(funcA(funcA(t))),
        this.T + funcB(funcA(funcA(funcA(t)))),
      ]);
    }

    if (unique) {
      for (t = 0; t < cardinality; t++) {
        this.tiles.push({ name: currentTile.name, index: i });
      }
    } else {
      this.tiles.push({ name: currentTile.name, index: i });

      for (t = 1; t < cardinality; t++) {
        this.tiles.push(rotate(this.tiles[this.T + t - 1]));
      }
    }

    for (t = 0; t < cardinality; t++) {
      this.stationary.push(currentTile.weight || 1);
    }
  }

  this.T = action.length;

  this.propagator = new Array(4);

  for (i = 0; i < 4; i++) {
    this.propagator[i] = new Array(this.T);
    for (t = 0; t < this.T; t++) {
      this.propagator[i][t] = new Array(this.T);
      for (t2 = 0; t2 < this.T; t2++) {
        this.propagator[i][t][t2] = false;
      }
    }
  }

  this.wave = new Array(this.FMX);
  this.changes = new Array(this.FMX);
  for (x = 0; x < this.FMX; x++) {
    this.wave[x] = new Array(this.FMY);
    this.changes[x] = new Array(this.FMY);

    for (y = 0; y < this.FMY; y++) {
      this.wave[x][y] = new Array(this.T);
    }
  }

  for (i = 0; i < data.neighbors.length; i++) {
    neighbor = data.neighbors[i];

    left = neighbor.left.split(' ').filter((v) => {
      return v.length;
    });
    right = neighbor.right.split(' ').filter((v) => {
      return v.length;
    });

    if (subset !== null && (subset.indexOf(left[0]) === -1 || subset.indexOf(right[0]) === -1)) {
      continue;
    }

    L = action[firstOccurrence[left[0]]][left.length == 1 ? 0 : parseInt(left[1], 10)];
    D = action[L][1];
    R = action[firstOccurrence[right[0]]][right.length == 1 ? 0 : parseInt(right[1], 10)];
    U = action[R][1];

    this.propagator[0][R][L] = true;
    this.propagator[0][action[R][6]][action[L][6]] = true;
    this.propagator[0][action[L][4]][action[R][4]] = true;
    this.propagator[0][action[L][2]][action[R][2]] = true;

    this.propagator[1][U][D] = true;
    this.propagator[1][action[D][6]][action[U][6]] = true;
    this.propagator[1][action[U][4]][action[D][4]] = true;
    this.propagator[1][action[D][2]][action[U][2]] = true;
  }

  for (t = 0; t < this.T; t++) {
    for (t2 = 0; t2 < this.T; t2++) {
      this.propagator[2][t][t2] = this.propagator[0][t2][t];
      this.propagator[3][t][t2] = this.propagator[1][t2][t];
    }
  }
};

CustomTiledModel.prototype = Object.create(Model.prototype);
CustomTiledModel.prototype.constructor = CustomTiledModel;

CustomTiledModel.prototype.propagator = null;

CustomTiledModel.prototype.tiles = null;
CustomTiledModel.prototype.tilesize = 0;

/**
 * @protected
 * @returns {boolean}
 */
CustomTiledModel.prototype.propagate = function () {
  let change = false,
    wave1,
    wave2,
    prop,
    b,
    x1,
    y1,
    x2,
    y2,
    d,
    t2,
    t1;

  for (x2 = 0; x2 < this.FMX; x2++) {
    for (y2 = 0; y2 < this.FMY; y2++) {
      for (d = 0; d < 4; d++) {
        x1 = x2;
        y1 = y2;

        if (d === 0) {
          if (x2 === 0) {
            if (!this.periodic) {
              continue;
            } else {
              x1 = this.FMX - 1;
            }
          } else {
            x1 = x2 - 1;
          }
        } else if (d === 1) {
          if (y2 === this.FMY - 1) {
            if (!this.periodic) {
              continue;
            } else {
              y1 = 0;
            }
          } else {
            y1 = y2 + 1;
          }
        } else if (d === 2) {
          if (x2 === this.FMX - 1) {
            if (!this.periodic) {
              continue;
            } else {
              x1 = 0;
            }
          } else {
            x1 = x2 + 1;
          }
        } else {
          if (y2 === 0) {
            if (!this.periodic) {
              continue;
            } else {
              y1 = this.FMY - 1;
            }
          } else {
            y1 = y2 - 1;
          }
        }

        if (!this.changes[x1][y1]) {
          continue;
        }

        wave1 = this.wave[x1][y1];
        wave2 = this.wave[x2][y2];

        for (t2 = 0; t2 < this.T; t2++) {
          if (wave2[t2]) {
            prop = this.propagator[d][t2];
            b = false;

            for (t1 = 0; t1 < this.T && !b; t1++) {
              if (wave1[t1]) {
                b = prop[t1];
              }
            }

            if (!b) {
              wave2[t2] = false;
              this.changes[x2][y2] = true;
              change = true;
            }
          }
        }
      }
    }
  }

  return change;
};

/**
 * @param {int} x
 * @param {int} y
 * @protected
 * @returns {boolean}
 */
CustomTiledModel.prototype.onBoundary = function (x, y) {
  return false;
};

CustomTiledModel.prototype.retrieveData = function (array) {
  let wave,
    pixelIndex,
    color,
    x,
    y,
    xt,
    yt,
    t;

  for (x = 0; x < this.FMX; x++) {
    for (y = 0; y < this.FMY; y++) {
      wave = this.wave[x][y];
      for (t = 0; t < this.T; t++) {
        if (this.wave[x][y][t]) {
          tile = this.tiles[t];
          array[x][y] = tile.index;
          break;
        }
      }
    }
  }
};

module.exports = CustomTiledModel;
