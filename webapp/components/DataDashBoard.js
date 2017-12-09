import React from 'react'
import AppBar from 'material-ui/AppBar'
import {Tabs, Tab} from 'material-ui/Tabs'
import ItemConfigurator from './ItemConfigurator'

const DataDashBoard = () => (
  <div>
    <Tabs style={ { paddingLeft: 256 } }>
      <Tab label="Items" >
        <ItemConfigurator />
      </Tab>
      <Tab label="Monsters" >
        TODO
      </Tab>
      <Tab label="Map generation" >
        TODO
      </Tab>
    </Tabs>
  </div>
)

export default DataDashBoard
