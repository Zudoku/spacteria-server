INSERT INTO gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO gamecharacter
(userid,name,level,experience,created) VALUES
(1,'foo',1,0,CURRENT_TIMESTAMP);

INSERT INTO gamecharactercurrency
(characterid,coin,bugbounty,rollticket) VALUES
(1,10,0,1);
