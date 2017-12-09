import React from 'react';
import { connect } from 'react-redux';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import { bindActionCreators } from 'redux';
import * as actions from './../actions/actions';

import getSocket from './../index.js';


function getModifiedTitle(modified){
  if(modified){
    return "Unsaved changes";
  } else {
    return "No changes";
  }
}
let ItemConfigurator = (props , {}) => (

  <div>
  {console.log(props)}
    <Drawer open={true} >
      <MenuItem onClick={props.addNewItem}> Add new Item</MenuItem>
      {props.itemData.items.map((item) => (
        <MenuItem onClick={function(){props.selectItem(item.uniqueid)}}> {item.uniqueid + ' | ' + item.displayname}</MenuItem>
      ))}
    </Drawer>
    <div>
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <ToolbarTitle style={{ padding: 5 }} text="Item Dashboard" />
          <ToolbarSeparator style={{ margin: 5 }} />
          <small > {getModifiedTitle(props.itemData.modified)} </small>
          <ToolbarSeparator style={{ margin: 5 }} />
          <small> Data synced at: {props.itemData.syncedAt.getHours()}:{props.itemData.syncedAt.getMinutes()} </small>
          <ToolbarSeparator style={{ margin: 5 }} />
          {'' + props.itemData.items.length} items.
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <RaisedButton onClick={function(){getSocket().emit('reloaddata', {})} } secondary={true} label="Reload data from server"/>
          <RaisedButton onClick={function(){getSocket().emit('uploaditems', { items: props.itemData.items });}} label="Upload to server"/>
        </ToolbarGroup>
      </Toolbar>
      {props.itemData.selectedItem !== undefined &&
      <div style={{fontFamily: 'Roboto, sans-serif'}}>
        <h3>{ '' + props.itemData.selectedItem.uniqueid}</h3>
        <b>Displayname</b> <br />
        <TextField id="displayname" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'displayname', newValue)}} value={props.itemData.selectedItem.displayname} /> <br />
        <b>Description</b> <br />
        <TextField id="description" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'description', newValue)}} value={props.itemData.selectedItem.description}  multiLine={true} rows={3} /> <br />
        <b>Item type</b> <br />
        <SelectField id="itemtypeid" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'itemtypeid', newValue)}} value={props.itemData.selectedItem.itemtypeid} >
          <MenuItem value={0} primaryText="Helmet" />
          <MenuItem value={1} primaryText="Pants" />
          <MenuItem value={2} primaryText="Shoulders" />
          <MenuItem value={3} primaryText="Weapon" />
          <MenuItem value={4} primaryText="Chest" />
          <MenuItem value={5} primaryText="Boots" />
          <MenuItem value={6} primaryText="Ring" />
          <MenuItem value={7} primaryText="Relic" />
        </SelectField>
        <br />
        <b>Stackable</b> <br />
        <Toggle id="stackable" onToggle={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'stackable', newValue)}} toggled={props.itemData.selectedItem.stackable} /> <br />
        <b>Level requirement</b> <br />
        <TextField id="levelreq" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'levelreq', parseInt(newValue))}} value={props.itemData.selectedItem.levelreq} type="number" min="0" max="21" /> <br />
        <b>Tradeable</b> <br />
        <Toggle id="tradeable" onToggle={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'tradeable', newValue)}} toggled={props.itemData.selectedItem.tradeable} /> <br />
        <b>Rarity</b> <br />
        <SelectField id="rarity" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'rarity', newValue)}} value={props.itemData.selectedItem.rarity} >
          <MenuItem value={0} primaryText="basic / white" />
          <MenuItem value={1} primaryText="good / green" />
          <MenuItem value={2} primaryText="great / yellow" />
          <MenuItem value={3} primaryText="epic / magenta" />
        </SelectField>
        <br />
        <b>Sellvalue</b> <br />
        <TextField id="sellvalue" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'sellvalue', parseInt(newValue))}} value={props.itemData.selectedItem.sellvalue} type="number" min="0" max="1000" /> <br />
        <b>Image</b> <br />
        <TextField id="imageid" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.uniqueid, 'imageid', parseInt(newValue))}} value={props.itemData.selectedItem.imageid} type="number" min="0" max="500" /> <br />
        <b>Item attributes</b> <br />
        <TextField id="stats" onChange={function(event, newValue){props.modifyItem(props.itemData.selectedItem.stats, 'stats', newValue)}} value={props.itemData.selectedItem.stats}  multiLine={true} rows={6} /> <br />
      </div>
      }
    </div>
  </div>
)


const mapStateToProps = state => {
  return {
    itemData: state.loadItemdata
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(actions, dispatch);
}



ItemConfigurator = connect(
  mapStateToProps, mapDispatchToProps
)(ItemConfigurator)

export default ItemConfigurator
