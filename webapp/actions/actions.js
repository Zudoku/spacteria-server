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
