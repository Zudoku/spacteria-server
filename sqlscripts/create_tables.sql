CREATE TABLE gameuser
(
uniqueid SERIAL,
joined TIMESTAMP NOT NULL,
username varchar(60) NOT NULL,
password varchar(60) NOT NULL,
email varchar(100) NOT NULL,
PRIMARY KEY(uniqueid),
UNIQUE(username)
);

CREATE TABLE gamesessiontoken
(
uniqueid SERIAL,
userid INTEGER REFERENCES Gameuser(uniqueid),
token varchar(200) NOT NULL,
expires TIMESTAMP,
PRIMARY KEY(uniqueid)
);

CREATE TABLE gamecharacter
(
uniqueid SERIAL,
userid INTEGER REFERENCES Gameuser(uniqueid),
name varchar(60),
level INTEGER NOT NULL,
experience INTEGER NOT NULL,
created TIMESTAMP NOT NULL,
PRIMARY KEY(uniqueid),
UNIQUE(name)
);

CREATE TABLE gamecharactercurrency
(
characterid INTEGER REFERENCES gamecharacter(uniqueid) ON DELETE CASCADE,
coin INTEGER NOT NULL,
bugbounty INTEGER NOT NULL,
rollticket INTEGER NOT NULL
);

CREATE TABLE gameitem
(
uniqueid SERIAL,
displayname varchar(100) NOT NULL,
description varchar(300),
itemtypeid INTEGER NOT NULL,
stackable BOOLEAN NOT NULL,
levelreq INTEGER NOT NULL,
tradeable BOOLEAN NOT NULL,
rarity INTEGER NOT NULL,
sellvalue INTEGER NOT NULL,
imageid INTEGER NOT NULL,
stats json NOT NULL,
PRIMARY KEY(uniqueid)
);

CREATE TABLE gameequipment
(
characterid INTEGER REFERENCES gamecharacter(uniqueid) ON DELETE CASCADE,
itemid INTEGER NOT NULL
);

CREATE TABLE gameinventory
(
characterid INTEGER REFERENCES Gamecharacter(uniqueid) ON DELETE CASCADE,
itemid INTEGER NOT NULL,
quantity INTEGER NOT NULL,
slot INTEGER NOT NULL
);

-- LEADERBOARDS

CREATE TABLE bosskill
(
uniqueid SERIAL,
bossid INTEGER NOT NULL,
killtime INTEGER NOT NULL,
difficulty INTEGER NOT NULL,
achievedat TIMESTAMP,
participants json NOT NULL
);


INSERT INTO gameuser
(joined,username,password,email) VALUES
(CURRENT_TIMESTAMP,'testuser','1234567','aaaa@bbbbb.com');

INSERT INTO gamecharacter
(userid,name,level,experience,created) VALUES
(1,'foo',1,0,CURRENT_TIMESTAMP);

INSERT INTO gamecharactercurrency
(characterid,coin,bugbounty,rollticket) VALUES
(1,10,0,1);
