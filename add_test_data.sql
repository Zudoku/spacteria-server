INSERT INTO gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO gamecharacter
(userid,name,cclass,level,experience,created) VALUES
(1,'foo',1,1,0,CURRENT_TIMESTAMP);

INSERT INTO gamecharacter
(userid,name,cclass,level,experience,created) VALUES
(1,'bar',2,1,0,CURRENT_TIMESTAMP);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Test item 1', 'no desc', 1,TRUE,1,FALSE, 1, 100, 1);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Test item 2', 'no desc', 2,TRUE,1,FALSE, 1, 100, 2);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Test item 3', 'no desc', 3,TRUE,1,FALSE, 1, 100, 3);

INSERT INTO gameitemattribute
(itemid attributeid, attributevalue) VALUES
(1, 1, 1);

INSERT INTO gameequipment
(characterid, itemid) VALUES
(1, 1);

INSERT INTO gameinventory
(characterid, itemid, quantity, slot) VALUES
(1, 1, 2, 1);

INSERT INTO gameinventory
(characterid, itemid, quantity, slot) VALUES
(1, 3, 10, 2);
