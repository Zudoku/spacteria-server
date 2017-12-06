import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './components/App'
import appi from './reducers/reducers'
import io from 'socket.io-client'
import { refreshConnections, refreshRooms } from './actions/actions'

let store = createStore(appi);

let socket = io();
socket.on('info', function(payload){


  document.getElementById("content").innerHTML = JSON.stringify(payload, null,4);


  const mutatedConnections = Object.entries(payload.connections).map(([key, value]) => {
    return { ip: value.ip, type: value.type, name: value.username,
      info: 'socket=' + key + ' ID=' + value.id + ' characterName=' + value.charactername};
  });
  store.dispatch(refreshConnections(mutatedConnections));
  store.dispatch(refreshRooms(payload.rooms));
});
socket.emit('identify', { type: "browser"});



render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
