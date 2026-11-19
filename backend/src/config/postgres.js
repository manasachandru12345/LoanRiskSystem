const { Pool } = require("pg");

const pool = new Pool({
    host: "::1",
    port: 5432,
    user: "loanadmin",
    password: process.env.DB_PASSWORD,
    database: "loanrisk"
});

module.exports = pool;
