import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './components/App'
import appi from './reducers/reducers'
import io from 'socket.io-client'
import { refreshConnections, refreshRooms, setItems } from './actions/actions'

let store = createStore(appi);
let socket = io();
let dataDashBoard = window.location.pathname === '/datadashboard';

if(dataDashBoard){
  setUpDataDashboard();
} else {
  setUpLiveDashboard();
}

function setUpDataDashboard(){
  socket.on('alert', function(payload){
    alert(JSON.stringify(payload));
  });
  socket.on('datadashboarddata', function(payload){
    let items = payload.items;
    for(let modifiedItem of items){
      modifiedItem.stats = JSON.stringify(modifiedItem.stats, null, 4);
    }
    store.dispatch(setItems(items));
  });
  socket.emit('identify', { type: "browser", page: 'datadashboard'});
}

function setUpLiveDashboard(){
  socket.on('info', function(payload){
     document.getElementById("content").innerHTML = JSON.stringify(payload, null,4);
    const mutatedConnections = Object.entries(payload.connections).map(([key, value]) => {
      return { ip: value.ip, type: value.type, name: value.username,
        info: 'socket=' + key + ' ID=' + value.id + ' characterName=' + value.charactername};
    });
    store.dispatch(refreshConnections(mutatedConnections));
    store.dispatch(refreshRooms(payload.rooms));
  });
  socket.emit('identify', { type: "browser", page: 'livedashboard'});
}


const getSocket = function(){
  return socket;
}

export default getSocket;

render(
  <Provider store={store}>
    <App dataDashBoard={dataDashBoard} />
  </Provider>,
  document.getElementById('root')
)
