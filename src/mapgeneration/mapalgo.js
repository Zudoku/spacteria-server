const PF = require('pathfinding');
const SF = require('./../staticFuncs.js');

const FIND_PATH_MAX_TRIES = 20;
const PLACE_ROOM_MAX_TRIES = 10;
const terrainCollision = require('./../terraincollision.js');
/*
 minroomheight
 maxroomheight
 minroomwidth
 maxroomwidth
 minroomamount
 maxroomamount
 minroomdistance
 maxroomdistance
 minbranch
 maxbranch
 width
 height
 tiles :
  floor
  wall
  path
  empty
*/

module.exports = {
  map(data) {
    const constructableMask = new PF.Grid(data.width, data.height);
    const mapData = [data.width];
    const roomWalls = {
      north: [],
      south: [],
      west: [],
      east: [],
    };
    const roomData = [];

    for (let x = 0; x < data.width; x++) {
      mapData[x] = [data.heigth];
      for (let y = 0; y < data.height; y++) {
        mapData[x][y] = data.tiles.empty[SF.getRandomIntInclusive(0, data.tiles.empty.length - 1)];
      }
    }
    module.exports.addStartZone(data, mapData, constructableMask, roomWalls);

    const roomAmount = SF.getRandomIntInclusive(data.minroomamount, data.maxroomamount);

    for (let t = 0; t < roomAmount; t++) {
      module.exports.tryToaddRoom(data, mapData, constructableMask, roomWalls, roomData);
    }

    for (let y = 0; y < data.height; y++) {
      let row = '';
      for (let x = 0; x < data.width; x++) {
        row += (` ${mapData[x][y]}`);
      }
      console.log(row);
    }

    const resultObj = {
      map: mapData,
      rooms: roomData,
    };

    return resultObj;
  },
  addStartZone(d, mapData, constructableMask, roomWalls) {
    const startZoneWidth = 3;
    const startZoneHeight = 5;
    const startZoneX = 3;
    const startZoneY = 3;
    module.exports.applyRoom(d, startZoneHeight, startZoneWidth, startZoneX, startZoneY, mapData, constructableMask, roomWalls);
  },
  applyRoom(d, zw, zh, zx, zy, mapData, constructableMask, roomWalls, path) {
    // Empty walls
    roomWalls.north = [];
    roomWalls.south = [];
    roomWalls.west = [];
    roomWalls.east = [];

    // set floor mask
    for (let y = 0; y < zh; y++) {
      for (let x = 0; x < zw; x++) {
        constructableMask.setWalkableAt(zx + x, zy + y, false);
      }
    }
    const wallTile = d.tiles.wall[SF.getRandomIntInclusive(0, d.tiles.wall.length - 1)];

    // Set walls
    for (let y = 0; y < zh + 2; y++) {
      for (let x = 0; x < zw + 2; x++) {
        const ix = x - 1;
        const iy = y - 1;
        if (constructableMask.isInside(zx + ix, zy + iy) && constructableMask.isWalkableAt(zx + ix, zy + iy)) {
          mapData[zx + ix][zy + iy] = wallTile;
          const wallObj = { x: (zx + ix), y: (zy + iy) };
          if (x === 0 && y > 0 && y < zh + 1) {
            roomWalls.west.push(wallObj);
          }
          if (x === zw + 1 && y > 0 && y < zh + 1) {
            roomWalls.east.push(wallObj);
          }
          if (y === 0 && x > 0 && x < zw + 1) {
            roomWalls.north.push(wallObj);
          }
          if (y === zh + 1 && x > 0 && x < zw + 1) {
            roomWalls.south.push(wallObj);
          }
        }
      }
    }

    const floorTile = d.tiles.floor[SF.getRandomIntInclusive(0, d.tiles.floor.length - 1)];

    // set floor tiles
    for (let y = 0; y < zh; y++) {
      for (let x = 0; x < zw; x++) {
        mapData[zx + x][zy + y] = floorTile;
      }
    }
    if (path !== undefined) {
      module.exports.applyPath(d, path, constructableMask, mapData);
    }
    console.log('Room applied');
  },
  doesRoomFit(d, zw, zh, zx, zy, constructableMask, roomWalls, resultObject) {
    let result = true;
    const constructableMaskCopy = constructableMask.clone();
    // test floor mask
    for (let y = 0; y < zh; y++) {
      for (let x = 0; x < zw; x++) {
        if (!constructableMask.isInside(zx + x, zy + y) || !constructableMask.isWalkableAt(zx + x, zy + y)) {
          result = false;
          // console.log(`room collision at: ${zx + x} , ${zy + y}`);
          break;
        } else {
          // Get new constructablemask copied with new room already put in it,
          // so we can find path
          constructableMaskCopy.setWalkableAt(zx + x, zy + y, false);
        }
      }
    }

    if (result) {
      // Try to connect room to previous
      // console.log('room fits.');
      // Get new room walls
      const newRoomWalls = {
        north: [],
        south: [],
        west: [],
        east: [],
      };
      for (let y = 0; y < zh + 2; y++) {
        for (let x = 0; x < zw + 2; x++) {
          const ix = x - 1;
          const iy = y - 1;
          const wallObj = { x: (zx + ix), y: (zy + iy) };
          if (x === 0 && y > 0 && y < zh + 1) {
            newRoomWalls.west.push(wallObj);
          }
          if (x === zw + 1 && y > 0 && y < zh + 1) {
            newRoomWalls.east.push(wallObj);
          }
          if (y === 0 && x > 0 && x < zw + 1) {
            newRoomWalls.north.push(wallObj);
          }
          if (y === zh + 1 && x > 0 && x < zw + 1) {
            newRoomWalls.south.push(wallObj);
          }
        }
      }
      if (!module.exports.findPathIfPossible(roomWalls, newRoomWalls, constructableMaskCopy, resultObject)) {
        result = false;
      }
    }
    return result;
  },
  applyPath(d, path, constructableMask, mapData) {
    const pathTile = d.tiles.path[SF.getRandomIntInclusive(0, d.tiles.path.length - 1)];

    for (let p = 0; p < path.length; p++) {
      const tileArr = path[p];
      mapData[tileArr[0]][tileArr[1]] = pathTile;
      constructableMask.setWalkableAt(tileArr[0], tileArr[1], false);
    }
    console.log('path applied');
  },
  findPathIfPossible(oldWalls, newWalls, constructableMaskCopy, resultObject) {
    const finder = new PF.AStarFinder();
    for (let o = 0; o < FIND_PATH_MAX_TRIES; o++) {
      const directionObj = { 0: 'north', 1: 'south', 2: 'west', 3: 'east' };
      const startPosPossiblities = oldWalls[directionObj[SF.getRandomIntInclusive(0, 3)]];
      const startPos = startPosPossiblities[SF.getRandomIntInclusive(0, startPosPossiblities.length - 1)];

      const endPosPossiblities = newWalls[directionObj[SF.getRandomIntInclusive(0, 3)].toString()];
      const endPos = endPosPossiblities[SF.getRandomIntInclusive(0, endPosPossiblities.length - 1)];
      if (endPos === undefined || startPos === undefined) {
        continue;
      }
      const pfGrid = constructableMaskCopy.clone();
      try {
        const path = finder.findPath(startPos.x, startPos.y, endPos.x, endPos.y, pfGrid);

        if (path.length === 0) {
          continue;
        } else {
          resultObject.path = PF.Util.expandPath(path);
          //  console.log(`path found between ${startPos.x},${startPos.y} and ${endPos.x},${endPos.y}`);
          return true;
        }
      } catch (ex) {
        console.log('fail at pathfiding..');
        continue;
      }
    }
    return false;
  },
  tryToaddRoom(data, mapData, constructableMask, walls, roomData) {
    for (let t = 0; t < PLACE_ROOM_MAX_TRIES; t++) {
      let wallReference;
      const direction = SF.getRandomIntInclusive(0, 3);
      let deltaX = 0;
      let deltaY = 0;
      switch (direction) {
        case 0:
          wallReference = walls.north[SF.getRandomIntInclusive(0, walls.north.length - 1)];
          deltaY = 0 - SF.getRandomIntInclusive(data.minroomdistance, data.maxroomdistance);
          break;

        case 1:
          wallReference = walls.south[SF.getRandomIntInclusive(0, walls.south.length - 1)];
          deltaY = SF.getRandomIntInclusive(data.minroomdistance, data.maxroomdistance);

          break;

        case 2:
          wallReference = walls.west[SF.getRandomIntInclusive(0, walls.west.length - 1)];
          deltaX = 0 - SF.getRandomIntInclusive(data.minroomdistance, data.maxroomdistance);

          break;

        case 3:
          wallReference = walls.east[SF.getRandomIntInclusive(0, walls.east.length - 1)];
          deltaX = SF.getRandomIntInclusive(data.minroomdistance, data.maxroomdistance);
          break;
      }
      if (wallReference === undefined) {
        continue;
      }
      const roomStartX = wallReference.x + deltaX;
      const roomStartY = wallReference.y + deltaY;
      const roomW = SF.getRandomIntInclusive(data.minroomwidth, data.maxroomwidth);
      const roomH = SF.getRandomIntInclusive(data.minroomheight, data.maxroomheight);
      const resultObject = {};
      // WTF
      // for some reason, X and Y change places, and width and height has changed places.
      // Tried to debug it but accepting defeat for now and just switching the positions of the arguments in function call
      // TODO fix this bs
      if (module.exports.doesRoomFit(data, roomH, roomW, roomStartY, roomStartX, constructableMask, walls, resultObject)) {
        console.log(`Room fits: ${roomStartX} , ${roomStartY} - ${direction}`);
        module.exports.applyRoom(data, roomH, roomW, roomStartY, roomStartX, mapData, constructableMask, walls, resultObject.path);
        const roomObj = {
          x: roomStartX,
          y: roomStartY,
          w: roomW,
          h: roomH,
        };
        roomData.push(roomObj);
        break;
      }
    }
  },
};
