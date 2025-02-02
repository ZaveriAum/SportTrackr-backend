--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: color_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.color_enum AS ENUM (
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'black',
    'white',
    'gray',
    'brown',
    'pink',
    'cyan',
    'magenta',
    'lime',
    'teal',
    'beige',
    'cream',
    'turquoise',
    'peach',
    'lavender'
);


ALTER TYPE public.color_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: employee_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_roles (
    role_id smallint NOT NULL,
    employee_id bigint NOT NULL
);


ALTER TABLE public.employee_roles OWNER TO postgres;

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
    league_id integer NOT NULL
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
    logo_url character varying(255),
    description text
);


ALTER TABLE public.leagues OWNER TO postgres;

--
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.leagues ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.leagues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
    owner_id integer NOT NULL,
    captain_id integer NOT NULL,
    home_color public.color_enum,
    away_color public.color_enum,
    logo_url character varying(255),
    team_visibility boolean DEFAULT false,
    password character varying(255)
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
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    team_id bigint NOT NULL,
    status character varying(50) NOT NULL,
    amount bigint NOT NULL,
    intent_id character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    charge_id character varying(255) NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.transactions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
    created_at timestamp without time zone DEFAULT now(),
    team_id integer,
    account_id text,
    owner_status boolean DEFAULT false
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
-- Data for Name: employee_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_roles (role_id, employee_id) FROM stdin;
\.


--
-- Data for Name: highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.highlights (id, match_id, highlight_url, highlight_type, highlight_from) FROM stdin;
\.


--
-- Data for Name: league_emp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.league_emp (id, user_id, league_id) FROM stdin;
\.


--
-- Data for Name: league_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.league_roles (id, role_name) FROM stdin;
\.


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leagues (id, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time, league_name, logo_url, description) FROM stdin;
8	1	6	1000	20	15	2025-01-20 10:00:00	2025-04-20 10:00:00	Bundesliga	league-logos/952e0fc8-8352-47c8-b6eb-b0e65d95afe2-Bundesliga	\N
9	1	10	2000	40	11	2025-02-25 10:00:00	2025-05-23 10:00:00	Premier League	league-logos/71bea882-cc71-4457-9f0a-b8c53625d752-Premier League	\N
11	1	4	500	12	8	2025-01-28 16:00:00	2025-02-23 23:00:00	MLS	league-logos/6fee54f4-8ebc-433a-bab1-29f311188089-MLS	\N
12	1	11	2500	44	20	2025-01-10 10:30:00	2025-06-30 22:00:00	La Liga	league-logos/fdcd160b-627f-4ef6-b1f9-c7a224c2d9ff-La Liga	\N
13	1	6	1000	20	5	2025-09-11 14:30:00	2025-10-02 20:00:00	Ligue 1	league-logos/8d5fd404-ed89-4d43-8428-88d7dcdd8aef-Ligue 1	\N
14	1	10	3000	30	40	2025-02-11 10:30:00	2025-10-02 22:00:00	Seria A	league-logos/089b3ab6-c304-42cb-97c1-2410766ec77c-Seria A	\N
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, home_team_id, away_team_id, match_time, forfeited) FROM stdin;
1	1	2	2025-01-28 16:35:40	f
2	2	1	2025-02-28 18:30:00	f
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

COPY public.teams (id, name, league_id, description, owner_id, captain_id, home_color, away_color, logo_url, team_visibility, password) FROM stdin;
1	Bayer Leverkusen	8	\N	39	39	white	red	team-logos/75955c14-1331-4386-b7a5-3288f624ed56-league-8-Bayer Leverkusen	t	\N
2	Real Madrid	8	\N	2	2	white	gray	team-logos/746b96c3-ef32-4aae-b9c0-309015dcbef5-league-8-Real Madrid	f	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, team_id, status, amount, intent_id, created_at, updated_at, charge_id) FROM stdin;
11	1	success	1000	pi_3QmtNWRwq83ArHb90ZkLIE62	2025-01-30 03:43:53.656445	2025-01-30 03:43:53.656445	cs_test_a18sEW7vmAu6cIM9KCeHxcZdpLWAKorcYN2xh052IggFkCeuXS8L704hra
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
2	1
3	1
4	1
5	1
6	1
7	1
8	1
9	1
10	1
11	1
12	1
1	1
1	2
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_stats (id, user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card, position_played) FROM stdin;
3	39	1	1	3	0	0	2	0	0	\N
4	40	1	0	2	1	3	1	1	0	\N
5	41	1	2	5	2	0	3	1	0	\N
6	42	1	0	1	0	4	0	0	0	\N
7	43	1	3	6	2	0	5	1	1	\N
8	44	1	0	1	0	1	2	2	0	\N
9	45	1	1	4	1	0	3	0	0	\N
10	46	1	2	7	3	0	4	1	0	\N
11	47	1	0	0	0	6	2	0	0	\N
12	48	1	1	3	0	0	3	1	0	\N
13	49	1	0	1	0	2	1	0	0	\N
14	2	1	0	1	1	0	3	0	0	\N
15	3	1	2	4	0	0	2	1	0	\N
16	4	1	1	5	2	0	3	0	0	\N
17	5	1	0	2	1	0	1	1	0	\N
18	6	1	0	3	0	0	4	2	0	\N
19	7	1	3	6	1	0	5	1	1	\N
20	8	1	0	0	1	3	2	0	0	\N
21	9	1	0	0	0	5	2	0	0	\N
22	10	1	2	3	2	0	3	0	0	\N
23	11	1	1	2	0	0	4	1	0	\N
24	12	1	0	1	0	0	2	0	0	\N
25	13	1	1	2	0	0	1	0	0	\N
27	39	2	1	3	0	0	2	0	0	\N
28	40	2	0	2	1	3	1	1	0	\N
29	41	2	2	5	2	0	3	1	0	\N
30	42	2	0	1	0	4	0	0	0	\N
32	44	2	0	1	0	1	2	2	0	\N
33	45	2	1	4	1	0	3	0	0	\N
34	46	2	2	7	3	0	4	1	0	\N
35	47	2	0	0	0	6	2	0	0	\N
36	48	2	1	3	0	0	3	1	0	\N
37	49	2	0	1	0	2	1	0	0	\N
38	2	2	0	1	1	0	3	0	0	\N
39	3	2	2	4	0	0	2	1	0	\N
40	4	2	1	5	2	0	3	0	0	\N
41	5	2	0	2	1	0	1	1	0	\N
42	6	2	0	3	0	0	4	2	0	\N
43	7	2	3	6	1	0	5	1	1	\N
44	8	2	0	0	1	3	2	0	0	\N
45	9	2	0	0	0	5	2	0	0	\N
46	10	2	2	3	2	0	3	0	0	\N
47	11	2	1	2	0	0	4	1	0	\N
48	12	2	0	1	0	0	2	0	0	\N
49	13	2	1	2	0	0	1	0	0	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, picture_url, created_at, team_id, account_id, owner_status) FROM stdin;
42	Eric	Dier	ericdier@gmail.com	$2b$10$ruNH.w4TwQRVd6mW1z18TevCbhFRjxJvGcyFo/RXbT4za2pL6bT4C	\N	2025-01-20 21:06:16.91512	1	acct_1QmLUARv0Ud3G2cP	f
43	Alphonso	Davies	alphonsodavies@gmail.com	$2b$10$pvGkaoNcaTH2wHibHrkht.KTjFkssVlzdibaM4sofe0vV2ADIYOCW	\N	2025-01-20 21:06:38.995511	1	acct_1QmLQWRrqBSWHse0	f
44	Aleksandar	Pavlović	aleksandarpavlovic@gmail.com	$2b$10$SZ.e5PMD2rWxvY9UoYe48OJF76PyAC.iXJY1HOidqX1p1DSJb0PfG	\N	2025-01-20 21:08:17.015221	1	acct_1QmLX1RxYgByxzle	f
45	Leon	Goretzka	leongoretzka@gmail.com	$2b$10$e1ohhToKOpwpDuCE7b6EZOg/GYfR1FVjFl7eRG1wxzbqUei3l.NPi	\N	2025-01-20 21:10:44.457261	1	acct_1Qm9EH2Kb1BKZnMk	f
46	Joshua	Kimmich	joshuakimmich@gmail.com	$2b$10$Fh5CA6bF6HRusWZYpZnaQey8ujwO5mHH8EaJrxWjayZxTKDosbTkm	\N	2025-01-20 21:11:12.671125	1	acct_1Qm8Jw2N6mV3XHlH	f
47	Kingsley	Coman	kingsleycoman@gmail.com	$2b$10$lt7GuhiQrWO5CIEtjKNfGO7B8N/22cPZ/69I8Ghi4uOb5252fsVWi	\N	2025-01-20 21:11:43.759303	1	acct_1Qm7cQRxpdF3cOR9	f
48	Leroy	Sane	leroysane@gmail.com	$2b$10$WX32rraIA5LVYqGyxUcfUudYkFLV2q9zam4cv2ZoyxmVXpvHiPjya	\N	2025-01-20 21:12:13.786828	1	acct_1Qm7YGRsgFaPAEfh	f
49	Serge	Gnabry	sergegnabry@gmail.com	$2b$10$EJKdoU4m6s/h2RwtFXXpCes7y3Tjky4N0TUwRbgz6g1gyawJV13Iq	\N	2025-01-20 21:12:35.933816	1	acct_1Qm6m02Ko0Pc1TLf	f
39	Jamal	Musiala	jamalmusiala@gmail.com	$2b$10$Z.zQf1HO5pxZTtSTBPethewXXAaCm6uysfpc0xgsSq9eGd5B9cXyW	\N	2025-01-20 21:00:34.109821	1	acct_1Qm3lc2KuRfs3OTZ	t
40	Manuel	Neuer	manuelneuer@gmail.com	$2b$10$8ecs4c1ECEqrk/puV8jvY.orO2hl9/ZjrA8hF0nvFWlMinQQ2PNri	\N	2025-01-20 21:04:12.690056	1	acct_1Qm6Y72NIjp1YceJ	f
41	Dayot	Upamecano	dayotupamecano@gmail.com	$2b$10$NkS0jnmGbURVQWfXkSZEQ.VrJAR0U5eKLjT3kbx7vE2nOseFMZDSu	\N	2025-01-20 21:05:09.693307	1	acct_1Qm7YGRsgFaPAEfh	f
9	Thibaut	Courtois	thibautcourtois@gmail.com	$2b$10$j5mkkGgEIMSLz41MHBGThu02OL08cc6Zts47k1gytiBJI7avjwcU.	\N	2025-01-28 14:50:47.610356	2	\N	f
10	Eduardo	Camavinga	eduardocamavinga@gmail.com	$2b$10$Y4KpQVWMQE7wNYKEa.a7IercW673smGKjsWA9ZuGOjbxHWkrAtI9m	\N	2025-01-28 14:51:21.746216	2	\N	f
11	Brahim	Díaz	brahimdiaz@gmail.com	$2b$10$g/MPTzfOjNd286v5u9bw.u422qgJfMdGpMw.ocRvRsMvVZpOufRVS	\N	2025-01-28 14:51:51.692192	2	\N	f
1	Elio	Fezollari	fezollarielio@gmail.com	$2b$10$cfj3akmM1.hYurIM2.2rZ./SqNevGg6XjF.5pEIDvKLWbiqEBYoRy	\N	2025-01-20 21:14:59.290939	\N	\N	f
2	Jude	Bellingham	judebellingham@gmail.com	$2b$10$SgHdxdMeXzFzLxiDjA7cW.dRT3QM7OA2TxHfIlNhX0SHYX2ZGWIVm	\N	2025-01-28 14:46:21.13231	2	\N	t
3	Kylian	Mbappe	kylianmbappe@gmail.com	$2b$10$CBm6L2MIGOdFt9nn74zViujjBnztHEAHIaJcB0PHHMz53h/0HAonq	\N	2025-01-28 14:46:52.822253	2	\N	f
4	Vinicius	Junior	viniciusjunior@gmail.com	$2b$10$fcyNrb5zKvw/.Lr7saCn5uTNWYcYlgLXjRpyDuMDWTyN9vSoiQkL2	\N	2025-01-28 14:47:40.553291	2	\N	f
5	Rodrygo	Silva de Goes	rodrygosilva@gmail.com	$2b$10$gd1X1iz9.UJXPFBG.Juokegvd7nQa7W9aiGoVVAFF5vj9BqTl4bE6	\N	2025-01-28 14:48:25.844735	2	\N	f
6	Raúl	Asencio	raulasencio@gmail.com	$2b$10$2GAPnUQBbsFfGICIOZWZ1u93YTcXo.19BTGHPOBUQtjIxHNf0arGu	\N	2025-01-28 14:49:02.801719	2	\N	f
7	Arda	Güler	ardaguler@gmail.com	$2b$10$rCKnkw25nZSCTb4RTVYnkuFuvQChbdrxdLWr/BecBxpvWits7UMWi	\N	2025-01-28 14:49:31.456409	2	\N	f
8	Federico	Valverde	fredericovalverde@gmail.com	$2b$10$HfkDMk0MERk1XccnPvg/W.xhV5/XrAASErKMMikt0hc0Ddi86G4Ui	\N	2025-01-28 14:50:20.168833	2	\N	f
12	David	Alaba	davidalaba@gmail.com	$2b$10$eE58VboH4dp.dklQOX95C.oW/U.DAzduommWnuYUn3M48aUCzkSqW	\N	2025-01-28 14:52:17.862394	2	\N	f
13	Luka	Modric	lukamodric@gmail.com	$2b$10$e2WRFnaf7dQCMS.QjkyI3u.BJH2I.7ef37hcobM2FD.KB2YLPtus.	\N	2025-01-28 14:45:33.166418	2	\N	f
14	Aum	Zaveri	aumzaveri06@gmail.com	$2b$10$KHqAQBDwxgUVs0BTqUYIv.x3OqgzsJ80FacdxBoYTcH5dWF.rEwlK	profile-photo/4dff638c-abdc-46ad-992d-0a86a5090e2a-WhatsApp Image 2021-09-20 at 12.46.36 PM.jpeg	2025-01-29 10:35:11.701691	\N	acct_1QmrbR2Lol7xYxQb	f
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
-- Name: leagues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leagues_id_seq', 1, false);


--
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matches_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 43, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 11, true);


--
-- Name: user_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_stats_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: employee_roles employee_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_pkey PRIMARY KEY (role_id, employee_id);


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
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


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
-- Name: employee_roles employee_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_id FOREIGN KEY (employee_id) REFERENCES public.league_emp(id) NOT VALID;


--
-- Name: users fk_team_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: employee_roles role_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT role_id FOREIGN KEY (role_id) REFERENCES public.league_roles(id) NOT VALID;


--
-- Name: transactions team_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.teams(id);


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

