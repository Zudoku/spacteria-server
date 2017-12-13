const evts = require('./../networkingevents.js');

module.exports = {
  send(msg, ioRef, style) {
    ioRef.to('chat').emit(evts.outgoing.CHAT_MSG, { m: msg, style });
  },
  sendRoom(msg, ioRef, style, room) {
    ioRef.to(room.name).emit(evts.outgoing.CHAT_MSG, { m: msg, style });
  },
  emit(msg, who, ioRef) {
    ioRef.to('chat').emit(evts.outgoing.CHAT_MSG, { m: `[${who}]: ${msg}`, style: 1 });
  },
};
