import React from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table';
import PropTypes from 'prop-types';

const SocketConnection = ({ip, name, type, info}) => (
  <TableRow>
    <TableRowColumn>{ip}</TableRowColumn>
    <TableRowColumn>{type}</TableRowColumn>
    <TableRowColumn>{name}</TableRowColumn>
    <TableRowColumn>{info}</TableRowColumn>
  </TableRow>
)

SocketConnection.propTypes = {
  ip: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.string.isRequired,
  info: PropTypes.string
}

export default SocketConnection
