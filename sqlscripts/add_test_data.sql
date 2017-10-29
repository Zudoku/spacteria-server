INSERT INTO gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO gamecharacter
(userid,name,level,experience,created) VALUES
(1,'foo',1,0,CURRENT_TIMESTAMP);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Fungus staff', 'something strange grows on it... eww!', 3,TRUE,1,FALSE, 1, 100, 2);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Test pants', 'no desc', 1,TRUE,1,FALSE, 1, 100, 1);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Test boots', 'no desc', 5,TRUE,1,FALSE, 1, 100, 3);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(1, 1, 1);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(1, 3, 2);

INSERT INTO gameequipment
(characterid, itemid) VALUES
(1, 1);

INSERT INTO gameinventory
(characterid, itemid, quantity, slot) VALUES
(1, 2, 1, 1);

INSERT INTO gameinventory
(characterid, itemid, quantity, slot) VALUES
(1, 3, 1, 2);
