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
    position_played character varying(50),
    number integer
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
1	1
2	2
3	3
1	4
2	5
3	6
1	7
2	8
3	9
1	10
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
1	1	1
2	2	1
3	3	2
4	4	2
5	5	3
6	6	3
7	1	4
8	2	4
9	3	1
10	4	3
\.


--
-- Data for Name: league_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.league_roles (id, role_name) FROM stdin;
1	admin
2	statistician
3	referee
\.


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leagues (id, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time, league_name, logo_url, description) FROM stdin;
1	1	3	1000	10	20	2025-01-20 15:45:00	2025-03-20 15:45:00	Bundesliga	league-logos/6bf9526b-555c-41a8-9372-731673a4fe6d-Bundesliga	\N
2	1	6	1000	10	20	2026-01-20 15:45:00	2026-03-20 15:45:00	La Liga	league-logos/f64fbea5-3475-42be-951f-18f2f35762b8-La Liga	\N
3	1	6	1000	10	16	2025-01-26 12:45:00	2026-03-20 17:45:00	Premier League	league-logos/6110b15a-0c15-4efd-a0b5-a952cff3b06e-Premier League	\N
4	1	10	2000	20	26	2025-01-26 22:45:00	2025-02-20 19:45:00	Seria A	league-logos/afa1171b-382d-47d8-996b-caafe842dc68-Seria A	\N
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, home_team_id, away_team_id, match_time, forfeited) FROM stdin;
1	1	2	2025-02-15 18:00:00	f
2	1	3	2025-02-16 20:30:00	f
3	1	4	2025-02-17 17:45:00	f
4	1	2	2025-02-18 19:15:00	f
5	1	3	2025-02-19 21:00:00	f
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name) FROM stdin;
1	user
2	owner
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, league_id, description, owner_id, captain_id, home_color, away_color, logo_url, team_visibility, password) FROM stdin;
3	RB Leipzig	1	A rising power in German football.	3	3	red	white	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
4	Bayer Leverkusen	1	A consistent performer in Bundesliga.	4	4	red	black	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
5	Real Madrid	2	The most successful club in Europe.	5	5	white	blue	team-logos/ba970b8c-20f6-4cf6-a768-501ac048f9d3-league-8-Team 2	t	\N
6	Barcelona	2	A dominant force in Spanish football.	6	6	blue	red	team-logos/ba970b8c-20f6-4cf6-a768-501ac048f9d3-league-8-Team 2	t	\N
7	Atletico Madrid	2	A tough competitor with solid defense.	7	7	red	white	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
8	Sevilla	2	A club known for its Europa League success.	8	8	white	red	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
9	Manchester City	3	The reigning champions of England.	9	9	blue	white	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
10	Manchester United	3	A club with a rich history and legacy.	10	10	red	black	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
11	Liverpool	3	A club with passionate fans and strong performances.	11	11	red	white	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
12	Chelsea	3	A dominant English club with European success.	12	12	blue	white	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
13	Juventus	4	The most successful club in Italy.	13	13	black	white	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
14	Inter Milan	4	A club known for its defensive strength.	14	14	blue	black	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
15	AC Milan	4	One of the most successful clubs in Italy.	15	15	red	black	team-logos/e14958ee-b172-429e-88d7-5850e504b5d9-league-8-Team 2	t	\N
16	Napoli	4	A strong team with a passionate fan base.	16	16	blue	white	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
1	Bayern Munich	1	A top team in Germany.	2	1	red	white	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
2	Borussia Dortmund	1	A strong contender in Bundesliga.	17	2	yellow	black	team-logos/f801c6b7-2307-4962-86c7-7e55cc86376a-league-8-Team 5	t	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, team_id, status, amount, intent_id, created_at, updated_at, charge_id) FROM stdin;
4	1	success	50	pi_1234567890	2024-02-06 10:15:00	2024-02-06 10:15:00	ch_9876543210
5	1	success	75	pi_2234567891	2024-02-06 10:20:00	2024-02-06 10:25:00	ch_9876543211
6	2	success	100	pi_3234567892	2024-02-06 10:30:00	2024-02-06 10:30:00	ch_9876543211
7	1	success	120	pi_4234567893	2024-02-06 10:40:00	2024-02-06 10:40:00	ch_9876543211
8	1	success	90	pi_5234567894	2024-02-06 10:50:00	2024-02-06 10:55:00	ch_9876543214
9	2	success	200	pi_6234567895	2024-02-06 11:00:00	2024-02-06 11:00:00	ch_9876543211
10	2	success	150	pi_7234567896	2024-02-06 11:10:00	2024-02-06 11:15:00	ch_9876543216
11	1	success	80	pi_8234567897	2024-02-06 11:20:00	2024-02-06 11:20:00	ch_9876543211
12	2	success	300	pi_9234567898	2024-02-06 11:30:00	2024-02-06 11:30:00	ch_9876543211
13	1	success	45	pi_1023456789	2024-02-06 11:40:00	2024-02-06 11:45:00	ch_9876543219
14	1	success	250	pi_1123456789	2024-02-06 11:50:00	2024-02-06 11:50:00	ch_9876543211
15	2	success	180	pi_1223456789	2024-02-06 12:00:00	2024-02-06 12:05:00	ch_9876543221
16	2	success	400	pi_1323456789	2024-02-06 12:10:00	2024-02-06 12:10:00	ch_9876543211
17	2	success	500	pi_1423456789	2024-02-06 12:20:00	2024-02-06 12:25:00	ch_9876543223
18	2	success	600	pi_1523456789	2024-02-06 12:30:00	2024-02-06 12:30:00	ch_9876543211
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	1
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
13	1
14	1
15	1
16	1
17	1
18	1
19	1
20	1
21	1
22	1
23	1
24	1
25	1
26	1
27	1
28	1
29	1
30	1
31	1
32	1
33	1
34	1
35	1
36	1
37	1
38	1
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
51	1
52	1
53	1
54	1
55	1
56	1
57	1
58	1
59	1
60	1
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_stats (id, user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card, position_played, number) FROM stdin;
1	1	1	2	5	1	0	3	0	0	Forward	9
2	2	1	1	3	0	0	2	1	0	Midfielder	10
3	3	1	0	2	1	4	1	0	0	Goalkeeper	1
4	4	2	1	4	1	0	3	1	0	Forward	11
5	5	2	0	1	0	2	1	0	0	Defender	2
6	6	2	2	6	2	0	4	1	0	Midfielder	7
7	1	3	1	3	0	0	4	0	0	Forward	9
8	2	3	2	4	1	0	3	1	0	Midfielder	10
9	3	3	0	2	0	2	2	0	0	Goalkeeper	1
10	4	4	1	4	0	1	3	1	0	Forward	11
11	5	4	0	1	1	0	2	0	0	Defender	2
12	6	4	2	5	2	0	4	1	0	Midfielder	7
13	1	5	1	2	1	0	3	0	0	Forward	9
14	2	5	0	3	2	0	2	1	0	Midfielder	10
15	3	5	0	2	1	1	3	0	0	Goalkeeper	1
16	4	5	2	3	0	1	4	1	0	Forward	11
17	5	5	1	4	0	1	2	1	0	Defender	2
18	6	5	0	2	1	0	3	0	0	Midfielder	7
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, picture_url, created_at, team_id, account_id, owner_status) FROM stdin;
2	Jamal	Musiala	jamalmusiala@gmail.com	$2b$10$P.bdaXQaPInIv5TqqdJifuSEwRCb0xZ3a/DT67puGRpeEggy98l86	\N	2025-02-07 14:54:59.007791	1	acct_1QmnGc2K9wpSDFwj	f
3	Leon	Goretzka	leongoretzka@gmail.com	$2b$10$9HQNCPrIWjhcTTxLsMdr9uvOaoseRDUbtY7doYuWdHhGJabVsgu0a	\N	2025-02-07 14:55:42.672843	1	acct_1QmnGc2K9wpSDFwj	f
4	Dayot	Upamecano	dayotupamecano@gmail.com	$2b$10$08y6j/rPtekXrZ9fkjBcfe4ntCs8VjBALdot8EZsDLmklv34mSlWi	\N	2025-02-07 14:56:39.049045	1	acct_1QmnGc2K9wpSDFwj	f
5	Thomas	Müller	thomasmuller@gmail.com	$2b$10$KJHlNvMh1nZvHSvPq5oHpOuy4Q66JxLeFm9FkWhrxg3p9KhTZ/0uS	\N	2025-02-07 15:00:00.123456	1	acct_1QmnGc2K9wpSDFwj	f
6	Manuel	Neuer	manuelneuer@gmail.com	$2b$10$vP9lJd2WnA3QXhF5oZLKjOBjJX3n6ZjJ1y6TgEZxIQwJ7BOBZoFTK	\N	2025-02-07 15:01:10.987654	1	acct_1QmnGc2K9wpSDFwj	f
7	Joshua	Kimmich	joshuakimmich@gmail.com	$2b$10$yYpKT3OYVJNAjLg1wnj8Ce2WTy1ZwVp4Ex2rNydZ2AFQvX6RkFu7y	\N	2025-02-07 15:02:30.456789	2	acct_1QmnGc2K9wpSDFwj	f
8	Serge	Gnabry	sergegnabry@gmail.com	$2b$10$98XKJvhXWh/J2NexV3tOJuCB1G.VeD7QUK5W9yBZ/FoEZslz1BRQq	\N	2025-02-07 15:03:25.654321	2	acct_1QmnGc2K9wpSDFwj	f
9	Leroy	Sané	leroysane@gmail.com	$2b$10$aJHYnX8yFz5E2B6Lx0M2nOjFQ9LpE3RBWZ5ZKj7QvJLX8Xh1NPvKy	\N	2025-02-07 15:04:45.789123	2	acct_1QmnGc2K9wpSDFwj	f
10	Alphonso	Davies	alphonsodavies@gmail.com	$2b$10$F6QjMT5WzV3X2bNqJ5lZ2VXPB6KZ7NQJH0Yp8XWLJ4E2XJ1z9MKTq	\N	2025-02-07 15:05:55.321987	2	acct_1QmnGc2K9wpSDFwj	f
11	Eric	Choupo-Moting	ericchoupo@gmail.com	$2b$10$PJK3X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKT	\N	2025-02-07 15:06:50.654987	2	acct_1QmnGc2K9wpSDFwj	f
12	Konrad	Laimer	konradlaimer@gmail.com	$2b$10$X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLY	\N	2025-02-07 15:07:35.456213	2	acct_1QmnGc2K9wpSDFwj	f
13	Kim	Min-jae	kimminjae@gmail.com	$2b$10$J7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLM	\N	2025-02-07 15:08:40.789654	3	acct_1QmnGc2K9wpSDFwj	f
14	Matthijs	de Ligt	matthijsdeligt@gmail.com	$2b$10$9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5YXKZ	\N	2025-02-07 15:09:20.987321	3	acct_1QmnGc2K9wpSDFwj	f
15	Raphael	Guerreiro	raphaelguerreiro@gmail.com	$2b$10$JZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NML	\N	2025-02-07 15:10:30.123789	3	acct_1QmnGc2K9wpSDFwj	f
16	Paul	Wanner	paulwanner@gmail.com	$2b$10$YpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQL	\N	2025-02-07 15:11:25.654987	3	acct_1QmnGc2K9wpSDFwj	f
17	Tarek	Buchmann	tarekbuchmann@gmail.com	$2b$10$JZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NML	\N	2025-02-07 15:12:50.456321	3	acct_1QmnGc2K9wpSDFwj	f
18	Gabriel	Vidovic	gabrielvidovic@gmail.com	$2b$10$Z9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5YXK	\N	2025-02-07 15:13:40.987123	4	acct_1QmnGc2K9wpSDFwj	f
19	Mahmoud	Dahoud	mahmouddahoud@gmail.com	$2b$10$XJ5vBKTPLMJ7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7Q	\N	2025-02-07 15:14:55.321789	4	acct_1QmnGc2K9wpSDFwj	f
20	Florian	Wirtz	florianwirtz@gmail.com	$2b$10$PLMJ7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKT	\N	2025-02-07 15:15:30.456987	4	acct_1QmnGc2K9wpSDFwj	f
21	Kai	Havertz	kaihavertz@gmail.com	$2b$10$MJ7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPL	\N	2025-02-07 15:16:45.789654	4	acct_1QmnGc2K9wpSDFwj	f
22	Timo	Werner	timowerner@gmail.com	$2b$10$NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1	\N	2025-02-07 15:17:20.987123	5	acct_1QmnGc2K9wpSDFwj	f
23	Jonathan	Tah	jonathantah@gmail.com	$2b$10$JZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NML	\N	2025-02-07 15:18:55.321987	5	acct_1QmnGc2K9wpSDFwj	f
24	Niklas	Süle	niklassule@gmail.com	$2b$10$YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5	\N	2025-02-07 15:19:40.456321	5	acct_1QmnGc2K9wpSDFwj	f
25	Robin	Gosens	robingosens@gmail.com	$2b$10$QpT7eXneC6ihDQBJtF4e01vi5EeGEY81VRlPFLQiMO5CaXdtmb8F	\N	2025-02-07 15:20:55.987654	5	acct_1QmnGc2K9wpSDFwj	f
26	Ilkay	Gündogan	ilkaygundogan@gmail.com	$2b$10$P.bdaXQaPInIv5TqqdJifuSEwRCb0xZ3a/DT67puGRpeEggy98ly2	\N	2025-02-07 15:21:40.654321	6	acct_1QmnGc2K9wpSDFwj	f
27	Toni	Kroos	tonikroos@gmail.com	$2b$10$9HQNCPrIWjhcTTxLsMdr9uvOaoseRDUbtY7doYuWdHhGJabVsgut2	\N	2025-02-07 15:22:30.123789	6	acct_1QmnGc2K9wpSDFwj	f
28	Marc-André	ter Stegen	marcandreterstegen@gmail.com	$2b$10$08y6j/rPtekXrZ9fkjBcfe4ntCs8VjBALdot8EZsDLmklv34mSlFT	\N	2025-02-07 15:23:50.789654	6	acct_1QmnGc2K9wpSDFwj	f
29	Kevin	Trapp	kevintrapp@gmail.com	$2b$10$JHlNvMh1nZvHSvPq5oHpOuy4Q66JxLeFm9FkWhrxg3p9KhTZ/0lP2	\N	2025-02-07 15:24:15.321987	7	acct_1QmnGc2K9wpSDFwj	f
30	Lukas	Klostermann	lukasklostermann@gmail.com	$2b$10$vP9lJd2WnA3QXhF5oZLKjOBjJX3n6ZjJ1y6TgEZxIQwJ7BOBZoXLT	\N	2025-02-07 15:25:40.456321	7	acct_1QmnGc2K9wpSDFwj	f
31	Emre	Can	emrecan@gmail.com	$2b$10$yYpKT3OYVJNAjLg1wnj8Ce2WTy1ZwVp4Ex2rNydZ2AFQvX6RkFuYP2	\N	2025-02-07 15:26:25.654987	7	acct_1QmnGc2K9wpSDFwj	f
32	David	Raum	davidraum@gmail.com	$2b$10$98XKJvhXWh/J2NexV3tOJuCB1G.VeD7QUK5W9yBZ/FoEZslz1BRnT	\N	2025-02-07 15:27:30.789321	7	acct_1QmnGc2K9wpSDFwj	f
33	Benjamin	Henrichs	benjaminhenrichs@gmail.com	$2b$10$aJHYnX8yFz5E2B6Lx0M2nOjFQ9LpE3RBWZ5ZKj7QvJLX8Xh1NPvML	\N	2025-02-07 15:28:50.987123	7	acct_1QmnGc2K9wpSDFwj	f
34	Antonio	Rüdiger	antonioruediger@gmail.com	$2b$10$F6QjMT5WzV3X2bNqJ5lZ2VXPB6KZ7NQJH0Yp8XWLJ4E2XJ1z9MTL	\N	2025-02-07 15:29:25.321789	8	acct_1QmnGc2K9wpSDFwj	f
35	Sandro	Wagner	sandrowagner@gmail.com	$2b$10$PJK3X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vNYT	\N	2025-02-07 15:30:40.456987	8	acct_1QmnGc2K9wpSDFwj	f
36	Maximilian	Arnold	maximilianarnold@gmail.com	$2b$10$X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTNM2	\N	2025-02-07 15:31:50.789654	8	acct_1QmnGc2K9wpSDFwj	f
37	Julian	Brandt	julianbrandt@gmail.com	$2b$10$J7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPML	\N	2025-02-07 15:32:45.123321	8	acct_1QmnGc2K9wpSDFwj	f
38	Armel	Bella-Kotchap	armelbellakotchap@gmail.com	$2b$10$9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5YXKZ	\N	2025-02-07 15:33:50.987654	9	acct_1QmnGc2K9wpSDFwj	f
39	Mario	Götze	mariogotze@gmail.com	$2b$10$JZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NML	\N	2025-02-07 15:34:40.654321	9	acct_1QmnGc2K9wpSDFwj	f
40	Christian	Günter	christianguenter@gmail.com	$2b$10$YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5	\N	2025-02-07 15:35:55.123789	9	acct_1QmnGc2K9wpSDFwj	f
41	Robert	Andrich	robertandrich@gmail.com	$2b$10$QpT7eXneC6ihDQBJtF4e01vi5EeGEY81VRlPFLQiMO5CaXdtmb8A	\N	2025-02-07 15:36:45.987654	9	acct_1QmnGc2K9wpSDFwj	f
42	Nico	Schlotterbeck	nicoschlotterbeck@gmail.com	$2b$10$P.bdaXQaPInIv5TqqdJifuSEwRCb0xZ3a/DT67puGRpeEggy98lYS	\N	2025-02-07 15:37:30.654321	9	acct_1QmnGc2K9wpSDFwj	f
43	Felix	Nmecha	felixnmecha@gmail.com	$2b$10$9HQNCPrIWjhcTTxLsMdr9uvOaoseRDUbtY7doYuWdHhGJabVsguTX	\N	2025-02-07 15:38:20.123789	9	acct_1QmnGc2K9wpSDFwj	f
44	Josko	Gvardiol	joskogvardiol@gmail.com	$2b$10$08y6j/rPtekXrZ9fkjBcfe4ntCs8VjBALdot8EZsDLmklv34mSlGV	\N	2025-02-07 15:39:50.789654	10	acct_1QmnGc2K9wpSDFwj	f
45	Leonardo	Bittencourt	leonardobittencourt@gmail.com	$2b$10$JHlNvMh1nZvHSvPq5oHpOuy4Q66JxLeFm9FkWhrxg3p9KhTZ/0lMN	\N	2025-02-07 15:40:15.321987	11	acct_1QmnGc2K9wpSDFwj	f
46	Deniz	Undav	denizundav@gmail.com	$2b$10$vP9lJd2WnA3QXhF5oZLKjOBjJX3n6ZjJ1y6TgEZxIQwJ7BOBZoXUN	\N	2025-02-07 15:41:40.456321	12	acct_1QmnGc2K9wpSDFwj	f
47	Stefan	Ortega	stefanortega@gmail.com	$2b$10$yYpKT3OYVJNAjLg1wnj8Ce2WTy1ZwVp4Ex2rNydZ2AFQvX6RkFuYPU	\N	2025-02-07 15:42:25.654987	13	acct_1QmnGc2K9wpSDFwj	f
48	Youssoufa	Moukoko	youssoufamoukoko@gmail.com	$2b$10$98XKJvhXWh/J2NexV3tOJuCB1G.VeD7QUK5W9yBZ/FoEZslz1BRnW	\N	2025-02-07 15:43:30.789321	14	acct_1QmnGc2K9wpSDFwj	f
49	Chris	Führich	chrisfuhrich@gmail.com	$2b$10$aJHYnX8yFz5E2B6Lx0M2nOjFQ9LpE3RBWZ5ZKj7QvJLX8Xh1NPvMH	\N	2025-02-07 15:44:50.987123	15	acct_1QmnGc2K9wpSDFwj	f
50	Malick	Thiaw	malickthiaw@gmail.com	$2b$10$F6QjMT5WzV3X2bNqJ5lZ2VXPB6KZ7NQJH0Yp8XWLJ4E2XJ1z9MTJ	\N	2025-02-07 15:45:25.321789	16	acct_1QmnGc2K9wpSDFwj	f
51	Jan-Niklas	Beste	janniklasbeste@gmail.com	$2b$10$PJK3X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vNYG	\N	2025-02-07 15:46:40.456987	16	acct_1QmnGc2K9wpSDFwj	f
52	Marius	Wolf	mariuswolf@gmail.com	$2b$10$X7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTNMK	\N	2025-02-07 15:47:50.789654	16	acct_1QmnGc2K9wpSDFwj	f
53	Alexander	Nübel	alexandernubel@gmail.com	$2b$10$J7Q1NMLJZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPMP	\N	2025-02-07 15:48:45.123321	16	acct_1QmnGc2K9wpSDFwj	f
54	Arne	Maier	arnemaier@gmail.com	$2b$10$9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTq5YXKW	\N	2025-02-07 15:49:50.987654	16	acct_1QmnGc2K9wpSDFwj	f
55	Marvin	Ducksch	marvinducksch@gmail.com	$2b$10$JZTq5YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMT	\N	2025-02-07 15:50:40.654321	16	acct_1QmnGc2K9wpSDFwj	f
56	Rani	Khedira	ranikhedira@gmail.com	$2b$10$YXKZ9WJH2V3B5LXp0F62J8MQLYpZ7QXJ5vBKTPLMJ7Q1NMLJZTqM	\N	2025-02-07 15:51:55.123789	16	acct_1QmnGc2K9wpSDFwj	f
57	Florian	Neuhaus	florianneuhaus@gmail.com	$2b$10$QpT7eXneC6ihDQBJtF4e01vi5EeGEY81VRlPFLQiMO5CaXdtmb8Q	\N	2025-02-07 15:52:45.987654	16	acct_1QmnGc2K9wpSDFwj	f
58	Pascal	Groß	pascalgross@gmail.com	$2b$10$P.bdaXQaPInIv5TqqdJifuSEwRCb0xZ3a/DT67puGRpeEggy98lXW	\N	2025-02-07 15:53:30.654321	16	acct_1QmnGc2K9wpSDFwj	f
59	Nadiem	Amiri	nadiemamiri@gmail.com	$2b$10$9HQNCPrIWjhcTTxLsMdr9uvOaoseRDUbtY7doYuWdHhGJabVsguMK	\N	2025-02-07 15:54:20.123789	16	acct_1QmnGc2K9wpSDFwj	f
60	Luca	Waldschmidt	lucawaldschmidt@gmail.com	$2b$10$08y6j/rPtekXrZ9fkjBcfe4ntCs8VjBALdot8EZsDLmklv34mSlXJ	\N	2025-02-07 15:55:50.789654	16	acct_1QmnGc2K9wpSDFwj	f
1	Elio	Fezollari	fezollarielio@gmail.com	$2b$10$.qpT7eX/neC6ihDQBJtF4e01vi5EeGEY81VRlPFLQiMO5CaXdtmb.	\N	2025-02-07 14:52:55.530651	16	acct_1QmnGc2K9wpSDFwj	t
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

SELECT pg_catalog.setval('public.leagues_id_seq', 4, true);


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

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 18, true);


--
-- Name: user_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_stats_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 60, true);


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

