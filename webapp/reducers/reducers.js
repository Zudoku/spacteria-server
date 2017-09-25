import { combineReducers } from 'redux'

const initialState = {
  connections : []
};

function connList(state = initialState, action) {
  switch (action.type) {
    case 'SET_CONNS':
        return Object.assign({}, state, {
          connections: action.payload
        });
      break;
    default:
      return state
  }
}

const appi = combineReducers({
  connList
});

export default appi;
