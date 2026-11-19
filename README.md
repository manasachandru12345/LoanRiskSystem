# Loan Risk and Application Management System

A DBMS mini project for managing customer records, loan applications, risk assessments, loans, and payments.

## Project Overview

The Loan Risk and Application Management System is a database-driven application designed to manage the loan lifecycle efficiently. It provides a browser-based frontend connected to a Node.js and Express backend, PostgreSQL for relational data management, Redis as an in-memory data service, and pgvector for application-vector similarity-search experimentation.

## Main Modules

- **Customers:** Manages customer identity, contact, income, and employment details.
- **Loan Applications:** Manages requested loan type, amount, term, and application status.
- **Risk Assessments:** Stores credit scores, risk levels, risk percentages, and remarks.
- **Loans:** Manages approved loan amounts, interest rates, and loan status.
- **Payments:** Tracks payment amounts, dates, and payment status.

## Technology Stack

| **Layer** | **Technology** |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Relational Database | PostgreSQL |
| Vector Support | pgvector |
| In-memory Data Service | Redis |
| Local Services | Docker |

## Local Development Ports

- Frontend: `http://localhost:5500`
- Backend API: `http://localhost:5000`
- PostgreSQL: Port `5432`
- Redis: Port `6379`

## API Route Prefixes

- `/api/customers`
- `/api/applications`
- `/api/risk-assessments`
- `/api/loans`
- `/api/payments`

**Backend Health Endpoint:** `/api/health`

## Database Objects

The PostgreSQL database contains seven tables:

1. `customers`
2. `loan_applications`
3. `risk_assessments`
4. `loans`
5. `payments`
6. `payment_status_history`
7. `application_vectors`

### Stored Function

`get_total_paid(p_loan_id INTEGER)` calculates the total amount of payments with status `Paid` for a specified loan. It returns zero when no matching paid payments exist.

### Trigger

The `payment_status_update_trigger` runs after an update to `payments.payment_status`. Its trigger function, `log_payment_status_change()`, records the payment ID, old status, and new status in `payment_status_history` whenever the payment status changes.

## Verified Checks

- Backend health check confirmed PostgreSQL connectivity and Redis returned `PONG`.
- Frontend dashboard and five module views displayed database records.
- `get_total_paid(1)` returned `30000.00`.
- `get_total_paid(2)` returned `12000.00`.
- `get_total_paid(3)` returned `10000.00`.
- A change in payment ID 5 from `Pending` to `Paid` was recorded in payment-status history.

## Project Limitations

- Risk percentages and credit-score bands in sample records are illustrative demonstration rules, not a validated lending model.
- The three-dimensional vectors are illustrative and are not production financial predictions.
- Redis connectivity was verified; a specific caching strategy is not claimed.
- The `payment_id` column in `payment_status_history` does not have a declared foreign key to `payments` in the current exported schema.

## Running the Project

The project was developed locally on Windows using PowerShell and Docker Desktop.

### Prerequisites

- Node.js and npm
- Docker Desktop
- PostgreSQL 16 with pgvector support
- Redis 7
- Python for serving the frontend

### Step 1: Start Docker Desktop

Open Docker Desktop and wait until the Docker engine is running.

### Step 2: Start PostgreSQL and Redis

Open PowerShell and execute:

```powershell
docker start loan-postgres
docker start loan-redis
```

The existing Docker containers provide the following services:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

**Note:** These commands use the existing containers created during project development. For a fresh installation, PostgreSQL and Redis containers must be created and configured separately. This repository does not include a Docker Compose configuration.

### Step 3: Start the Backend

Open a PowerShell terminal:

```powershell
cd LoanRiskSystem\backend
npm install
npm run dev
```

The backend server runs on port `5000`.

The backend uses environment variables stored in `backend/.env` for database and Redis configuration.

### Step 4: Start the Frontend

Open another PowerShell terminal:

```powershell
cd LoanRiskSystem\frontend
python -m http.server 5500
```

Open the application in your browser:

`http://localhost:5500`

### Step 5: Verify Backend Health

Open:

`http://localhost:5000/api/health`

The endpoint reports the backend status and database connection information.

Keep the backend and frontend terminal windows open while demonstrating the application.

## Project Documentation and Deliverables

The repository includes the source code, database scripts, project reports, and application screenshots required to understand and demonstrate the Loan Risk and Application Management System.

### Included in This Repository

- **Source Code:** Complete frontend and backend implementation.
- **Database Scripts:** PostgreSQL schema, sample data, and SQL demonstrations.
- **Project Reports:** Project documentation and relational schema report.
- **Application Screenshots:** Dashboard and screenshots of the Customers, Applications, Risk Assessments, Loans, and Payments modules.
- **README:** Project overview, technology stack, API routes, database objects, and local setup information.

### Project Status

The application has been tested locally, including backend connectivity, PostgreSQL and Redis connections, dashboard display, stored function execution, and payment-status trigger functionality.

Sensitive configuration files, credentials, and dependency folders are excluded from the public repository.

## Conclusion

The Loan Risk and Application Management System provides an efficient way to manage customer details, loan applications, risk assessments, loans, and payments. It integrates a frontend, Node.js backend, PostgreSQL, Redis, and pgvector. The project demonstrates key DBMS concepts such as relationships, constraints, stored functions, and triggers. Testing confirmed the core database operations and application functionality. Overall, the project provides practical experience in database design and full-stack application development.
