--
-- PostgreSQL database dump
--
--
--SET statement_timeout = 0;
--SET lock_timeout = 0;
--SET client_encoding = 'UTF8';
--SET standard_conforming_strings = on;
--SET check_function_bodies = false;
--SET client_min_messages = warning;

--SET search_path = public, pg_catalog;

--SET default_tablespace = '';

--SET default_with_oids = false;

--
-- Name: gameitem; Type: TABLE; Schema: public; Owner: spacteria; Tablespace:
--

---CREATE TABLE gameitem (
--    uniqueid integer NOT NULL,
----    displayname character varying(100) NOT NULL,
----    description character varying(300),
----    itemtypeid integer NOT NULL,
----    stackable boolean NOT NULL,
--    levelreq integer NOT NULL,
--    tradeable boolean NOT NULL,
--    rarity integer NOT NULL,
--    sellvalue integer NOT NULL,
---    imageid integer NOT NULL,
---    stats json NOT NULL
--);


--ALTER TABLE public.gameitem OWNER TO spacteria;

--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE; Schema: public; Owner: spacteria
--

--CREATE SEQUENCE gameitem_uniqueid_seq
--    START WITH 1
--    INCREMENT BY 1
--    NO MINVALUE
--    NO MAXVALUE
--    CACHE 1;


--ALTER TABLE public.gameitem_uniqueid_seq OWNER TO spacteria;

--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: spacteria
--

--ALTER SEQUENCE gameitem_uniqueid_seq OWNED BY gameitem.uniqueid;


--
-- Name: uniqueid; Type: DEFAULT; Schema: public; Owner: spacteria
--

--ALTER TABLE ONLY gameitem ALTER COLUMN uniqueid SET DEFAULT nextval('gameitem_uniqueid_seq'::regclass);


--
-- Data for Name: gameitem; Type: TABLE DATA; Schema: public; Owner: spacteria
--

COPY gameitem (uniqueid, displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid, stats) FROM stdin;
5	Cell remains	nuff said	8	t	0	t	0	1	41	[]
6	Red bio-mass	Bio-mass from the\nslimelike creatures.	8	t	0	t	0	1	42	[]
7	Green bio-mass	Bio-mass from the \nslimelike creatures.	8	t	0	t	1	20	44	[]
1	Disinfectant Pistol	.22 Pistol with disinfectant\napplying adapter specifically\nmade for your mission.	3	f	0	t	0	1	2	[\n    {\n        "id": 4,\n        "value": 50\n    },\n    {\n        "id": 10,\n        "value": 6\n    },\n    {\n        "id": 11,\n        "value": 200\n    },\n    {\n        "id": 12,\n        "value": 1000\n    }\n]
2	LA-BB Double tazer v200	It has a worn out sticker: \n"Made in china"	3	f	4	f	0	4	3	[\n    {\n        "id": 3,\n        "value": -2\n    },\n    {\n        "id": 4,\n        "value": 150\n    },\n    {\n        "id": 10,\n        "value": 7\n    },\n    {\n        "id": 11,\n        "value": 250\n    },\n    {\n        "id": 12,\n        "value": 150\n    }\n]
3	Penicillin Syringe gun	Shoot out effective \nantibiotics in longer range\n	3	f	4	t	1	1	4	[\n    {\n        "id": 4,\n        "value": 230\n    },\n    {\n        "id": 5,\n        "value": -5\n    },\n    {\n        "id": 1,\n        "value": -20\n    },\n    {\n        "id": 10,\n        "value": 8\n    }\n]
8	Drained molecyloid shell	Its a sovenier..?	7	f	1	t	2	0	45	[]
9	Molecyloid fluid	Its an intact Molecyloid \nbubble. Better not\npoke it!	8	f	1	t	0	0	46	[]
10	Parasite worm	Its been living inside\nthat thing.	8	f	1	t	0	1	47	[]
4	Capsatriene Syringe gun	-	3	f	4	t	1	1	1	[\n    {\n        "id": 1,\n        "value": 1\n    }\n]
11	Weirdly shaped thing	Looks like molecyles...	8	f	1	t	0	0	48	[]
12	Blue plasma	It's... glowing?	8	f	1	t	3	0	49	[]
13	Ionizer	bzzt	3	f	6	t	2	20	6	[\n    {\n        "id": 4,\n        "value": 50\n    },\n{\n        "id": 3,\n        "value": 30\n    }\n]
14	Tester ticket	Wow. You managed\nto beat the game\nso far. Good job!\nBe sure to give\nme feedback.	8	f	1	t	1	1	65	[\n    {\n        "id": 1,\n        "value": 1337\n    }\n]
15	Dipole Suit	Dipole dipole bonds\nmake it strong.	4	f	6	t	2	20	22	[\n    {\n        "id": 4,\n        "value": 10\n    }\n]
16	Dipole Boots	Dipole dipole bonds\nmake it strong.	5	f	6	t	2	20	18	[\n    {\n        "id": 4,\n        "value": 10\n    }\n]
17	Dipole Leggings	Dipole dipole bonds\nmake it strong.	1	f	6	t	2	20	26	[\n    {\n        "id": 4,\n        "value": 10\n    }\n]
\.


--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE SET; Schema: public; Owner: spacteria
--

SELECT pg_catalog.setval('gameitem_uniqueid_seq', 17, true);


--
-- Name: gameitem_pkey; Type: CONSTRAINT; Schema: public; Owner: spacteria; Tablespace:
--

--ALTER TABLE ONLY gameitem
--    ADD CONSTRAINT gameitem_pkey PRIMARY KEY (uniqueid);


--
-- PostgreSQL database dump complete
--
