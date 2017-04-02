INSERT INTO TABLE gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO TABLE gamecharacter
(userid,name,class,level,experience,created) VALUES
(1,'foo',1,1,0,CURRENT_TIMESTAMP);

INSERT INTO TABLE gamecharacter
(userid,name,class,level,experience,created) VALUES
(1,'bar',2,1,0,CURRENT_TIMESTAMP);
