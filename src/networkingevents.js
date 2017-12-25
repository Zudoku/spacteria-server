module.exports = {
  incoming: {

    /* LOGIN */

    IDENTIFY: 'identify',
    ASK_REGISTER: 'register',

    /* MENU */

    ASK_TO_JOIN_GAME: 'joingame',
    MAKE_NEW_ROOM: 'makeroom',
    ROOMLIST_REQUEST: 'roomlist',
    LIST_CHARACTERS: 'listcharacters',
    CREATE_CHARACTER: 'createcharacter',
    LOAD_CHARACTER: 'loadcharacter',
    CHARACTERLIST_REQUEST: 'characterlist',
    DELETE_CHARACTER: 'deletecharacter',
    LIST_LEADERBOARDS: 'listleaderboards',

    /* PLAYER INTERACTION */

    LOOT_ITEM: 'lootgameitem',
    EQUIP_ITEM: 'equipitem',
    UNEQUIP_ITEM: 'unequipitem',
    DROP_ITEM: 'dropitem',
    SELL_ITEM: 'sellitem',
    MOVE_ITEM_IN_INVENTORY: 'moveitemininventory',
    ENTER_PORTAL: 'enterportal',
    TELEPORT_TO_CAMP: 'teleportcamp',

    /* CORE */

    UPDATE_POSITION: 'updateposition',
    SPAWN_PROJECTILE: 'spawnprojectile',
    MAP_LOADED: 'maploaded',

    /* UTIL */

    UPLOAD_ITEMDATA: 'uploaditems',
    RELOAD_DASHBOARD_DATA: 'reloaddata',
    EMIT_CHAT_MSG: 'emitchatmsg',

  },
  outgoing: {

    /* LOGIN */

    LOGIN_SUCCESS: 'loginsuccess',
    LOGIN_FAIL: 'loginfail',
    GIVE_REGISTER_TOKEN: 'giveregistertoken',
    GIVE_LOGIN_TOKEN: 'givelogintoken',

    /* MENU */

    SEND_ROOMLIST: 'displayroomlist',
    SEND_LEADERBOARDS: 'displayleaderboards',
    JOIN_ROOM: 'joinroom',
    CHARACTER_LOAD_SUCCESSFUL: 'charloadsuccess',
    SEND_CHARACTERLIST: 'displaycharacterlist',
    BAD_CHARACTERNAME: 'badcharactername',
    CHARACTER_CREATED: 'charactercreated',
    VERSION_DATA: 'versiondata',

    /* CORE */

    PLAYER_JOINED_YOUR_GAME: 'playerjoin',
    PLAYER_LEFT_YOUR_GAME: 'playerleft',
    CORRECT_PLAYER_POSITION: 'correctnpcposition',
    SPAWN_PROJECTILE: 'newprojectilespawned',
    SPAWN_LOOTBAG: 'newlootbagspawned',
    SPAWN_ENEMY: 'newenemyspawned',
    DESPAWN_GAMEOBJECT: 'despawngameobject',
    REFRESH_ROOM_DESCRIPTION: 'refreshroomdesc',
    UPDATE_NPC_POSITION: 'correctnpcposition',
    UPDATE_CHARATER_STATUS: 'updatecharacterstatus',
    UPDATE_LOOTBAG_STATUS: 'updatelootbagstatus',
    LOAD_NEW_MAP: 'loadnewmap',
    CHARACTERS_ALL_DEAD: 'charactersalldead',

    /* UTIL */

    OBSERVER_SEND_INFO: 'info',
    ALERT_DASHBOARD: 'alert',
    DATADASHBOARD_SET_DATA: 'datadashboarddata',
    CHAT_MSG: 'chatmsg',

  },
};
