const evts = require('./networkingevents.js');
const worldUtil = require('./worldUtil.js');

const gameobjects = require('./gameobjects.js');

module.exports = {
  updatePosition(worldContainer, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    // TODO: check input validity
    worldContainer.updatePlayerPosition(currentPlayer, payload.x, payload.y);
    socket.broadcast.to(currentPlayer.room)
    .emit(evts.outgoing.CORRECT_PLAYER_POSITION,
       { id: socket.id, x: payload.x, y: payload.y });
  },
  playerAttack(gameserver, worldContainer, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    // TODO: check input validity
    const projectile = worldContainer.playerAttack(currentPlayer, payload);

    const foundRoom = worldContainer.getRooms().find(x => x.name === currentPlayer.room);
    foundRoom.projectiles.push(projectile);
    gameserver.broadcastProjectileSpawn(projectile, foundRoom);
  },
  lootItem(gameserver, worldContainer, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    // TODO: check input validity
    const result = worldContainer.playerLoot(currentPlayer, payload.lootbagHash, payload.index);
    if (result !== undefined) {
      if (result.length > 0) {
        gameserver.broadcastLootBagChangeToGame(result, payload.lootbagHash, currentPlayer.room);
      } else {
        worldContainer.removeGameobject(currentPlayer.room, payload.lootbagHash);
        gameserver.broadcastRemoveGameobject(payload.lootbagHash, { name: currentPlayer.room });
      }
      socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
    }
  },
  equipItem(gameserver, worldContainer, socket, payload) {
    let currentPlayer = worldContainer.getPlayers()[socket.id];
    // TODO: check input validity
    if (worldContainer.equipItem(currentPlayer, payload.index)) {
      currentPlayer = worldContainer.getPlayers()[socket.id];
      worldUtil.tryToSaveItemData(currentPlayer, true, true);
      setTimeout(() => {
        gameserver.refreshStatsForPlayer(currentPlayer);
        gameserver.broadcastCharacterStatus(socket.id);
      }, 250);
    }
  },
  unEquipItem(gameserver, worldContainer, socket, payload) {
    let currentPlayer = worldContainer.getPlayers()[socket.id];
    if (worldContainer.unEquipItem(currentPlayer, payload.slot)) {
      currentPlayer = worldContainer.getPlayers()[socket.id];
      worldUtil.tryToSaveItemData(currentPlayer, true, true);
      setTimeout(() => {
        gameserver.refreshStatsForPlayer(currentPlayer);
        gameserver.broadcastCharacterStatus(socket.id);
      }, 250);
    }
  },
  dropItem(gameserver, worldContainer, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    const itemWrapperReference = currentPlayer.characterdata.inventory.data[payload.slot];
    if (worldContainer.playerDropItem(currentPlayer, payload.slot, Number.MAX_SAFE_INTEGER)) {
      socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
      const lootBag = gameobjects.getLootBag(1, [itemWrapperReference], currentPlayer.x, currentPlayer.y);
      worldContainer.getRooms().find(x => x.name === currentPlayer.room).gameobjects.push(lootBag);
      gameserver.broadcastLootBagToGame(lootBag.lootbag, lootBag.hash, { name: currentPlayer.room });
    }
  },
};
