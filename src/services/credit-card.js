const getCreditCardList = async (cacheClient, databaseClient) => {
    const cachedData = await cacheClient.get("credit_card_numbers");

    if(cachedData) return cachedData;
  
    const result = await databaseClient.query(
      "SELECT * FROM credit_cards;"
    );
  
    await databaseClient.end();
    await cacheClient.set("credit_card_numbers", JSON.stringify(result.rows));
  
    return JSON.stringify(result.rows);
}

const createCreditCard = async (cacheClient, databaseClient, data) => {
  let creditCardsListCached = JSON.parse(await cacheClient.get('credit_card_numbers'));
  const insertQuery = 'INSERT INTO credit_cards(card_number) VALUES ($1) RETURNING *';

  if(!creditCardsListCached) {
    creditCardsListCached = [];
  }

  creditCardsListCached.push(data);

  await cacheClient.set('credit_card_numbers', JSON.stringify(creditCardsListCached));

  const result = await databaseClient.query(insertQuery, [data.cardNumber]);

  await databaseClient.end();

  return result.rows;
}

module.exports = {
    getCreditCardList,
    createCreditCard
}