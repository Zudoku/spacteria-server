--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: gameitem; Type: TABLE; Schema: public; Owner: spacteria; Tablespace: 
--

CREATE TABLE gameitem (
    uniqueid integer NOT NULL,
    displayname character varying(100) NOT NULL,
    description character varying(300),
    itemtypeid integer NOT NULL,
    stackable boolean NOT NULL,
    levelreq integer NOT NULL,
    tradeable boolean NOT NULL,
    rarity integer NOT NULL,
    sellvalue integer NOT NULL,
    imageid integer NOT NULL,
    stats json NOT NULL
);


ALTER TABLE public.gameitem OWNER TO spacteria;

--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE; Schema: public; Owner: spacteria
--

CREATE SEQUENCE gameitem_uniqueid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gameitem_uniqueid_seq OWNER TO spacteria;

--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: spacteria
--

ALTER SEQUENCE gameitem_uniqueid_seq OWNED BY gameitem.uniqueid;


--
-- Name: uniqueid; Type: DEFAULT; Schema: public; Owner: spacteria
--

ALTER TABLE ONLY gameitem ALTER COLUMN uniqueid SET DEFAULT nextval('gameitem_uniqueid_seq'::regclass);


--
-- Data for Name: gameitem; Type: TABLE DATA; Schema: public; Owner: spacteria
--

COPY gameitem (uniqueid, displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid, stats) FROM stdin;
1	adasdiasdsad	-	1	f	1	t	1	1	1	[\n    {\n        "id": 1,\n        "value": 1\n    }\n]
2	wtf	wtf	1	f	1	t	1	1	1	[\n    {\n        "id": 1,\n        "value": 1\n    }\n]
3	heiii	-	1	f	1	t	1	1	1	[\n    {\n        "id": 1,\n        "value": 1\n    }\n]
\.


--
-- Name: gameitem_uniqueid_seq; Type: SEQUENCE SET; Schema: public; Owner: spacteria
--

SELECT pg_catalog.setval('gameitem_uniqueid_seq', 3, true);


--
-- Name: gameitem_pkey; Type: CONSTRAINT; Schema: public; Owner: spacteria; Tablespace: 
--

ALTER TABLE ONLY gameitem
    ADD CONSTRAINT gameitem_pkey PRIMARY KEY (uniqueid);


--
-- PostgreSQL database dump complete
--

