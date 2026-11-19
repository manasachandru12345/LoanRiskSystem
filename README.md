# Loan Risk and Application Management System

A DBMS mini project for managing customer records, loan applications,
risk assessments, loans, and payments.

## Project overview

The application uses a browser-based frontend, a Node.js/Express backend
API, PostgreSQL for relational data, Redis as an in-memory data service,
and pgvector for application-vector similarity-search experimentation.

## Main modules

-   **Customers** --- customer identity, contact, income, and employment
    details.
-   **Loan Applications** --- requested loan type, amount, term, and
    application status.
-   **Risk Assessments** --- credit score, risk level, risk percentage,
    and remarks.
-   **Loans** --- approved amount, interest rate, and loan status.
-   **Payments** --- payment amount, date, and payment status.

## Technology stack

  Layer                    Technology
  ------------------------ -----------------------
  Frontend                 HTML, CSS, JavaScript
  Backend                  Node.js, Express
  Relational database      PostgreSQL
  Vector support           pgvector
  In-memory data service   Redis
  Local services           Docker

## Local development ports

-   Frontend: `http://localhost:5500`
-   Backend API: `http://localhost:5000`
-   PostgreSQL: port `5432`
-   Redis: port `6379`

## API route prefixes

-   `/api/customers`
-   `/api/applications`
-   `/api/risk-assessments`
-   `/api/loans`
-   `/api/payments`

The backend health endpoint is `/api/health`.

## Database objects

The verified PostgreSQL database contains these tables:

1.  `customers`
2.  `loan_applications`
3.  `risk_assessments`
4.  `loans`
5.  `payments`
6.  `payment_status_history`
7.  `application_vectors`

### Stored function

`get_total_paid(p_loan_id INTEGER)` returns the sum of payments with
status `Paid` for the specified loan. It returns zero when no matching
paid payments exist.

### Trigger

The `payment_status_update_trigger` runs after an update of
`payments.payment_status`. Its trigger function,
`log_payment_status_change()`, records the payment ID, old status, and
new status in `payment_status_history` when the status changes.

## Verified checks

-   Backend health check reported PostgreSQL connected and Redis
    returned `PONG`.
-   Frontend dashboard and five module views displayed database records.
-   `get_total_paid(1)` returned `30000.00`.
-   `get_total_paid(2)` returned `12000.00`.
-   `get_total_paid(3)` returned `10000.00`.
-   A change of payment ID 5 from `Pending` to `Paid` was recorded in
    payment-status history.

## Important project limitations

-   The risk percentages and credit-score bands in sample records are
    illustrative demonstration rules, not a validated lending model.
-   The three-dimensional vectors are illustrative and are not
    production financial predictions.
-   Redis connectivity was verified; do not claim caching behavior
    unless it is demonstrated in the implementation.
-   The payment history table's `payment_id` does not have a declared
    foreign key to `payments` in the current exported schema.

## Running the project

The project was developed locally on Windows using PowerShell and
Docker. Start the PostgreSQL and Redis containers using the Docker
configuration already created for this project. Then start the backend
using the scripts in the `backend` folder and serve the `frontend`
folder on port `5500`.

Keep the backend and frontend terminal windows open while demonstrating
the application.

## Submission checklist

-   [ ] Add student/team names, USN/SRN, institution, and academic year
    to the report.
-   [ ] Add final screenshots of the dashboard and each module.
-   [ ] Include the current database exports from the `database` folder.
-   [ ] Do not include `.env`, passwords, API keys, or other secrets in
    GitHub.
-   [ ] Verify the project starts successfully before the final
    demonstration.
