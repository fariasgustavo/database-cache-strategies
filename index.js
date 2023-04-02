const http = require("http");
const redis = require("redis");

const cacheClient = redis.createClient({
  url: "redis://default:cachepass@cache:6379",
});

const getDatabaseConnection = () => {
  const { Pool } = require("pg");

  const pool = new Pool({
    user: "cache-admin",
    password: "test234",
    database: "stocks",
    host: "database",
    port: 5432,
  });

  return pool;
};

const databaseConnection = getDatabaseConnection();

const routes = {
  "/credit-card/numbers:get": async (request, response) => {
    const timestap = new Date().getTime();

    console.time(`Response Time ${timestap}`);
    const cachedData = await cacheClient.get("credit_card_numbers");

    if (cachedData) {
      console.timeLog(`Response Time ${timestap}`);

      response.writeHead(200);
      response.write(JSON.stringify(cachedData));

      return response.end();
    }

    const result = await databaseConnection.query(
      "SELECT * FROM credit_cards;"
    );

    await databaseConnection.end();
    await cacheClient.set("credit_card_numbers", JSON.stringify(result.rows));

    console.timeLog(`Response Time ${timestap}`);
    response.writeHead(200);
    response.write(JSON.stringify(result.rows));

    return response.end();
  },
};

const routesHandler = (request, response) => {
  const { url, method } = request;
  const routeKey = `${url}:${method.toLowerCase()}`;
  console.log(routeKey);
  const selectedRoute = routes[routeKey];

  response.writeHead(200, {
    "Content-Type": "text/json",
  });

  return selectedRoute(request, response);
};

(async () => {
  await cacheClient.connect();

  http
    .createServer(routesHandler)
    .listen(8000, () => console.log("server listening on port 8000"));
})();
