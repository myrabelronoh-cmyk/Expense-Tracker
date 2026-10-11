import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addExpense,
  initialState,
  removeExpense,
  setFilterCategory,
  setHomeCurrency,
  setRatesState,
} from '../src/state.js';

test('adds and removes expenses without mutating the original state', () => {
  const original = { ...initialState };
  const withExpense = addExpense(original, {
    id: 'expense-1',
    description: 'Lunch',
    amount: 800,
    currency: 'KES',
  });

  assert.equal(original.expenses.length, 0);
  assert.equal(withExpense.expenses[0].category, 'Other');
  assert.deepEqual(removeExpense(withExpense, 'expense-1').expenses, []);
});

test('updates selected currency, category filter, and exchange-rate state', () => {
  const state = setHomeCurrency(initialState, 'KES');
  assert.equal(state.homeCurrency, 'KES');
  assert.equal(setFilterCategory(state, 'Food').filterCategory, 'Food');
  assert.deepEqual(setRatesState(state, { ratesLoading: false, rates: { KES: 130 } }).rates, { KES: 130 });
});