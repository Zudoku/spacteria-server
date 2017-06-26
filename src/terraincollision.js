const tmxparser = require('tmx-parser');
const PF = require('pathfinding');

const tilemaps = {};
const tilemapTypes = { 'temp' : { type:'1', width: 20, height: 20} };

module.exports = {
  initializeMap(filename, cb) {
    tmxparser.parseFile(`maps/${filename}.tmx`, (err, map) => {
      const collisionMap = new PF.Grid(map.width, map.height);
      if (err) {
        console.log(err);
        console.log('error');
        cb(false);
      }
      const blocking = [1];
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
    return tilemaps[room.mapDescription.filename].isWalkableAt(x, y);
  },
  getMapClone(room) {
    // let returned = tilemaps[room.mapDescription.filename];
    // tilemaps[room.mapDescription.filename] = returned.clone();
    // console.log(tilemaps[room.mapDescription.filename]);
    // return returned;

    const mapProperties = tilemapTypes[room.mapDescription.filename];
    const matrix = new Array(mapProperties.width);
    for (let x = 0; x < mapProperties.width; x++) {
      matrix[x] = new Array(mapProperties.height);
      for (let y = 0; y < mapProperties.height; y++) {
        matrix[x][y] = (tilemaps[room.mapDescription.filename].isWalkableAt(x, y) === true) ? 1 : 0;
      }
    }
    return matrix;
  },
  getTypes(tilemapname) {
    return tilemapTypes[tilemapname];
  },
};
