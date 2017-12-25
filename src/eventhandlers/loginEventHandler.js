const SF = require('./../staticFuncs.js');
const evts = require('./../networkingevents.js');

const userlogin = require('./../db/userlogin.js');

module.exports = {
  askRegister(socket, payload) {
    userlogin.newRegisterToken(socket.id).then((registerToken) => {
      if (registerToken.success) {
        console.log('send ok');
        socket.emit(evts.outgoing.GIVE_REGISTER_TOKEN, { token: registerToken.token });
      }
    });
  },

};
