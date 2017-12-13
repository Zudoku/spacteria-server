import React from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table';

const SocketConnection = ({ip, name, type, info}) => (
  <TableRow>
    <TableRowColumn>{ip}</TableRowColumn>
    <TableRowColumn>{type}</TableRowColumn>
    <TableRowColumn>{name}</TableRowColumn>
    <TableRowColumn>{info}</TableRowColumn>
  </TableRow>
)


export default SocketConnection
