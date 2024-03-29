const tmxparser = require('tmx-parser');
const PF = require('pathfinding');
const util = require('util');

const tilemaps = {};
const tilemapTypes = { temp: { type: '1', width: 20, height: 20 } };
const blocking = [1, 2, 4, 6, 7, 8, 10, 11, 15, 16, 18];

const TMXPARSER_OFFSET = 1;

module.exports = {
  initializeMap(filename, cb) {
    tmxparser.parseFile(`maps/${filename}.tmx`, (err, map) => {
      if (err || map === null || map === undefined) {
        const mapString = util.inspect(map, { depth: null });
        console.log(`[IO]: ERROR, error ar reading tilemap file: ${err} | ${mapString}`);
        cb(false);
        return false;
      }
      const collisionMap = new PF.Grid(map.width, map.height);


      console.log(`[COLLISION]: Initializing collision for map: ${filename}`);
      tilemapTypes[filename] = { type: map.layers[0].name, width: map.width, height: map.height };
      for (let x = 0; x < map.width; x++) {
        // collisionMap[x] = new Array(map.height);
        for (let y = 0; y < map.height; y++) {
          const blockingTile = blocking.indexOf(map.layers[0].tiles[(y * map.width) + x].id + TMXPARSER_OFFSET) !== -1;
          collisionMap.setWalkableAt(x, y, blockingTile);
          tilemaps[filename] = collisionMap;
        }
      }

      cb(true);
    });
  },
  collidesToTerrain(shape, room) {
    if (tilemaps[room.mapDescription.filename] === undefined) {
      return true;
    }
    for (let i = 0; i < shape.points.length; i++) {
      const vector = shape.points[i];


      const arrayPosX = Math.floor((shape.pos.x + vector.x) / 64);
      const arrayPosY = Math.floor((shape.pos.y + vector.y) / 64);
      const collided = tilemaps[room.mapDescription.filename].isWalkableAt(arrayPosX, arrayPosY);

      if (collided) {
        return true;
      }
    }
    return false;
  },
  isBlocked(x, y, room) {
    if (tilemaps[room.mapDescription.filename] === undefined) {
      return true;
    }
    return (tilemaps[room.mapDescription.filename].isWalkableAt(x, y));
  },
  isInsideRoom(x, y, room) {
    if (tilemaps[room.mapDescription.filename] === undefined) {
      return false;
    }
    return (tilemaps[room.mapDescription.filename].isInside(x, y));
  },
  getMapCloneForPF(room) {
    const result = tilemaps[room.mapDescription.filename].clone();

    for (let y = 0; y < result.height; y++) {
      for (let x = 0; x < result.width; x++) {
        const tileIsBlocking = result.isWalkableAt(x, y);
        result.setWalkableAt(x, y, !tileIsBlocking);
      }
    }

    return result;
  },
  getTypes(tilemapname) {
    return tilemapTypes[tilemapname];
  },
};
