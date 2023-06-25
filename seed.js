const { faker } = require("@faker-js/faker");

const databaseConnection = async () => {
  const { Pool } = require("pg");

  // pools will use environment variables
  // for connection information
  const pool = new Pool({
    user: "cache-admin",
    password: "test234",
    database: "cache-example",
    host: "localhost",
    port: 5432,
  });

  for (let i = 0; i < 100000; i++) {
    await pool.query("INSERT INTO credit_cards (card_number) VALUES ($1)", [
      faker.finance.creditCardNumber(),
    ]);
  }

  await pool.end();
};

(async () => {
  await databaseConnection();
})();
