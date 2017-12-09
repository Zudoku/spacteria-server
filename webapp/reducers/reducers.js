import { combineReducers } from 'redux'

const initialStateConns = {
  connections : [],
};

const initialStateRooms = {
  rooms : [],
  selectedRoom: undefined
};

const initialStateItemLoadData = {
  items : [],
  modified : false,
  syncedAt: new Date(),
  currentItemIndex: 0,
  selectedItem: undefined,
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

function loadItemdata(state = initialStateItemLoadData, action) {
  switch (action.type) {
    case 'SET_ITEMS':
        return Object.assign({}, state, {
          items: action.payload,
          modified : false,
          syncedAt: new Date(),
          currentItemIndex: action.payload,
          selectedItem: undefined,
        });
      break;
      case 'ADD_NEW_ITEM':
        let newItems = state.items;
        const newItem = {
          uniqueid: state.currentItemIndex + 1,
          displayname: '-',
          description: '-',
          itemtypeid: 1,
          stackable: false,
          levelreq: 1,
          tradeable: true,
          rarity: 1,
          sellvalue: 1,
          imageid: 1,
          synced: false,
          stats: '[\n    { "id": 1, "value": 1}\n]',
        };
        newItems.push(newItem);
        return Object.assign({}, state, {
          items: newItems,
          modified : true,
          currentItemIndex: state.currentItemIndex + 1,
          selectedItem: newItem,
        });

      case 'SELECT_ITEM':
      const foundItem = state.items.find(x => x.uniqueid === action.payload.id);
      return Object.assign({}, state, {
        selectedItem: foundItem,
      });
      case 'MODIFY_ITEM':
      const allItems = state.items;
      for (let item of allItems){
        if(item.uniqueid === action.payload.id){
          item[action.payload.field] = action.payload.newValue;
          console.log(item);
        }
      }
      return Object.assign({}, state, {
        items: allItems,
        modified : true,
      });
    default:
      return state
  }
}

const appi = combineReducers({
  connList, roomList, loadItemdata
});

export default appi;
