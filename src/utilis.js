/** @typedef {{ id: string, description: string, amount: number, currency: string, category: string }} Expense */

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Other'];

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'JPY', 'CAD', 'AUD'];

/**
 * Convert an amount between currencies using rates from open.er-api (base = USD).
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Record<string, number>} rates - units of each currency per 1 USD
 * @param {string} [baseCurrency='USD']
 * @returns {number|null} null if rates are missing or invalid
 */
export function convertAmount(amount, fromCurrency, toCurrency, rates, baseCurrency = 'USD') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return null;
  }
  if (!rates || typeof rates !== 'object') {
    return null;
  }
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = fromCurrency === baseCurrency ? 1 : rates[fromCurrency];
  const toRate = toCurrency === baseCurrency ? 1 : rates[toCurrency];

  if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) {
    return null;
  }

  const amountInBase = fromCurrency === baseCurrency ? amount : amount / fromRate;
  const converted = toCurrency === baseCurrency ? amountInBase : amountInBase * toRate;
  return converted;
}

/**
 * @param {Expense[]} expenses
 * @param {string|null|undefined} category - null/undefined/'All' shows everything
 */
export function filterExpensesByCategory(expenses, category) {
  if (!Array.isArray(expenses)) {
    return [];
  }
  if (!category || category === 'All') {
    return expenses;
  }
  return expenses.filter((expense) => expense.category === category);
}

/**
 * Sum expenses in home currency.
 * @param {Expense[]} expenses
 * @param {string} homeCurrency
 * @param {Record<string, number>} rates
 * @returns {number|null} null if any conversion fails
 */
export function calculateTotalInHomeCurrency(expenses, homeCurrency, rates) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return 0;
  }

  let total = 0;
  for (const expense of expenses) {
    const converted = convertAmount(expense.amount, expense.currency, homeCurrency, rates);
    if (converted === null) {
      return null;
    }
    total += converted;
  }
  return total;
}

/**
 * @param {number} value
 * @param {string} currency
 */
export function formatMoney(value, currency) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}