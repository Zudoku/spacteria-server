module.exports = {
  incoming : {
    IDENTIFY : "identify",
    ASK_TO_JOIN_GAME : "joingame",
    MAKE_NEW_ROOM : "makeroom",
    ROOMLIST_REQUEST : "roomlist"
  },
  outgoing : {
    SEND_ROOMLIST : "displayroomlist",
    JOIN_ROOM : "joinroom",
    PLAYER_JOINED_YOUR_GAME : "playerjoin",
    PLAYER_LEFT_YOUR_GAME : "playerleft",
    OBSERVER_SEND_INFO : "info"
  }
};
