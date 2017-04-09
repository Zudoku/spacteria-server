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
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue) VALUES
('Test item 1', 'no desc', 1,TRUE,1,FALSE, 1, 100);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue) VALUES
('Test item 2', 'no desc', 1,TRUE,1,FALSE, 1, 100);

INSERT INTO gameitem
(displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue) VALUES
('Test item 3', 'no desc', 1,TRUE,1,FALSE, 1, 100);
