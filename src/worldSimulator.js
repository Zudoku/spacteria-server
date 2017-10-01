let roomsRef;

const SAT = require('sat');
const enemySimulator = require('./enemies/enemySimulator.js');
const terrainCollision = require('./terraincollision.js');
const SF = require('./staticFuncs.js');
const itemHandler = require('./db/items.js');
const mapDescription = require('./gamemapDescriptions.js');
const charDB = require('./db/characters.js');
const gameplayconfig = require('./../config/gameplayconfig.js');
const worldUtil = require('./worldUtil.js');

let gameserver;

module.exports = {
  init(filename, room, broadcast, reset, maprooms) {
    setTimeout(() => {
      terrainCollision.initializeMap(filename, (result) => {
        if (result === true) {
          console.log(`Tilemap successfully read for map: ${filename}`);
        } else {
          console.log('wtf..?');
        }
        room.mapDescription.filename = filename;
        if (mapDescription.initializeMap(room, terrainCollision.getTypes(filename).type, terrainCollision, reset, maprooms)) {
          if (broadcast) {
            console.log('broadcasting map change');
            gameserver.broadcastUpdateRoomDescription(room);
          }
        }
      });
    }, 100);
  },
  initialize(serlogic) {
    gameserver = serlogic;
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
    // And move them
    for (let i = 0; i < room.projectiles.length; i++) {
      const projectile = room.projectiles[i];
      module.exports.giveMomentum(projectile, projectile.angle, projectile.speed);
      module.exports.defaultMove(projectile, room, 'projectile', ioref);
    }
    // Simulate enemies
    for (let i = 0; i < room.enemies.length; i++) {
      const enemy = room.enemies[i];
      // Set move target, shoot at players, look for target here
      enemySimulator.simulate(enemy, room, gameserver);
      // If we need to move, move
      if (enemy.moveTarget !== undefined) {
        // Give momentum
        let angle = SF.angleBetweenTwoPoints(enemy.shape.pos, enemy.moveTarget);
        angle %= 360;
        module.exports.giveMomentum(enemy, angle, enemy.stats.speed);
        // Move enemies
        module.exports.defaultMove(enemy, room, 'enemy');
        // Test if we should broadcast new position
        module.exports.checkIfBroadcastNPC(enemy, room);
      }
    }
  },
  giveMomentum(target, angle, speed) {
    const angleInRadians = (angle / 360) * (2 * Math.PI);
    const scaler = ((speed * gameplayconfig.SIMULATION_INTERVAL) / 200);

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
    if (type === 'projectile') {
      const newZone = worldUtil.getZoneForCoord(room.zones, target.x, target.y);
      if (target.zone === undefined || newZone.x !== target.zone.x || newZone.y !== target.zone.y) {
        target.zone = newZone;
      }
    }
  },
  projectileCollidesToObjects(target, room) {
    if (target.team === 1) {
      // Get targets zone
      const zoneToCheck = room.zones[target.zone.x][target.zone.y];
      let collided = false;
      Object.entries(zoneToCheck.enemies).forEach(([key, value]) => {
        const foundShape = value.shape;
        if (SAT.testPolygonPolygon(target.shape.toPolygon(), foundShape.toPolygon())) {
          const foundEnemy = room.enemies.find(x => (x.hash === `${key}`));
          if (foundEnemy !== undefined) {
            module.exports.takeDamage(foundEnemy, 'enemy', target.damage, room);
            collided = true;
          }
        }
      });
      return collided;
    } else if (target.team === 2) {
      for (let i = 0; i < room.players.length; i++) {
        const foundPlayer = room.players[i];
        if (SAT.testPolygonPolygon(target.shape.toPolygon(), foundPlayer.shape.toPolygon())) {
          module.exports.takeDamage(foundPlayer, 'player', target.damage, room);
          return true;
        }
      }
      return false;
    }
    return false;
  },
  takeDamage(target, type, damage, room) {
    let takenDamage = damage - target.stats.defence;
    if (takenDamage <= 0) {
      takenDamage = 1;
    }
    if (type === 'enemy') {
      target.stats.health -= takenDamage;
      if (target.stats.health <= 0) {
        module.exports.npcDie(target, room);
      }
    } else if (type === 'player') {
      target.stats.health -= takenDamage;
      gameserver.broadcastCharacterStatus(target.id);
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
    // gameserver.broadcastRemoveGameobject(target.guid, room);
  },
  npcDie(target, room) {
    // Kill it from the server
    const index = room.enemies.indexOf(target);
    if (index !== -1) {
      room.enemies.splice(index, 1);
      gameserver.broadcastRemoveGameobject(target.hash, room);
      // Roll the loot
      module.exports.spawnLoot(target.loot, room, target.x, target.y);
      // Give EXP
      module.exports.giveExp(target, room);
    } else {
      // WTF?
    }
  },
  giveExp(deadTarget, room) {
    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      player.characterdata.experience += deadTarget.exp;
      const levelCap = gameplayconfig.LEVELCAPS[player.characterdata.level - 1];
      if (player.characterdata.experience >= levelCap) {
        player.characterdata.experience -= levelCap;
        player.characterdata.level++;
        gameserver.refreshStatsForPlayer(player);
      }
      if (gameplayconfig.data_percistence) {
        charDB.updateCharacter(player.characterdata);
      }
      gameserver.broadcastCharacterStatus(player.id);
    }
  },
  spawnLoot(lootTable, room, x, y) {
    const lootContents = [];
    const lootPromises = [];
    let lootQuality = 1;
    for (let i = 0; i < lootTable.length; i++) {
      const roll = lootTable[i];
      // Roll the dice on if we should roll this container
      const diceRoll = SF.getRandomIntInclusive(1, roll.chance);
      if (diceRoll === 1) {
        // Roll the container
        const containerIndex = SF.getRandomIntInclusive(0, roll.items.length - 1);
        const loot = roll.items[containerIndex];
        if (loot.id < 0) {
          const addedLoot = { uniqueid: loot.id, amount: loot.amount };
          lootContents.push(addedLoot);
        } else {
          const lootPromise = { promise: itemHandler.getItem(loot.id), id: loot.id, amount: loot.amount };
          lootPromises.push(lootPromise);
        }
      }
    }

    // Promises
    Promise.all(lootPromises.map(u => u.promise)).then((data) => {
      for (let index = 0; index < data.length; index++) {
        const result = data[index];
        if (!result.success) {
          console.log('WTF');
        } else {
          const lootItem = result.item;
          if (lootItem.rarity > lootQuality) {
            lootQuality = lootItem.rarity;
          }
          const origPromise = lootPromises.find(z => z.id === lootItem.uniqueid);
          const addedLoot = { uniqueid: lootItem.uniqueid, data: lootItem, amount: origPromise.amount };
          lootContents.push(addedLoot);
        }
      }
      // Add the gameobject to the game
      const lootBag = {
        type: 1,
        lootbag: {
          quality: lootQuality,
          items: lootContents,
          x,
          y,
        },
        x,
        y,
        hash: SF.guid(),
      };
      room.gameobjects.push(lootBag);
      gameserver.broadcastLootBagToGame(lootBag.lootbag, lootBag.hash, room);
    });
  },
  checkIfBroadcastNPC(enemy, room) {
    const deltaX = Math.abs(enemy.shape.pos.x - enemy.lastBroadCastedPosition.x);
    const deltaY = Math.abs(enemy.shape.pos.y - enemy.lastBroadCastedPosition.y);

    if (deltaX + deltaY >= gameplayconfig.NPC_POSITION_BROADCAST_BUFFER) {
      enemy.lastBroadCastedPosition = { x: enemy.shape.pos.x, y: enemy.shape.pos.y };
      gameserver.broadcastUpdateNPCPosition(enemy.hash, enemy.lastBroadCastedPosition, room);
      // Recalculate zone
      const newZone = worldUtil.getZoneForCoord(room.zones, enemy.x, enemy.y);
      if (enemy.zone === undefined || newZone.x !== enemy.zone.x || newZone.y !== enemy.zone.y) {
        // Remove the old zone,
        const oldZone = room.zones[enemy.zone.x][enemy.zone.y];
        delete oldZone[enemy.hash];
        // Add to new zone
        worldUtil.getZoneForCoord(room.zones, enemy.x, enemy.y).enemies[enemy.hash] = { shape: enemy.shape };
        enemy.zone = worldUtil.getZoneForCoord(room.zones, enemy.x, enemy.y);
      }
    }
  },


};
