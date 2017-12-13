import React from 'react'
import ConnectionList from './ConnectionList'
import RoomList from './RoomList'
import AppBar from 'material-ui/AppBar'

const DashboardApp = () => (
  <div>
    <AppBar
      title="Spacteria Dashboard"
      />
      <ConnectionList />
      <RoomList />
  </div>
)

export default DashboardApp
