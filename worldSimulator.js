let roomsRef;
const SAT = require('sat');
const tmxparser = require('tmx-parser');

let serverlogic;
const tilemaps = {};
const DELTA = 1000 / 60;

/*

var room = {
  name : "room" + currentRoomID,
  players : [],
  difficulty : 1,
  mapDescription : {
    filename : "temp.tmx",
    startX : 128,
    startY : 128
  },
  gameobjects : [], //Static objects that can't be
  enemies : [  ], //Enemies that can be harmed
  projectiles : [] //Projectiles
};

*/

module.exports = {
  init(filename) {
    tmxparser.parseFile(`maps/${filename}`, (err, map) => {
      const collisionMap = new Array(map.width);
      collisionMap.collision = (xPos, yPos) => collisionMap[xPos][yPos];
      if (err) {
        console.log(err);
      } else {
        const blocking = [1];
        for (let x = 0; x < map.width; x++) {
          collisionMap[x] = new Array(map.height);
          for (let y = 0; y < map.height; y++) {
            collisionMap[x][y] = blocking.indexOf(map.layers[0].tiles[(y * map.width) + x].id) !== -1;
          }
        }

        tilemaps[filename] = collisionMap;
      }
    });
  },
  initialize(serlogic) {
    serverlogic = serlogic;
  },
  simulate(rooms, ioref) {
    roomsRef = rooms;
    for (let index = 0; index < roomsRef.length; index++) {
      const simulatedRoom = roomsRef[index];

      module.exports.simulateRoom(simulatedRoom, ioref);
    }
  },
  simulateRoom(room, ioref) {
    // console.log("simulating room " + room);
    // Give projectiles momentum
    for (let i = 0; i < room.projectiles.length; i++) {
      const projectile = room.projectiles[i];

      const angleInRadians = (projectile.angle / 360) * (2 * Math.PI);
      const scaler = ((projectile.speed * DELTA) / 200);

      let deltaX = -Math.sin(angleInRadians);
      let deltaY = -Math.cos(angleInRadians);

      deltaX *= scaler;
      deltaY *= scaler;

      projectile.deltaX = deltaX;
      projectile.deltaY = deltaY;
      // console.log("simulating rojectile " + projectile.guid);
    }

    // Move projectiles
    for (let i = 0; i < room.projectiles.length; i++) {
      const projectile = room.projectiles[i];
      module.exports.defaultMove(projectile, room, 'projectile', ioref);
    }
  },

  defaultMove(target, room, type, ioref) {
    /* eslint no-param-reassign: "off"*/
    // console.log("moving projectile " + target.id);
    if (target.deltaX === 0 && target.deltaY === 0) {
      return;
    }

    const maxDelta = Math.max(Math.abs(target.deltaX), Math.abs(target.deltaY));
    let collidedX = false;
    let collidedY = false;

    for (let currentDelta = 0.0; currentDelta < maxDelta; currentDelta += 0.1) {
      // Move in X
      if (currentDelta < Math.abs(target.deltaX) && !collidedX) {
        const copiedShape = new SAT.Box(new SAT.Vector(target.shape.pos.x, target.shape.pos.y), target.shape.w, target.shape.h);
        copiedShape.pos.x += (target.deltaX > 0) ? 0.1 : -0.1;
        if (target.collideToTerrain) {
          if (!module.exports.collidesToTerrain(copiedShape.toPolygon(), room)) {
            target.x += ((target.deltaX > 0) ? 0.1 : -0.1);
            target.shape.pos = new SAT.Vector(target.x, target.y);
          } else {
            module.exports.objectCollidedWithTerrain(target, room, type, ioref);
            collidedX = true;
            // console.log(`projectile collided with terrain ${target.guid}`);
          }
        } else {
          target.x += ((target.deltaX > 0) ? 0.1 : -0.1);
          target.shape.pos = new SAT.Vector(target.x, target.y);
        }
      }
      // Move in Y
      if (currentDelta < Math.abs(target.deltaY) && !collidedY) {
        const copiedShape = new SAT.Box(new SAT.Vector(target.shape.pos.x, target.shape.pos.y), target.shape.w, target.shape.h);
        copiedShape.pos.y += (target.deltaY > 0) ? 0.1 : -0.1;
        if (target.collideToTerrain) {
          if (!module.exports.collidesToTerrain(copiedShape.toPolygon(), room)) {
            target.y += ((target.deltaY > 0) ? 0.1 : -0.1);
            target.shape.pos = new SAT.Vector(target.x, target.y);
          } else {
            module.exports.objectCollidedWithTerrain(target, room, type, ioref);
            collidedY = true;
            // console.log(`projectile collided with terrain ${target.guid}`);
          }
        } else {
          target.y += ((target.deltaY > 0) ? 0.1 : -0.1);
          target.shape.pos = new SAT.Vector(target.x, target.y);
        }
      }
    }

    target.deltaX = 0;
    target.deltaY = 0;
  },
  collidesToTerrain(shape, room) {
    for (let i = 0; i < shape.points.length; i++) {
      const vector = shape.points[i];


      const arrayPosX = Math.floor((shape.pos.x + vector.x) / 64);
      const arrayPosY = Math.floor((shape.pos.y + vector.y) / 64);
      // console.log(`Checking at: ${shape.pos.x + vector.x},${shape.pos.y + vector.y} (${arrayPosX},${arrayPosY})`);
      const collided = tilemaps[room.mapDescription.filename].collision(arrayPosX, arrayPosY);

      if (collided) {
        // console.log(`Collision at: ${shape.pos.x + vector.x},${shape.pos.y + vector.y} (${arrayPosX},${arrayPosY})`);
        return true;
      }
    }
    return false;
  },
  objectCollidedWithTerrain(target, room, type) {
    // console.log(`projectile collided with terrain ${target.guid}`);
    if (type === 'projectile') {
      // console.log(`projectile collided with terrain ${target.guid}`);
      // Remove bullet from server
      const index = room.projectiles.indexOf(target);
      if (index !== -1) {
        room.projectiles.splice(index, 1);
      }
      // Send remove event
      serverlogic.removeProjectile(target.guid, room);
    }
  },

};
