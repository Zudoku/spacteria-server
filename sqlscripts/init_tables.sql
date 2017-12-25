CREATE TABLE gameuser
(
uniqueid SERIAL,
joined TIMESTAMP NOT NULL,
token varchar(4097) NOT NULL,
email varchar(100) NOT NULL,
PRIMARY KEY(uniqueid),
UNIQUE(email),
UNIQUE(token)
);

CREATE TABLE gameregistertoken
(
uniqueid SERIAL,
token varchar(257) NOT NULL,
socketid varchar(100) NOT NULL,
openregister BOOLEAN NOT NULL,
allowgoogle BOOLEAN NOT NULL,
registercomplete BOOLEAN NOT NULL,
nullified BOOLEAN NOT NULL,
expires TIMESTAMP,
PRIMARY KEY(uniqueid),
UNIQUE(token)
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
