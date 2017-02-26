CREATE TABLE User
(
uniqueid SERIAL,
joined TIMESTAMP NOT NULL,
username varchar(60) NOT NULL,
password varchar(60) NOT NULL,
email varchar(60) NOT NULL,
PRIMARY KEY(uniqueid),
UNIQUE(username)
);

CREATE TABLE Sessiontoken
(
uniqueid SERIAL,
userid INTEGER REFERENCES User(uniqueid),
token varchar(200) NOT NULL,
expires TIMESTAMP,
PRIMARY KEY(uniqueid)
);

CREATE TABLE Character
(
uniqueid SERIAL,
userid INTEGER REFERENCES User(uniqueid),
name varchar(60),
class INTEGER NOT NULL,
level INTEGER NOT NULL,
experience INTEGER NOT NULL,
created TIMESTAMP NOT NULL,
PRIMARY KEY(uniqueid),
UNIQUE(name)
);

CREATE TABLE Equipment
(

);
