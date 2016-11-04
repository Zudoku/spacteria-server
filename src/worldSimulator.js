let roomsRef;

const SAT = require('sat');
const enemies = require('./enemies.js');
const enemySimulator = require('./enemySimulator.js');
const terrainCollision = require('./terraincollision.js');

let serverlogic;
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
  init(filename, room) {
    const result = terrainCollision.initializeMap(filename);
    if (result) {
      console.log('works');
    }
    // INIT MONSTERS
    const dummy = enemies.getMonster('dummy_small', room.difficulty, 3 * 126, 124);
    const smallGuy = enemies.getMonster('small_guy', room.difficulty, 126, 3 * 124);
    room.enemies.push(dummy);
    room.enemies.push(smallGuy);
    serverlogic.updateroomdescription(room);
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
    // Give projectiles momentum
    for (let i = 0; i < room.projectiles.length; i++) {
      const projectile = room.projectiles[i];
      module.exports.giveMomentum(projectile, projectile.angle, projectile.speed);
    }

    // Move projectiles
    for (let i = 0; i < room.projectiles.length; i++) {
      const projectile = room.projectiles[i];
      module.exports.defaultMove(projectile, room, 'projectile', ioref);
    }
    // Simulate enemies
    for (let i = 0; i < room.enemies.length; i++) {
      const enemy = room.enemies[i];
      // Set move target, shoot at players, look for target here
      enemySimulator.simulate(enemy, room);
      // If we need to move, move
      if (enemy.moveTarget !== undefined) {
        // Give momentum
        let angle = module.exports.angleBetweenTwoPoints(enemy.shape.pos, enemy.moveTarget);
        angle %= 360;
        // console.log(`${enemy.moveTarget.x},${enemy.moveTarget.y}-${enemy.shape.pos.x},${enemy.shape.pos.y}-${angle}`);
        module.exports.giveMomentum(enemy, angle, enemy.stats.speed);
        // console.log(`${enemy.deltaX},${enemy.deltaY}`);
        // Move enemies
        module.exports.defaultMove(enemy, room, 'enemy');
        // Test if we should broadcast new position
        module.exports.checkIfBroadcastNPC(enemy, room);
      }
    }
  },
  giveMomentum(target, angle, speed) {
    const angleInRadians = (angle / 360) * (2 * Math.PI);
    const scaler = ((speed * DELTA) / 200);

    let deltaX = -Math.sin(angleInRadians);
    let deltaY = -Math.cos(angleInRadians);

    deltaX *= scaler;
    deltaY *= scaler;

    target.deltaX = deltaX;
    target.deltaY = deltaY;
  },
  defaultMove(target, room, type) {
    /* eslint no-param-reassign: "off"*/
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
          if (!terrainCollision.collidesToTerrain(copiedShape.toPolygon(), room)) {
            target.x += ((target.deltaX > 0) ? 0.1 : -0.1);
            target.shape.pos = new SAT.Vector(target.x, target.y);
            if (type === 'projectile') {
              target.travelDistance += 0.1;
              if (target.travelDistance > target.maxTravelDistance) {
                module.exports.removeBulletFromGame(target, room);
                return;
              }
              if (module.exports.projectileCollidesToObjects(target, room)) {
                module.exports.removeBulletFromGame(target, room);
                return;
              }
            }
          } else {
            module.exports.objectCollidedWithTerrain(target, room, type);
            collidedX = true;
          }
        } else {
          target.x += ((target.deltaX > 0) ? 0.1 : -0.1);
          target.shape.pos = new SAT.Vector(target.x, target.y);
          if (type === 'projectile') {
            target.travelDistance += 0.1;
            if (target.travelDistance > target.maxTravelDistance) {
              module.exports.removeBulletFromGame(target, room);
              return;
            }
            if (module.exports.projectileCollidesToObjects(target, room)) {
              module.exports.removeBulletFromGame(target, room);
              return;
            }
          }
        }
      }
      // Move in Y
      if (currentDelta < Math.abs(target.deltaY) && !collidedY) {
        const copiedShape = new SAT.Box(new SAT.Vector(target.shape.pos.x, target.shape.pos.y), target.shape.w, target.shape.h);
        copiedShape.pos.y += (target.deltaY > 0) ? 0.1 : -0.1;
        if (target.collideToTerrain) {
          if (!terrainCollision.collidesToTerrain(copiedShape.toPolygon(), room)) {
            target.y += ((target.deltaY > 0) ? 0.1 : -0.1);
            target.shape.pos = new SAT.Vector(target.x, target.y);
            if (type === 'projectile') {
              target.travelDistance += 0.1;
              if (target.travelDistance > target.maxTravelDistance) {
                module.exports.removeBulletFromGame(target, room);
                return;
              }
            }
          } else {
            module.exports.objectCollidedWithTerrain(target, room, type);
            collidedY = true;
          }
        } else {
          target.y += ((target.deltaY > 0) ? 0.1 : -0.1);
          target.shape.pos = new SAT.Vector(target.x, target.y);
          if (type === 'projectile') {
            target.travelDistance += 0.1;
            if (target.travelDistance > target.maxTravelDistance) {
              module.exports.objectCollidedWithTerrain(target, room, type);
              return;
            }
          }
        }
      }
    }

    target.deltaX = 0;
    target.deltaY = 0;
  },
  projectileCollidesToObjects(target, room) {
    if (target.team === 1) {
      for (let i = 0; i < room.enemies.length; i++) {
        const foundEnemy = room.enemies[i];
        if (SAT.testPolygonPolygon(target.shape.toPolygon(), foundEnemy.shape.toPolygon())) {
          module.exports.takeDamage(foundEnemy, 'enemy', target.damage);
          return true;
        }
      }
      return false;
    } else if (target.team === 2) {
      for (let i = 0; i < room.players.length; i++) {
        const foundPlayer = room.players[i];
        if (SAT.testPolygonPolygon(target.shape.toPolygon(), foundPlayer.shape.toPolygon())) {
          module.exports.takeDamage(foundPlayer, 'player', target.damage);
          return true;
        }
      }
      return false;
    }
    return false;
  },
  takeDamage(target, type, damage) {
    if (type === 'enemy') {
      target.stats.health -= damage;
    } else if (type === 'player') {
      target.stats.health -= damage;
    }
  },
  objectCollidedWithTerrain(target, room, type) {
    if (type === 'projectile') {
      // Remove bullet from server
      module.exports.removeBulletFromGame(target, room);
    }
  },
  removeBulletFromGame(target, room) {
    // Remove bullet from server
    const index = room.projectiles.indexOf(target);
    if (index !== -1) {
      room.projectiles.splice(index, 1);
    }
    // Send remove event
    serverlogic.removeProjectile(target.guid, room);
  },
  checkIfBroadcastNPC(enemy, room) {
    const deltaX = Math.abs(enemy.shape.pos.x - enemy.lastBroadCastedPosition.x);
    const deltaY = Math.abs(enemy.shape.pos.y - enemy.lastBroadCastedPosition.y);

    if (deltaX + deltaY >= 2) {
      enemy.lastBroadCastedPosition = { x: enemy.shape.pos.x, y: enemy.shape.pos.y };
      serverlogic.updateNPCPosition(enemy.hash, enemy.lastBroadCastedPosition, room);
    }
  },
  angleBetweenTwoPoints(p1, p2) {
    const dy = p1.y - p2.y;
    const dx = p1.x - p2.x;
    const vlength = Math.sqrt((dx * dx) + (dy * dy));
    const ny = dy * vlength;
    const nx = dx * vlength;
    let angle = Math.atan2(1, 0) - Math.atan2(ny, nx);
    angle *= 180 / Math.PI;
    if (angle < 0) {
      angle = 360 + angle;
    }
    return angle;
  },

};
