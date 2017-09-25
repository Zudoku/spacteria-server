import { combineReducers } from 'redux'

const initialState = {
  connections : [ { ip: '1.1.1.1', name: 'asd', type:'browser', info:'test'} ]
};

function connList(state = initialState, action) {
  return state;
}

const appi = combineReducers({
  connList
});

export default appi;
