const evts = require('./../networkingevents.js');

module.exports = {
  send(msg, ioRef) {
    ioRef.to('chat').emit(evts.outgoing.CHAT_MSG, { m: msg, style: 1 });
  },
  emit(msg, who, ioRef) {
    ioRef.to('chat').emit(evts.outgoing.CHAT_MSG, { m: `[${who}]: ${msg}`, style: 1 });
  },
};
