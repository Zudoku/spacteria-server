const tmxparser = require('tmx-parser');
const PF = require('pathfinding');

const tilemaps = {};

module.exports = {
  initializeMap(filename) {
    tmxparser.parseFile(`maps/${filename}`, (err, map) => {
      const collisionMap = new PF.Grid(map.width, map.height);
      if (err) {
        console.log(err);
        console.log('error');
        return false;
      }
      const blocking = [1];
      for (let x = 0; x < map.width; x++) {
        collisionMap[x] = new Array(map.height);
        for (let y = 0; y < map.height; y++) {
          const blockingTile = blocking.indexOf(map.layers[0].tiles[(y * map.width) + x].id) !== -1;
          collisionMap.setWalkableAt(x, y, blockingTile);
        }
      }
      tilemaps[filename] = collisionMap;
      return true;
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
    return tilemaps[room.mapDescription.filename].isWalkableAt(x, y);
  },
};
