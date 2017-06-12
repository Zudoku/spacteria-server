const PF = require('pathfinding');

/*
 minroomheight
 maxroomheight
 minroomamount
 maxroomamount
 minroomdistance
 maxroomdistance
 width
 height
 tiles :
  floor
  wall
*/

module.exports = {
  map(data) {
    const constructableMask = new PF.Grid(data.width, data.height);
    const mapData = [data.width];

    for (let x = 0; x < data.width; x++) {
      mapData[x] = [data.heigth];
      for (let y = 0; y < data.height; y++) {
        mapData[x][y] = 1;
      }
    }
    module.exports.addStartZone(data, mapData, constructableMask);
    return mapData;
  },
  addStartZone(d, mapData, constructableMask) {
    const startZoneWidth = 5;
    const startZoneHeight = 5;
    const startZoneX = 3;
    const startZoneY = 3;
    module.exports.applyRoom(d, startZoneWidth, startZoneHeight, startZoneX, startZoneY, mapData, constructableMask);
  },
  applyRoom(d, zw, zh, zx, zy, mapData, constructableMask) {
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
        }
      }
    }
    // set floor tiles
    for (let x = 0; x < zw; x++) {
      for (let y = 0; y < zh; y++) {
        mapData[zx + x][zy + y] = d.tiles.floor;
      }
    }
  },
  doesRoomFit() {

  },
  applyPath() {

  },
  doesPathFit() {

  },
  addRoom(data, mapData, constructableMask, walls) {

  },
};
