import { combineReducers } from 'redux'

const initialStateConns = {
  connections : [],
};

const initialStateRooms = {
  rooms : [],
  selectedRoom: undefined
};

function connList(state = initialStateConns, action) {
  switch (action.type) {
    case 'SET_CONNS':
        return Object.assign({}, state, {
          connections: action.payload,
        });
      break;
    default:
      return state
  }
}

function roomList(state = initialStateRooms, action) {
  switch (action.type) {
    case 'SET_ROOMS':
        return Object.assign({}, state, {
          rooms: action.payload,
          selectedRoom: action.payload[0],
        });
      break;
    default:
      return state
  }
}

const appi = combineReducers({
  connList, roomList
});

export default appi;
