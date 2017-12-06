import React from 'react';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import {
  List, ListItem
} from 'material-ui/List';


const style = {
  margin: 20,
  padding: 20,
  marginLeft: 40,
  textAlign: 'left',
  overflowY: 'auto',
};

function getPlayers(players){
  return players.map((player) => (
    <ListItem primaryText={player.characterdata.name} secondaryText={player.characterdata.uniqueid} />
  ));
}

function getLoot(go){
  return go.lootbag.items.map((item) => {
    if(item.uniqueid < 0) {
      return 'Currency (' + item.amount + ')';
    }
    return item.data.displayname + ' (' + item.amount + ')';
  });
}

function getGOs(gameobjects){
  return gameobjects.map((go) => (
    <ListItem primaryText={getGOText(go)[0]} secondaryText={getGOText(go)[1]} />
  ));
}

function parseEnemies(enemies){
  let result = {};
  enemies.map((enemy) => {
    if(result[enemy.tag] !== undefined){
      result[enemy.tag].amount++;
    } else {
      result[enemy.tag] = {
        amount: 1,
        type: enemy.type,
        name: enemy.name,
      };
    }
  });


  return Object.entries(result);
}

function getEnemies(enemies){
  return parseEnemies(enemies).map((enemyObj) => (
    <ListItem primaryText={enemyObj[0]} secondaryText={JSON.stringify(enemyObj[1])} />
  ));
}

function getGOText(go){
  switch (go.type) {
      case 1:

      return ['Lootingbag (' + go.lootbag.quality + ') (' + go.x + ',' + go.y + ')', getLoot(go)];
      case 2:

      return ['Portal (' + go.portal.to + ') (' + go.x + ',' + go.y + ')',''];
      case 3:

      return ['NPC (' + go.npc.name + ') (' + go.x + ',' + go.y + ')','' + go.npc.type];
    default:
      return ['Unknown',''];

  }
}



let Room = ({roomObj}) => (
  <div style={ { marginLeft: 20, backgroundColor: '#FAFAFA', width: 'auto', display: 'block' } }>
    <Paper style={style} zDepth={4} >
        {roomObj !== undefined &&
            <List>
              <ListItem primaryText={'Name: ' + roomObj.name} />
              <Divider />
              <ListItem primaryText={'Difficulty: ' + roomObj.difficulty} />
              <Divider />
              <ListItem primaryText={'Map: ' + roomObj.mapDescription.filename} />
              <Divider />
              <ListItem primaryText={'Characters: ' + roomObj.players.length} nestedItems={getPlayers(roomObj.players)}  />
              <Divider />
              <ListItem primaryText={'Gameobjects: ' + roomObj.gameobjects.length} nestedItems={getGOs(roomObj.gameobjects)} />
              <Divider />
              <ListItem primaryText={'Enemies: ' + roomObj.enemies.length} nestedItems={getEnemies(roomObj.enemies)}  />
              <Divider />
              <ListItem primaryText={'Projectiles: ' + roomObj.projectiles.length} />
              <Divider />
            </List>
        }
    </Paper>
  </div>
)

const mapStateToProps = state => {
  return {
    roomObj: state.roomList.selectedRoom
  }
}

Room = connect(
  mapStateToProps
)(Room)


export default Room
