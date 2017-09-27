const tmxparser = require('tmx-parser');
const PF = require('pathfinding');

const tilemaps = {};
const tilemapTypes = { temp: { type: '1', width: 20, height: 20 } };
const blocking = [0, 1, 3, 7, 9];

module.exports = {
  initializeMap(filename, cb) {
    tmxparser.parseFile(`maps/${filename}.tmx`, (err, map) => {
      if (err) {
        console.log(err);
        console.log('error ar reading file');
        cb(false);
        return false;
      }
      if (map === null || map === undefined) {
        console.log(require('util').inspect(map, { depth: null }));
        console.log('error!!!!');
        cb(false);
        return false;
      }
      const collisionMap = new PF.Grid(map.width, map.height);


      console.log(`initializing collision for map: ${filename}`);
      tilemapTypes[filename] = { type: map.layers[0].name, width: map.width, height: map.height };
      for (let x = 0; x < map.width; x++) {
        // collisionMap[x] = new Array(map.height);
        for (let y = 0; y < map.height; y++) {
          const blockingTile = blocking.indexOf(map.layers[0].tiles[(y * map.width) + x].id) !== -1;
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
        const blocking = result.isWalkableAt(x, y);
        result.setWalkableAt(x, y, !blocking);
      }
    }

    return result;
  },
  getTypes(tilemapname) {
    return tilemapTypes[tilemapname];
  },
};
