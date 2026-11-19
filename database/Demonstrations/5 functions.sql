
-- LOAN RISK AND APPLICATION MANAGEMENT SYSTEM
-- DBMS OPERATIONS DEMONSTRATION
-- INSERT, UPDATE, DELETE, FUNCTION AND TRIGGER

BEGIN;

-- Store IDs of records created only for this demonstration.
CREATE TEMP TABLE demo_ids (
    customer_id INTEGER,
    application_id INTEGER,
    loan_id INTEGER,
    payment_id INTEGER
) ON COMMIT DROP;

-- 1. INSERT: create a demo customer.
WITH inserted_customer AS (
    INSERT INTO public.customers
        (full_name, email, phone, annual_income, employment_status)
    VALUES
        ('DBMS Demo Customer',
         'dbms_demo_20261118@loanrisk.example',
         '9000000000', 600000.00, 'Employed')
    RETURNING customer_id
)
INSERT INTO demo_ids (customer_id)
SELECT customer_id FROM inserted_customer;

-- 1. INSERT: create a loan application.
WITH inserted_application AS (
    INSERT INTO public.loan_applications
        (customer_id, loan_type, requested_amount,
         loan_term_months, application_status)
    SELECT customer_id, 'Personal', 150000.00, 24, 'Pending'
    FROM demo_ids
    RETURNING application_id
)
UPDATE demo_ids
SET application_id =
    (SELECT application_id FROM inserted_application);

-- Create a loan for the function and payment demonstration.
WITH inserted_loan AS (
    INSERT INTO public.loans
        (application_id, approved_amount, interest_rate,
         loan_status, start_date)
    SELECT application_id, 150000.00, 10.50, 'Active', CURRENT_DATE
    FROM demo_ids
    RETURNING loan_id
)
UPDATE demo_ids
SET loan_id = (SELECT loan_id FROM inserted_loan);

-- Create a risk assessment.
INSERT INTO public.risk_assessments
    (application_id, credit_score, risk_level,
     risk_percentage, remarks)
SELECT application_id, 720, 'Low', 18.50,
       'Temporary DBMS demonstration'
FROM demo_ids;

-- Create a Pending payment.
WITH inserted_payment AS (
    INSERT INTO public.payments
        (loan_id, payment_amount, payment_date, payment_status)
    SELECT loan_id, 5000.00, CURRENT_DATE, 'Pending'
    FROM demo_ids
    RETURNING payment_id
)
UPDATE demo_ids
SET payment_id = (SELECT payment_id FROM inserted_payment);

-- Display inserted records.
SELECT * FROM demo_ids;

-- 2. UPDATE: update only the demo customer's income.
UPDATE public.customers
SET annual_income = 650000.00
WHERE customer_id = (SELECT customer_id FROM demo_ids);

SELECT customer_id, full_name, annual_income
FROM public.customers
WHERE customer_id = (SELECT customer_id FROM demo_ids);

-- 3. FUNCTION: calculate total paid before payment update.
SELECT public.get_total_paid(loan_id) AS paid_before
FROM demo_ids;

-- 4. TRIGGER: change Pending to Paid.
UPDATE public.payments
SET payment_status = 'Paid'
WHERE payment_id = (SELECT payment_id FROM demo_ids);

-- Verify that the trigger recorded the status change.
SELECT payment_id, old_status, new_status, changed_at
FROM public.payment_status_history
WHERE payment_id = (SELECT payment_id FROM demo_ids);

-- Verify function after payment becomes Paid.
SELECT public.get_total_paid(loan_id) AS paid_after
FROM demo_ids;

-- 5. DELETE: remove only demo records, in safe order.
DELETE FROM public.payment_status_history
WHERE payment_id = (SELECT payment_id FROM demo_ids);

DELETE FROM public.payments
WHERE payment_id = (SELECT payment_id FROM demo_ids);

DELETE FROM public.risk_assessments
WHERE application_id = (SELECT application_id FROM demo_ids);

DELETE FROM public.loans
WHERE loan_id = (SELECT loan_id FROM demo_ids);

DELETE FROM public.loan_applications
WHERE application_id = (SELECT application_id FROM demo_ids);

DELETE FROM public.customers
WHERE customer_id = (SELECT customer_id FROM demo_ids);

-- Confirm demo customer has been deleted.
SELECT COUNT(*) AS remaining_demo_customers
FROM public.customers
WHERE email = 'dbms_demo_20261118@loanrisk.example';

-- Undo every change made during this demonstration.
ROLLBACK;
