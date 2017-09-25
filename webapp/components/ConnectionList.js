import React from 'react';
import { connect } from 'react-redux';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn

} from 'material-ui/Table';
import PropTypes from 'prop-types';
import SocketConnection from './SocketConnection';

let ConnectionList = ({connections}, {}) => (
  <Table selectable={false}>
    <TableHeader displaySelectAll={false} adjustForCheckbox={false} >
      <TableRow>
        <TableHeaderColumn>IP</TableHeaderColumn>
        <TableHeaderColumn>Type</TableHeaderColumn>
        <TableHeaderColumn>Name</TableHeaderColumn>
        <TableHeaderColumn>Information</TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody>
    {connections.map(conn => (
      <SocketConnection ip={conn.ip} name={conn.name} type={conn.type} info={conn.info} />
    ))}
    </TableBody>
  </Table>
)

ConnectionList.propTypes = {
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      ip: PropTypes.string.isRequired,
      name: PropTypes.string,
      type: PropTypes.string.isRequired,
      info: PropTypes.string
    }).isRequired
  ).isRequired
}

const mapStateToProps = state => {
  return {
    connections: state.connList.connections
  }
}



ConnectionList = connect(
  mapStateToProps
)(ConnectionList)

export default ConnectionList
