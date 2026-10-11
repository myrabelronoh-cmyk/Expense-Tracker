const RATES_URL = 'https://open.er-api.com/v6/latest/USD';

/**
 * @returns {Promise<{ base: string, rates: Record<string, number>, timeLastUpdateUtc: string }>}
 */
export async function fetchExchangeRates() {
  const response = await fetch(RATES_URL);

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}`);
  }

  const data = await response.json();

  if (data.result !== 'success' || !data.rates) {
    throw new Error(data['error-type'] || 'Invalid exchange rate response');
  }

  return {
    base: data.base_code || 'USD',
    rates: data.rates,
    timeLastUpdateUtc: data.time_last_update_utc || '',
  };
}