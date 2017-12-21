module.exports = {
  incoming: {
    IDENTIFY: 'identify',
    ASK_TO_JOIN_GAME: 'joingame',
    MAKE_NEW_ROOM: 'makeroom',
    ROOMLIST_REQUEST: 'roomlist',
    UPDATE_POSITION: 'updateposition',
    SPAWN_PROJECTILE: 'spawnprojectile',
    LIST_CHARACTERS: 'listcharacters',
    CREATE_CHARACTER: 'createcharacter',
    LOAD_CHARACTER: 'loadcharacter',
    CHARACTERLIST_REQUEST: 'characterlist',
    DELETE_CHARACTER: 'deletecharacter',
    LOOT_ITEM: 'lootgameitem',
    EQUIP_ITEM: 'equipitem',
    UNEQUIP_ITEM: 'unequipitem',
    DROP_ITEM: 'dropitem',
    SELL_ITEM: 'sellitem',
    MOVE_ITEM_IN_INVENTORY: 'moveitemininventory',
    MAP_LOADED: 'maploaded',
    ENTER_PORTAL: 'enterportal',
    TELEPORT_TO_CAMP: 'teleportcamp',
    UPLOAD_ITEMDATA: 'uploaditems',
    RELOAD_DASHBOARD_DATA: 'reloaddata',
    EMIT_CHAT_MSG: 'emitchatmsg',
    LIST_LEADERBOARDS: 'listleaderboards',
  },
  outgoing: {
    SEND_ROOMLIST: 'displayroomlist',
    SEND_LEADERBOARDS: 'displayleaderboards',
    JOIN_ROOM: 'joinroom',
    PLAYER_JOINED_YOUR_GAME: 'playerjoin',
    PLAYER_LEFT_YOUR_GAME: 'playerleft',
    OBSERVER_SEND_INFO: 'info',
    CORRECT_PLAYER_POSITION: 'correctnpcposition',
    SPAWN_PROJECTILE: 'newprojectilespawned',
    SPAWN_LOOTBAG: 'newlootbagspawned',
    SPAWN_ENEMY: 'newenemyspawned',
    DESPAWN_GAMEOBJECT: 'despawngameobject',
    REFRESH_ROOM_DESCRIPTION: 'refreshroomdesc',
    UPDATE_NPC_POSITION: 'correctnpcposition',
    LOGIN_SUCCESS: 'loginsuccess',
    LOGIN_FAIL: 'loginfail',
    CHARACTER_LOAD_SUCCESSFUL: 'charloadsuccess',
    SEND_CHARACTERLIST: 'displaycharacterlist',
    UPDATE_CHARATER_STATUS: 'updatecharacterstatus',
    UPDATE_LOOTBAG_STATUS: 'updatelootbagstatus',
    LOAD_NEW_MAP: 'loadnewmap',
    BAD_CHARACTERNAME: 'badcharactername',
    CHARACTER_CREATED: 'charactercreated',
    CHARACTERS_ALL_DEAD: 'charactersalldead',
    ALERT_DASHBOARD: 'alert',
    DATADASHBOARD_SET_DATA: 'datadashboarddata',
    VERSION_DATA: 'versiondata',
    CHAT_MSG: 'chatmsg',
  },
};
