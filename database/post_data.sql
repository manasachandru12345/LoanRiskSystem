--
-- PostgreSQL database dump
--

\restrict nVwhHSGAushNK3NldXplP7iLyBnNnHzmjsXhKFHH8WVfw1jp3kelwygONLePEEZ

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

SET default_tablespace = '';

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

\unrestrict nVwhHSGAushNK3NldXplP7iLyBnNnHzmjsXhKFHH8WVfw1jp3kelwygONLePEEZ

