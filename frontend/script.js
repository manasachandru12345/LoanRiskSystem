const API_BASE = "http://localhost:5000/api";

// Safely display text returned by the API
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Handle common API response formats
function getRecords(response) {
    if (Array.isArray(response)) return response;

    if (response && Array.isArray(response.data)) return response.data;
    if (response && Array.isArray(response.rows)) return response.rows;

    return [];
}

async function apiRequest(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return getRecords(await response.json());
}

function getValue(record, ...keys) {
    for (const key of keys) {
        if (record && record[key] !== undefined && record[key] !== null) {
            return record[key];
        }
    }
    return "—";
}

function formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "—";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(value) {
    if (!value || value === "—") return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHTML(value);

    return date.toLocaleDateString("en-IN");
}

function statusBadge(status) {
    const value = String(status ?? "Unknown");
    const className = value.toLowerCase().replace(/[^a-z0-9-]/g, "");

    return `<span class="status ${escapeHTML(className)}">${escapeHTML(value)}</span>`;
}

function showError(elementId, error) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `Unable to load data: ${error.message}`;
    }
}

// Navigation
function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    const selectedPage = document.getElementById(`${pageName}-page`);
    if (!selectedPage) return;

    selectedPage.classList.add("active");

    const selectedLink = document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    );

    if (selectedLink) selectedLink.classList.add("active");

    const heading = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    document.getElementById("page-heading").textContent =
        pageName === "dashboard" ? "Dashboard Overview" : heading;

    document.getElementById("breadcrumb-page").textContent = heading;

    const loaders = {
        dashboard: loadDashboard,
        customers: loadCustomers,
        applications: loadApplications,
        risk: loadRiskAssessments,
        loans: loadLoans,
        payments: loadPayments
    };

    if (loaders[pageName]) loaders[pageName]();
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        showPage(link.dataset.page);
    });
});

// Dashboard
async function loadDashboard() {
    const message = document.getElementById("dashboard-message");
    message.textContent = "";

    try {
        const [customers, applications, loans, payments] = await Promise.all([
            apiRequest("/customers"),
            apiRequest("/applications"),
            apiRequest("/loans"),
            apiRequest("/payments")
        ]);

        document.getElementById("total-customers").textContent = customers.length;
        document.getElementById("total-applications").textContent = applications.length;
        document.getElementById("total-loans").textContent = loans.length;
        document.getElementById("total-payments").textContent = payments.length;

        const recent = applications.slice(-5).reverse();

        document.getElementById("recent-applications").innerHTML =
            recent.length
                ? recent.map(app => `
                    <tr>
                        <td>#${escapeHTML(getValue(app, "application_id", "id"))}</td>
                        <td>${escapeHTML(getValue(app, "full_name", "customer_name"))}</td>
                        <td>${escapeHTML(getValue(app, "loan_type", "application_type"))}</td>
                        <td>${formatCurrency(getValue(app, "approved_amount", "loan_amount", "amount"))}</td>
                        <td>${statusBadge(getValue(app, "status", "application_status"))}</td>
                    </tr>
                `).join("")
                : `<tr><td colspan="5" class="empty-message">No applications found.</td></tr>`;

    } catch (error) {
        message.textContent = `Dashboard error: ${error.message}`;
    }
}

// Customers
async function loadCustomers() {
    const table = document.getElementById("customers-table");
    const message = document.getElementById("customers-message");
    message.textContent = "";

    try {
        const records = await apiRequest("/customers");

        table.innerHTML = records.length
            ? records.map(customer => `
                <tr>
                    <td>${escapeHTML(getValue(customer, "customer_id", "id"))}</td>
                    <td>${escapeHTML(getValue(customer, "full_name", "name"))}</td>
                    <td>${escapeHTML(getValue(customer, "email"))}</td>
                    <td>${escapeHTML(getValue(customer, "phone"))}</td>
                    <td>${formatCurrency(getValue(customer, "annual_income"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="5" class="empty-message">No customers found.</td></tr>`;

    } catch (error) {
        showError("customers-message", error);
    }
}

// Applications
async function loadApplications() {
    const table = document.getElementById("applications-table");
    const message = document.getElementById("applications-message");
    message.textContent = "";

    try {
        const records = await apiRequest("/applications");

        table.innerHTML = records.length
            ? records.map(app => `
                <tr>
                    <td>${escapeHTML(getValue(app, "application_id", "id"))}</td>
                    <td>${escapeHTML(getValue(app, "full_name", "customer_name"))}</td>
                    <td>${escapeHTML(getValue(app, "loan_type", "application_type"))}</td>
                    <td>${formatCurrency(getValue(app, "approved_amount", "loan_amount", "amount"))}</td>
                    <td>${escapeHTML(getValue(app, "loan_term_months", "duration_months", "tenure_months"))}</td>
                    <td>${statusBadge(getValue(app, "status", "application_status"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6" class="empty-message">No applications found.</td></tr>`;

    } catch (error) {
        showError("applications-message", error);
    }
}

// Risk assessments
async function loadRiskAssessments() {
    const table = document.getElementById("risk-table");
    const message = document.getElementById("risk-message");
    message.textContent = "";

    try {
        const records = await apiRequest("/risk-assessments");

        table.innerHTML = records.length
            ? records.map(item => `
                <tr>
                    <td>${escapeHTML(getValue(item, "assessment_id", "id"))}</td>
                    <td>${escapeHTML(getValue(item, "application_id"))}</td>
                    <td>${escapeHTML(getValue(item, "full_name", "customer_name"))}</td>
                    <td>${escapeHTML(getValue(item, "credit_score"))}</td>
                    <td>${statusBadge(getValue(item, "risk_level"))}</td>
                    <td>${escapeHTML(getValue(item, "risk_percentage"))}%</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6" class="empty-message">No risk assessments found.</td></tr>`;

    } catch (error) {
        showError("risk-message", error);
    }
}

// Loans
async function loadLoans() {
    const table = document.getElementById("loans-table");
    const message = document.getElementById("loans-message");
    message.textContent = "";

    try {
        const records = await apiRequest("/loans");

        table.innerHTML = records.length
            ? records.map(loan => `
                <tr>
                    <td>${escapeHTML(getValue(loan, "loan_id", "id"))}</td>
                    <td>${escapeHTML(getValue(loan, "full_name", "customer_name"))}</td>
                    <td>${escapeHTML(getValue(loan, "application_id"))}</td>
                    <td>${formatCurrency(getValue(loan, "approved_amount", "loan_amount", "amount"))}</td>
                    <td>${escapeHTML(getValue(loan, "interest_rate"))}%</td>
                    <td>${statusBadge(getValue(loan, "loan_status", "status"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6" class="empty-message">No loans found.</td></tr>`;

    } catch (error) {
        showError("loans-message", error);
    }
}

// Payments
async function loadPayments() {
    const table = document.getElementById("payments-table");
    const message = document.getElementById("payments-message");
    message.textContent = "";

    try {
        const records = await apiRequest("/payments");

        table.innerHTML = records.length
            ? records.map(payment => `
                <tr>
                    <td>${escapeHTML(getValue(payment, "payment_id", "id"))}</td>
                    <td>${escapeHTML(getValue(payment, "loan_id"))}</td>
                    <td>${escapeHTML(getValue(payment, "full_name", "customer_name"))}</td>
                    <td>${formatCurrency(getValue(payment, "amount", "payment_amount"))}</td>
                    <td>${formatDate(getValue(payment, "payment_date"))}</td>
                    <td>${statusBadge(getValue(payment, "status", "payment_status"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6" class="empty-message">No payments found.</td></tr>`;

    } catch (error) {
        showError("payments-message", error);
    }
}

// Initial dashboard load
loadDashboard();


