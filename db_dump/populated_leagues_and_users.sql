--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: highlights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.highlights (
    id integer NOT NULL,
    match_id integer NOT NULL,
    highlight_url character varying(2083),
    highlight_type character varying(50),
    highlight_from integer NOT NULL
);


ALTER TABLE public.highlights OWNER TO postgres;

--
-- Name: highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.highlights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.highlights_id_seq OWNER TO postgres;

--
-- Name: highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.highlights_id_seq OWNED BY public.highlights.id;


--
-- Name: league_emp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.league_emp (
    id integer NOT NULL,
    user_id integer NOT NULL,
    league_id integer NOT NULL,
    league_role_id integer NOT NULL
);


ALTER TABLE public.league_emp OWNER TO postgres;

--
-- Name: league_emp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.league_emp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.league_emp_id_seq OWNER TO postgres;

--
-- Name: league_emp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.league_emp_id_seq OWNED BY public.league_emp.id;


--
-- Name: league_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.league_roles (
    id integer NOT NULL,
    role_name character varying(255) NOT NULL
);


ALTER TABLE public.league_roles OWNER TO postgres;

--
-- Name: league_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.league_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.league_roles_id_seq OWNER TO postgres;

--
-- Name: league_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.league_roles_id_seq OWNED BY public.league_roles.id;


--
-- Name: leagues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leagues (
    id integer NOT NULL,
    organizer_id integer NOT NULL,
    team_starter_size smallint NOT NULL,
    price integer NOT NULL,
    max_team_size smallint NOT NULL,
    game_amount smallint NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    league_name character varying(15),
    logo_url character varying(255)
);


ALTER TABLE public.leagues OWNER TO postgres;

--
-- Name: league_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.league_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.league_table_id_seq OWNER TO postgres;

--
-- Name: league_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.league_table_id_seq OWNED BY public.leagues.id;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    home_team_id integer NOT NULL,
    away_team_id integer NOT NULL,
    match_time timestamp without time zone NOT NULL,
    forfeited boolean DEFAULT false
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(5) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    league_id integer NOT NULL,
    description text,
    primary_color character varying(50) NOT NULL,
    secondary_color character varying(50) NOT NULL,
    owner_id integer NOT NULL,
    captain_id integer NOT NULL,
    wins smallint DEFAULT 0 NOT NULL,
    losses smallint DEFAULT 0 NOT NULL,
    draws smallint DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    goals_scored integer DEFAULT 0 NOT NULL,
    goals_conceded integer DEFAULT 0 NOT NULL,
    games_played smallint DEFAULT 0 NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_stats (
    id integer NOT NULL,
    user_id integer NOT NULL,
    match_id integer NOT NULL,
    goals integer DEFAULT 0 NOT NULL,
    shots integer DEFAULT 0 NOT NULL,
    assists integer DEFAULT 0 NOT NULL,
    saves integer DEFAULT 0 NOT NULL,
    interceptions integer DEFAULT 0 NOT NULL,
    yellow_card integer DEFAULT 0 NOT NULL,
    red_card integer DEFAULT 0 NOT NULL,
    position_played character varying(50)
);


ALTER TABLE public.user_stats OWNER TO postgres;

--
-- Name: user_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_stats_id_seq OWNER TO postgres;

--
-- Name: user_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_stats_id_seq OWNED BY public.user_stats.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    picture_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: highlights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights ALTER COLUMN id SET DEFAULT nextval('public.highlights_id_seq'::regclass);


--
-- Name: league_emp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp ALTER COLUMN id SET DEFAULT nextval('public.league_emp_id_seq'::regclass);


--
-- Name: league_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_roles ALTER COLUMN id SET DEFAULT nextval('public.league_roles_id_seq'::regclass);


--
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.league_table_id_seq'::regclass);


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: user_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats ALTER COLUMN id SET DEFAULT nextval('public.user_stats_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.highlights (id, match_id, highlight_url, highlight_type, highlight_from) FROM stdin;
\.


--
-- Data for Name: league_emp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.league_emp (id, user_id, league_id, league_role_id) FROM stdin;
\.


--
-- Data for Name: league_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.league_roles (id, role_name) FROM stdin;
\.


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leagues (id, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time, league_name, logo_url) FROM stdin;
8	50	6	1000	20	15	2025-01-20 10:00:00	2025-04-20 10:00:00	Bundesliga	league-logos/952e0fc8-8352-47c8-b6eb-b0e65d95afe2-Bundesliga
9	50	10	2000	40	11	2025-02-25 10:00:00	2025-05-23 10:00:00	Premier League	league-logos/71bea882-cc71-4457-9f0a-b8c53625d752-Premier League
11	50	4	500	12	8	2025-01-28 16:00:00	2025-02-23 23:00:00	MLS	league-logos/6fee54f4-8ebc-433a-bab1-29f311188089-MLS
12	50	11	2500	44	20	2025-01-10 10:30:00	2025-06-30 22:00:00	La Liga	league-logos/fdcd160b-627f-4ef6-b1f9-c7a224c2d9ff-La Liga
13	50	6	1000	20	5	2025-09-11 14:30:00	2025-10-02 20:00:00	Ligue 1	league-logos/8d5fd404-ed89-4d43-8428-88d7dcdd8aef-Ligue 1
14	50	10	3000	30	40	2025-02-11 10:30:00	2025-10-02 22:00:00	Seria A	league-logos/089b3ab6-c304-42cb-97c1-2410766ec77c-Seria A
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, home_team_id, away_team_id, match_time, forfeited) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name) FROM stdin;
1	user
2	admin
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, league_id, description, primary_color, secondary_color, owner_id, captain_id, wins, losses, draws, points, goals_scored, goals_conceded, games_played) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
39	1
40	1
41	1
42	1
43	1
44	1
45	1
46	1
47	1
48	1
49	1
50	1
50	2
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_stats (id, user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card, position_played) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, picture_url, created_at) FROM stdin;
42	Eric	Dier	ericdier@gmail.com	$2b$10$ruNH.w4TwQRVd6mW1z18TevCbhFRjxJvGcyFo/RXbT4za2pL6bT4C	\N	2025-01-20 21:06:16.91512
39	Jamal	Musiala	jamalmusiala@gmail.com	$2b$10$Z.zQf1HO5pxZTtSTBPethewXXAaCm6uysfpc0xgsSq9eGd5B9cXyW	\N	2025-01-20 21:00:34.109821
40	Manuel	Neuer	manuelneuer@gmail.com	$2b$10$8ecs4c1ECEqrk/puV8jvY.orO2hl9/ZjrA8hF0nvFWlMinQQ2PNri	\N	2025-01-20 21:04:12.690056
41	Dayot	Upamecano	dayotupamecano@gmail.com	$2b$10$NkS0jnmGbURVQWfXkSZEQ.VrJAR0U5eKLjT3kbx7vE2nOseFMZDSu	\N	2025-01-20 21:05:09.693307
43	Alphonso	Davies	alphonsodavies@gmail.com	$2b$10$pvGkaoNcaTH2wHibHrkht.KTjFkssVlzdibaM4sofe0vV2ADIYOCW	\N	2025-01-20 21:06:38.995511
44	Aleksandar	Pavlović	aleksandarpavlovic@gmail.com	$2b$10$SZ.e5PMD2rWxvY9UoYe48OJF76PyAC.iXJY1HOidqX1p1DSJb0PfG	\N	2025-01-20 21:08:17.015221
45	Leon	Goretzka	leongoretzka@gmail.com	$2b$10$e1ohhToKOpwpDuCE7b6EZOg/GYfR1FVjFl7eRG1wxzbqUei3l.NPi	\N	2025-01-20 21:10:44.457261
46	Joshua	Kimmich	joshuakimmich@gmail.com	$2b$10$Fh5CA6bF6HRusWZYpZnaQey8ujwO5mHH8EaJrxWjayZxTKDosbTkm	\N	2025-01-20 21:11:12.671125
47	Kingsley	Coman	kingsleycoman@gmail.com	$2b$10$lt7GuhiQrWO5CIEtjKNfGO7B8N/22cPZ/69I8Ghi4uOb5252fsVWi	\N	2025-01-20 21:11:43.759303
48	Leroy	Sane	leroysane@gmail.com	$2b$10$WX32rraIA5LVYqGyxUcfUudYkFLV2q9zam4cv2ZoyxmVXpvHiPjya	\N	2025-01-20 21:12:13.786828
49	Serge	Gnabry	sergegnabry@gmail.com	$2b$10$EJKdoU4m6s/h2RwtFXXpCes7y3Tjky4N0TUwRbgz6g1gyawJV13Iq	\N	2025-01-20 21:12:35.933816
50	Elio	Fezollari	fezollarielio@gmail.com	$2b$10$cfj3akmM1.hYurIM2.2rZ./SqNevGg6XjF.5pEIDvKLWbiqEBYoRy	\N	2025-01-20 21:14:59.290939
\.


--
-- Name: highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.highlights_id_seq', 1, false);


--
-- Name: league_emp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.league_emp_id_seq', 1, false);


--
-- Name: league_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.league_roles_id_seq', 1, false);


--
-- Name: league_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.league_table_id_seq', 14, true);


--
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matches_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: user_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_stats_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 50, true);


--
-- Name: highlights highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT highlights_pkey PRIMARY KEY (id);


--
-- Name: league_emp league_emp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp
    ADD CONSTRAINT league_emp_pkey PRIMARY KEY (id);


--
-- Name: league_emp league_emp_user_id_league_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp
    ADD CONSTRAINT league_emp_user_id_league_id_key UNIQUE (user_id, league_id);


--
-- Name: league_roles league_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_roles
    ADD CONSTRAINT league_roles_pkey PRIMARY KEY (id);


--
-- Name: league_roles league_roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_roles
    ADD CONSTRAINT league_roles_role_name_key UNIQUE (role_name);


--
-- Name: leagues league_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT league_table_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: teams teams_name_league_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_name_league_id_key UNIQUE (name, league_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- Name: user_stats user_stats_user_id_match_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_match_id_key UNIQUE (user_id, match_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: highlights highlights_highlight_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT highlights_highlight_from_fkey FOREIGN KEY (highlight_from) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: highlights highlights_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT highlights_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: league_emp league_emp_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp
    ADD CONSTRAINT league_emp_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE;


--
-- Name: league_emp league_emp_league_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp
    ADD CONSTRAINT league_emp_league_role_id_fkey FOREIGN KEY (league_role_id) REFERENCES public.league_roles(id) ON DELETE RESTRICT;


--
-- Name: league_emp league_emp_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.league_emp
    ADD CONSTRAINT league_emp_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leagues league_table_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT league_table_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id);


--
-- Name: matches matches_away_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: matches matches_home_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: teams teams_captain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES public.users(id);


--
-- Name: teams teams_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE;


--
-- Name: teams teams_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_stats user_stats_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

