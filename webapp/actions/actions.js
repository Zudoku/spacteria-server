export function refreshConnections(payload) {
  return {
    type: 'SET_CONNS',
    payload
  }
}
export function refreshRooms(payload) {
  return {
    type: 'SET_ROOMS',
    payload
  }
}

export function setItems(payload) {
  return {
    type: 'SET_ITEMS',
    payload
  }
}

export function addNewItem() {
  return {
    type: 'ADD_NEW_ITEM',
    payload: {}
  }
}

export function selectItem(id) {
  return {
    type: 'SELECT_ITEM',
    payload: { id }
  }
}

export function modifyItem(id, field, newValue) {
  return {
    type: 'MODIFY_ITEM',
    payload: { id, field, newValue }
  }
}
