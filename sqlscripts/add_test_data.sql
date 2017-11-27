INSERT INTO gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO gamecharacter
(userid,name,level,experience,created) VALUES
(1,'foo',1,0,CURRENT_TIMESTAMP);

INSERT INTO gamecharactercurrency
(characterid,coin,bugbounty,rollticket) VALUES
(1,10,0,1);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Fungus staff', 'something strange grows on it...', 3,TRUE,1,FALSE, 1, 1, 2);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(1, 1, 10);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(1, 3, 2);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(1, 4, 100);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Strident Blade', 'A relic from the previous adventurers', 3,FALSE,4,TRUE, 1, 10, 6);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(2, 3, 8);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(2, 4, 75);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Glob', 'Glob blob blob blll', 3,FALSE,2,TRUE, 1, 4, 12);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(3, 3, 4);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(3, 4, 75);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Deterrent Helmet', 'Effective against the slime', 0,FALSE,3,TRUE, 1, 5, 14);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(4, 2, 4);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid) VALUES
('Deterrent Chestplate', 'Effective against the slime', 4,FALSE,3,TRUE, 1, 5, 12);

INSERT INTO gameitemattribute
(itemid, attributeid, attributevalue) VALUES
(5, 5, 4);

INSERT INTO gameequipment
(characterid, itemid) VALUES
(1, 1);
