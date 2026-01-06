import Freecurrencyapi from '@everapi/freecurrencyapi-js';

const API_KEY = 'fca_live_pfwbZjdHfftkD7hH0LUm3qBe9gOJn9l1LwLouEFD';
const client = new Freecurrencyapi(API_KEY);

async function runTests() {
  console.log('--- FreeCurrencyAPI Test Script ---');

  try {
    // 🧾 1. STATUS: check quota + health
    const status = await client.status();
    console.log('Status / Quota:', status);

    // 💱 2. SUPPORTED CURRENCIES
    const allCurrencies = await client.currencies();
    console.log(
      'Supported Currencies:',
      Object.keys(allCurrencies.data).slice(0, 10),
      '...',
    );

    // 🔥 3. LATEST RATES (base USD)
    const latestUSD = await client.latest({
      base_currency: 'USD',
      currencies: 'EUR,GBP,JPY,PKR',
    });
    console.log('Latest (USD → EUR/GBP/JPY/PKR):', latestUSD.data);

    // 📊 4. LATEST RATES (base EUR)
    const latestEUR = await client.latest({
      base_currency: 'EUR',
      currencies: 'USD,GBP,AUD',
    });
    console.log('Latest (EUR → USD/GBP/AUD):', latestEUR.data);

    // 📅 5. HISTORICAL RATES (specific date)
    const historical = await client.historical({
      date: '2023-12-31',
      base_currency: 'USD',
      currencies: 'EUR,GBP,JPY',
    });
    console.log('Historical (2023-12-31 USD → EUR/GBP/JPY):', historical.data);
  } catch (err) {
    console.error('Error calling API:', err.message || err);
  }
}

runTests();
