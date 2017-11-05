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
PRIMARY KEY(uniqueid)
);

CREATE TABLE gameitemattribute
(
itemid INTEGER REFERENCES gameitem(uniqueid),
attributeid INTEGER NOT NULL,
attributevalue INTEGER NOT NULL
);

CREATE TABLE gameequipment
(
characterid INTEGER REFERENCES gamecharacter(uniqueid) ON DELETE CASCADE,
itemid INTEGER REFERENCES gameitem(uniqueid)
);

CREATE TABLE gameinventory
(
characterid INTEGER REFERENCES Gamecharacter(uniqueid) ON DELETE CASCADE,
itemid INTEGER REFERENCES Gameitem(uniqueid),
quantity INTEGER NOT NULL,
slot INTEGER NOT NULL
);
