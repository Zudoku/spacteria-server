import React from 'react'
import ConnectionList from './ConnectionList'
import AppBar from 'material-ui/AppBar'

const DashboardApp = () => (
  <div>
    <AppBar
      title="Spacteria Dashboard"
      />
      <ConnectionList />
  </div>
)

export default DashboardApp
