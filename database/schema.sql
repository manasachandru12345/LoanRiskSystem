--
-- PostgreSQL database dump
--

\restrict OfHD9YYL4BZfSZKCy6CAffbeofmnRNwJhmtmx5ZhrIdi9W6hDXO0xvsvlHDQNkD

-- Dumped from database version 16.16 (Debian 16.16-1.pgdg12+1)
-- Dumped by pg_dump version 16.16 (Debian 16.16-1.pgdg12+1)

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
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: get_total_paid(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_total_paid(p_loan_id integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(payment_amount), 0)
    INTO total
    FROM payments
    WHERE loan_id = p_loan_id
      AND payment_status = 'Paid';

    RETURN total;
END;
$$;


--
-- Name: log_payment_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_payment_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        INSERT INTO payment_status_history (
            payment_id,
            old_status,
            new_status
        )
        VALUES (
            OLD.payment_id,
            OLD.payment_status,
            NEW.payment_status
        );
    END IF;

    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application_vectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_vectors (
    vector_id integer NOT NULL,
    application_id integer NOT NULL,
    profile_vector public.vector(3)
);


--
-- Name: application_vectors_vector_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_vectors_vector_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_vectors_vector_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_vectors_vector_id_seq OWNED BY public.application_vectors.vector_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    customer_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(15),
    annual_income numeric(12,2) NOT NULL,
    employment_status character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_annual_income_check CHECK ((annual_income >= (0)::numeric))
);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_applications (
    application_id integer NOT NULL,
    customer_id integer NOT NULL,
    loan_type character varying(50) NOT NULL,
    requested_amount numeric(12,2) NOT NULL,
    loan_term_months integer NOT NULL,
    application_status character varying(20) DEFAULT 'Pending'::character varying,
    application_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT loan_applications_application_status_check CHECK (((application_status)::text = ANY ((ARRAY['Pending'::character varying, 'Approved'::character varying, 'Rejected'::character varying])::text[]))),
    CONSTRAINT loan_applications_loan_term_months_check CHECK ((loan_term_months > 0)),
    CONSTRAINT loan_applications_requested_amount_check CHECK ((requested_amount > (0)::numeric))
);


--
-- Name: loan_applications_application_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_applications_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_applications_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_applications_application_id_seq OWNED BY public.loan_applications.application_id;


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    loan_id integer NOT NULL,
    application_id integer NOT NULL,
    approved_amount numeric(12,2) NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    loan_status character varying(20) DEFAULT 'Active'::character varying,
    start_date date,
    CONSTRAINT loans_approved_amount_check CHECK ((approved_amount > (0)::numeric)),
    CONSTRAINT loans_interest_rate_check CHECK ((interest_rate >= (0)::numeric)),
    CONSTRAINT loans_loan_status_check CHECK (((loan_status)::text = ANY ((ARRAY['Active'::character varying, 'Closed'::character varying, 'Defaulted'::character varying])::text[])))
);


--
-- Name: loans_loan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loans_loan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loans_loan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loans_loan_id_seq OWNED BY public.loans.loan_id;


--
-- Name: payment_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_status_history (
    history_id integer NOT NULL,
    payment_id integer NOT NULL,
    old_status character varying(20),
    new_status character varying(20),
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payment_status_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_status_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_status_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_status_history_history_id_seq OWNED BY public.payment_status_history.history_id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    loan_id integer NOT NULL,
    payment_amount numeric(12,2) NOT NULL,
    payment_date date DEFAULT CURRENT_DATE,
    payment_status character varying(20) DEFAULT 'Paid'::character varying,
    CONSTRAINT payments_payment_amount_check CHECK ((payment_amount > (0)::numeric)),
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Paid'::character varying, 'Pending'::character varying, 'Failed'::character varying])::text[])))
);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: risk_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.risk_assessments (
    assessment_id integer NOT NULL,
    application_id integer NOT NULL,
    credit_score integer,
    risk_level character varying(20) NOT NULL,
    risk_percentage numeric(5,2),
    remarks text,
    assessed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT risk_assessments_credit_score_check CHECK (((credit_score >= 300) AND (credit_score <= 850))),
    CONSTRAINT risk_assessments_risk_level_check CHECK (((risk_level)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[]))),
    CONSTRAINT risk_assessments_risk_percentage_check CHECK (((risk_percentage >= (0)::numeric) AND (risk_percentage <= (100)::numeric)))
);


--
-- Name: risk_assessments_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.risk_assessments_assessment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: risk_assessments_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.risk_assessments_assessment_id_seq OWNED BY public.risk_assessments.assessment_id;


--
-- Name: application_vectors vector_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_vectors ALTER COLUMN vector_id SET DEFAULT nextval('public.application_vectors_vector_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: loan_applications application_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications ALTER COLUMN application_id SET DEFAULT nextval('public.loan_applications_application_id_seq'::regclass);


--
-- Name: loans loan_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans ALTER COLUMN loan_id SET DEFAULT nextval('public.loans_loan_id_seq'::regclass);


--
-- Name: payment_status_history history_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_status_history ALTER COLUMN history_id SET DEFAULT nextval('public.payment_status_history_history_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: risk_assessments assessment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk_assessments ALTER COLUMN assessment_id SET DEFAULT nextval('public.risk_assessments_assessment_id_seq'::regclass);


--
-- Name: application_vectors application_vectors_application_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_vectors
    ADD CONSTRAINT application_vectors_application_id_key UNIQUE (application_id);


--
-- Name: application_vectors application_vectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_vectors
    ADD CONSTRAINT application_vectors_pkey PRIMARY KEY (vector_id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (application_id);


--
-- Name: loans loans_application_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_application_id_key UNIQUE (application_id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (loan_id);


--
-- Name: payment_status_history payment_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_status_history
    ADD CONSTRAINT payment_status_history_pkey PRIMARY KEY (history_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: risk_assessments risk_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_pkey PRIMARY KEY (assessment_id);


--
-- Name: application_vector_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_vector_idx ON public.application_vectors USING hnsw (profile_vector public.vector_cosine_ops);


--
-- Name: payments payment_status_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_status_update_trigger AFTER UPDATE OF payment_status ON public.payments FOR EACH ROW EXECUTE FUNCTION public.log_payment_status_change();


--
-- Name: application_vectors application_vectors_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_vectors
    ADD CONSTRAINT application_vectors_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.loan_applications(application_id);


--
-- Name: loan_applications loan_applications_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: loans loans_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.loan_applications(application_id);


--
-- Name: payments payments_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(loan_id);


--
-- Name: risk_assessments risk_assessments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.loan_applications(application_id);


--
-- PostgreSQL database dump complete
--

\unrestrict OfHD9YYL4BZfSZKCy6CAffbeofmnRNwJhmtmx5ZhrIdi9W6hDXO0xvsvlHDQNkD

