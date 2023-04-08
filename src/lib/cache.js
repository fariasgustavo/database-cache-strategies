const getFromCache = async (cacheClient, databaseClient) => {
    const cachedData = await cacheClient.get("credit_card_numbers");

    if(cachedData) return cachedData;
  
    const result = await databaseClient.query(
      "SELECT * FROM credit_cards;"
    );
  
    await databaseClient.end();
    await cacheClient.set("credit_card_numbers", JSON.stringify(result.rows));
  
    return JSON.stringify(result.rows);
}

module.exports = {
    getFromCache
}