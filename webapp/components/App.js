import React from 'react'
import DashboardApp from './DashboardApp'
import DataDashBoard from './DataDashBoard'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'


function getApp(dataDashBoard){
  if(dataDashBoard.dataDashBoard){
    return <DataDashBoard />;
  } else {
    return <DashboardApp />;
  }
}

const App = (dataDashBoard) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    {getApp(dataDashBoard)}
  </MuiThemeProvider>
)

export default App
