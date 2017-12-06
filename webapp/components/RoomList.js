import React from 'react';
import { connect } from 'react-redux';
import {
  List, ListItem
} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import {
  Paper
} from 'material-ui/Paper';
import Room from './Room';

const paperStyle = {
  width: 300,
  margin: 10,
};

const roomsContainerStyle = {
}

let RoomList = ({rooms}, {}) => (
  <div>
    <div>
      <h3>Rooms</h3>
    </div>
    <div style={roomsContainerStyle}>
      <List style={ { float: 'left', width: 300, padding: 10 } } >
      {rooms.map(room => (
        <div style={paperStyle}>
          <ListItem primaryText={room.name} />
          <Divider />
        </div>
      ))}
      </List>
      <Room />
    </div>
  </div>
)


const mapStateToProps = state => {
  return {
    rooms: state.roomList.rooms
  }
}



RoomList = connect(
  mapStateToProps
)(RoomList)

export default RoomList
