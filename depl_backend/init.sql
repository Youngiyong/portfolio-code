
'''
Create User
'''

CREATE USER browny WITH ENCRYPTED PASSWORD 'wZ8FWmtbLaeqefw5UZw3JrNdUDVNAbyt';

'''
Create Database
'''

CREATE DATABASE browny
  LC_COLLATE 'C'
  LC_CTYPE 'C'
  ENCODING 'UTF8'
  TEMPLATE template0
  ;

'''
Change Databse owner 
'''
ALTER DATABASE browny OWNER TO browny;


'''
Postgres Version 11.10
'''


'''
Postgres Setting
https://postgresql.kr/docs/11/runtime-config-client.html
'''

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
-- uuid-ossp 모듈은 여러 표준 알고리즘 중 하나를 사용하여 범용 고유 식별자 (UUID를)를 생성하는 기능을 제공한다
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(255),
    email character varying(255),
    password character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_certified boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO browny;


-- Name: social_accounts; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.social_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    social_id character varying(255),
    access_token character varying(255),
    provider character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fk_user_id uuid NOT NULL
);


ALTER TABLE public.social_accounts OWNER TO browny;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    description character varying(255),
    thumbnail character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fk_user_id uuid NOT NULL,
    profile_links jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO browny;

--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.user_follows (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fk_user_id uuid NOT NULL,
    fk_follow_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
);

ALTER TABLE public.user_follows OWNER TO browny;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying(255),
    thumbnail character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.tags OWNER TO browny;


--
-- Name: qna_tags; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.qna_tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fk_qna_id uuid NOT NULL,
    fk_tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.qna_tags OWNER TO browny;

--
-- Name: qnas; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.qnas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255),
    text text,
    fk_user_id uuid NOT NULL,
    is_private boolean DEFAULT false NOT NULL,
    is_markdown boolean default false NOT NULL,
    is_temp boolean default false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp DEFAULT NULL
);

ALTER TABLE public.qnas OWNER TO browny;


--
-- Name: qna_comments; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.qna_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fk_qna_id uuid NOT NULL,
    fk_user_id uuid NOT NULL,
    text text,
    likes integer DEFAULT 0,
    is_private boolean DEFAULT false NOT NULL,
    is_reply boolean DEFAULT false,
    reply_to uuid,
    level integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp DEFAULT NULL
);

ALTER TABLE public.qnas OWNER TO browny;



--
-- Name: qna_aggregations; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.qna_aggregations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fk_qna_id uuid NOT NULL,
    likes integer DEFAULT 0,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.qna_aggregations OWNER TO browny;


--
-- Name: qna_likes; Type: TABLE; Schema: public; Owner: browny
--

CREATE TABLE public.qna_likes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fk_qna_id uuid NOT NULL,
    fk_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.qna_likes OWNER TO browny;

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);



--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);




--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: qna_tags qna_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.qna_tags
    ADD CONSTRAINT qna_tags_pkey PRIMARY KEY (id);



--
-- Name: qnas qnas_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.qnas
    ADD CONSTRAINT qnas_pkey PRIMARY KEY (id);


--
-- Name: qna_comments qna_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.qna_comments
    ADD CONSTRAINT qna_comments_pkey PRIMARY KEY (id);


--
-- Name: qna_aggregations qna_aggregations_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.qna_aggregations
    ADD CONSTRAINT qna_aggregations_pkey PRIMARY KEY (id);


--
-- Name: qna_likes qna_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: browny
--

ALTER TABLE ONLY public.qna_likes
    ADD CONSTRAINT qna_likes_pkey PRIMARY KEY (id);