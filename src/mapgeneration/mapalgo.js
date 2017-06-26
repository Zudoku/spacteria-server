const PF = require('pathfinding');
const SF = require('./../staticFuncs.js');
const FIND_PATH_MAX_TRIES = 1000;
const PLACE_ROOM_MAX_TRIES = 1000;
const terrainCollision = require('./../terraincollision.js')
/*
 minroomheight
 maxroomheight
 minroomwidth
 maxroomwidth
 minroomamount
 maxroomamount
 minroomdistance
 maxroomdistance
 width
 height
 tiles :
  floor
  wall
  path
*/

module.exports = {
  map(data) {
    const constructableMask = new PF.Grid(data.width, data.height);
    const mapData = [data.width];
    const roomWalls = {
      north: [],
      south: [],
      west: [],
      east: []
    };

    for (let x = 0; x < data.width; x++) {
      mapData[x] = [data.heigth];
      for (let y = 0; y < data.height; y++) {
        mapData[x][y] = 1;
      }
    }
    module.exports.addStartZone(data, mapData, constructableMask, roomWalls);

    const roomAmount = SF.getRandomIntInclusive(data.minroomamount, data.maxroomamount);

    for(let t = 0; t < roomAmount; t++) {
      module.exports.tryToaddRoom(data, mapData, constructableMask, roomWalls);
    }

    for (let x = 0; x < data.width; x++) {
      let row = '';
      for (let y = 0; y < data.height; y++) {
        row += (' ' + mapData[x][y]);
      }
      console.log(row);
    }

    return mapData;
  },
  addStartZone(d, mapData, constructableMask, roomWalls) {
    const startZoneWidth = 5;
    const startZoneHeight = 5;
    const startZoneX = 3;
    const startZoneY = 3;
    module.exports.applyRoom(d, startZoneWidth, startZoneHeight, startZoneX, startZoneY, mapData, constructableMask, roomWalls);
  },
  applyRoom(d, zw, zh, zx, zy, mapData, constructableMask, roomWalls, path) {

    // Empty walls
    roomWalls.north = [];
    roomWalls.south = [];
    roomWalls.west = [];
    roomWalls.east = [];

    // set floor mask
    for (let x = 0; x < zw; x++) {
      for (let y = 0; y < zh; y++) {
        constructableMask.setWalkableAt(zx + x, zy + y, false);
      }
    }

    // Set walls
    for (let x = 0; x < zw + 2; x++) {
      for (let y = 0; y < zh + 2; y++) {
        const ix = x - 1;
        const iy = y - 1;
        if (constructableMask.isInside(zx + ix, zy + iy) && constructableMask.isWalkableAt(zx + ix, zy + iy)) {
          mapData[zx + ix][zy + iy] = d.tiles.wall;
          let wallObj = { x: (zx + ix), y: (zy + iy) };
          if(x == 0 && y > 0 && y < zh + 1){
            roomWalls.west.push(wallObj);
          }
          if(x == zw + 1 && y > 0 && y < zh + 1){
            roomWalls.east.push(wallObj);
          }
          if(y == 0 && x > 0 && x < zw + 1){
            roomWalls.north.push(wallObj);
          }
          if(y == zh + 1 && x > 0 && x < zw + 1){
            roomWalls.south.push(wallObj);
          }
        }
      }
    }
    // set floor tiles
    for (let x = 0; x < zw; x++) {
      for (let y = 0; y < zh; y++) {
        mapData[zx + x][zy + y] = d.tiles.floor;
      }
    }
    if(path !== undefined) {
      module.exports.applyPath(d, path, constructableMask, mapData);
    }
    console.log('Room applied');
  },
  doesRoomFit(d, zw, zh, zx, zy, constructableMask, roomWalls, resultObject) {
    let result = true;
    let constructableMaskCopy = constructableMask.clone();
    // test floor mask
    for (let x = 0; x < zw; x++) {
      for (let y = 0; y < zh; y++) {
        if(!constructableMask.isInside(zx + x, zy + y) || !constructableMask.isWalkableAt(zx + x, zy + y)){
          result = false;
          console.log('room collision at: '  + (zx + x) + ' , ' + (zy + y) );
          break;
        } else {
          // Get new constructablemask copied with new room already put in it,
          // so we can find path
          constructableMaskCopy.setWalkableAt(zx + x, zy + y, false);
        }
      }
    }

    if(result){
      //Try to connect room to previous
      console.log('room fits.');
      //Get new room walls
      const newRoomWalls = {
        north: [],
        south: [],
        west: [],
        east: []
      };
      for (let x = 0; x < zw + 2; x++) {
        for (let y = 0; y < zh + 2; y++) {
          const ix = x - 1;
          const iy = y - 1;
          let wallObj = { x: (zx + ix), y: (zy + iy) };
          if(x == 0 && y > 0 && y < zh + 1){
            newRoomWalls.west.push(wallObj);
          }
          if(x == zw + 1 && y > 0 && y < zh + 1){
            newRoomWalls.east.push(wallObj);
          }
          if(y == 0 && x > 0 && x < zw + 1){
            newRoomWalls.north.push(wallObj);
          }
          if(y == zh + 1 && x > 0 && x < zw + 1){
            newRoomWalls.south.push(wallObj);
          }
        }
      }
      if(!module.exports.findPathIfPossible(roomWalls, newRoomWalls, constructableMaskCopy, resultObject)) {
        result = false;
      }
    }
    return result;
  },
  applyPath(d, path, constructableMask, mapData) {
    for(let p = 0; p < path.length; p++){
      const tileArr = path[p];
      mapData[tileArr[0]][tileArr[1]] = d.tiles.path;
      constructableMask.setWalkableAt(tileArr[0], tileArr[1], false);
    }
    console.log('path applied');
  },
  findPathIfPossible(oldWalls, newWalls, constructableMaskCopy, resultObject) {
    const finder = new PF.AStarFinder();
    for(let o = 0; o < FIND_PATH_MAX_TRIES; o++) {
      const directionObj = { '0': 'north', '1': 'south', '2': 'west', '3': 'east' };
      const startPosPossiblities = oldWalls[directionObj[SF.getRandomIntInclusive(0,3)]];
      const startPos = startPosPossiblities[SF.getRandomIntInclusive(0,startPosPossiblities.length - 1)];

      const endPosPossiblities = newWalls[directionObj[SF.getRandomIntInclusive(0,3)].toString()];
      const endPos = endPosPossiblities[SF.getRandomIntInclusive(0,endPosPossiblities.length - 1)];
      if(endPos === undefined || startPos === undefined) {
        continue;
      }
      let pfGrid = constructableMaskCopy.clone();
      const path = finder.findPath(startPos.x, startPos.y, endPos.x, endPos.y, pfGrid);

      if( path.length === 0 ) {
        continue;
      } else {
        resultObject.path = PF.Util.expandPath(path);
        console.log('path found between ' + startPos + ' and ' + endPos);
        console.log(resultObject.path);
        return true;
      }


    }
    return false;
  },
  tryToaddRoom(data, mapData, constructableMask, walls) {
    for(let t = 0; t < PLACE_ROOM_MAX_TRIES; t++) {
      let wallReference = undefined;
      const direction = SF.getRandomIntInclusive(0,3);
      console.log(direction);
      let deltaX = 0;
      let deltaY = 0;
      switch(direction) {
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
      if(wallReference === undefined) {
        continue;
      }
      const roomStartX = wallReference.x + deltaX;
      const roomStartY = wallReference.y + deltaY;
      const roomW = SF.getRandomIntInclusive(data.minroomwidth, data.maxroomwidth);
      const roomH = SF.getRandomIntInclusive(data.minroomheight, data.maxroomheight);
      const resultObject = {};
      if(module.exports.doesRoomFit(data, roomW, roomH, roomStartX, roomStartY, constructableMask, walls, resultObject)) {
        console.log('Room fits: ' + roomStartX + ' , ' + roomStartY + ' - ' + direction);
        module.exports.applyRoom(data, roomW, roomH, roomStartX, roomStartY, mapData, constructableMask, walls, resultObject.path);
        break;
      }
    }
  },
};
