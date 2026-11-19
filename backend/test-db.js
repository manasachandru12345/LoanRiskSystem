require("dotenv").config({ quiet: true });
const { Client } = require("pg");

async function test(host) {
    const client = new Client({
        host,
        port: 5432,
        user: "loanadmin",
        password: process.env.DB_PASSWORD,
        database: "loanrisk",
        connectionTimeoutMillis: 3000
    });

    try {
        await client.connect();
        const result = await client.query(
            "SELECT inet_server_addr(), version()"
        );
        console.log("\nSUCCESS at", host);
        console.log(result.rows[0]);
    } catch (err) {
        console.log("\nFAILED at", host);
        console.log(err.code, err.message);
    } finally {
        await client.end().catch(() => {});
    }
}

(async () => {
    await test("127.0.0.1");
    await test("::1");
})();
