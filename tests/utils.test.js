import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalInHomeCurrency,
  convertAmount,
  filterExpensesByCategory,
  formatMoney,
} from '../src/utilis.js';

const rates = { EUR: 0.92, KES: 130 };

test('converts between currencies using USD-based rates', () => {
  assert.equal(convertAmount(10, 'USD', 'KES', rates), 1300);
  assert.equal(convertAmount(1300, 'KES', 'USD', rates), 10);
  assert.equal(convertAmount(12, 'EUR', 'EUR', rates), 12);
});

test('returns null for invalid amounts or unavailable rates', () => {
  assert.equal(convertAmount(Number.NaN, 'USD', 'KES', rates), null);
  assert.equal(convertAmount(10, 'USD', 'GBP', rates), null);
});

test('filters expenses by category and supports all categories', () => {
  const expenses = [
    { category: 'Food' },
    { category: 'Transport' },
    { category: 'Food' },
  ];
  assert.equal(filterExpensesByCategory(expenses, 'Food').length, 2);
  assert.equal(filterExpensesByCategory(expenses, 'All').length, 3);
  assert.deepEqual(filterExpensesByCategory(null, 'Food'), []);
});

test('calculates totals in home currency and handles missing rates', () => {
  const expenses = [
    { amount: 10, currency: 'USD' },
    { amount: 1300, currency: 'KES' },
  ];
  assert.equal(calculateTotalInHomeCurrency(expenses, 'KES', rates), 2600);
  assert.equal(calculateTotalInHomeCurrency([], 'KES', rates), 0);
  assert.equal(calculateTotalInHomeCurrency(expenses, 'GBP', rates), null);
});

test('formats missing amounts as a dash and valid amounts as currency', () => {
  assert.equal(formatMoney(null, 'KES'), '—');
  assert.match(formatMoney(1250, 'KES'), /1,250/);
});