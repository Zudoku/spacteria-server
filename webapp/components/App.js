import React from 'react'
import DashboardApp from './DashboardApp'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <DashboardApp />
  </MuiThemeProvider>
)

export default App
