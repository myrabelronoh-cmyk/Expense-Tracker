/** @typedef {import('./utilis.js').Expense} Expense */

/** @typedef {{ expenses: Expense[], homeCurrency: string, rates: Record<string, number>|null, ratesLoading: boolean, ratesError: string|null, filterCategory: string }} AppState */

/** @type {AppState} */
export const initialState = {
  expenses: [],
  homeCurrency: 'USD',
  rates: null,
  ratesLoading: false,
  ratesError: null,
  filterCategory: 'All',
};

/**
 * @param {AppState} state
 * @param {Omit<Expense, 'id'> & { id?: string }} expenseInput
 */
export function addExpense(state, expenseInput) {
  const withDefaults = { ...expenseInput, category: expenseInput.category ?? 'Other' };
  const newExpense = {
    ...withDefaults,
    id: expenseInput.id ?? crypto.randomUUID(),
  };
  return {
    ...state,
    expenses: [...state.expenses, newExpense],
  };
}

/**
 * @param {AppState} state
 * @param {string} id
 */
export function removeExpense(state, id) {
  return {
    ...state,
    expenses: state.expenses.filter((expense) => expense.id !== id),
  };
}

/**
 * @param {AppState} state
 * @param {string} homeCurrency
 */
export function setHomeCurrency(state, homeCurrency) {
  return {
    ...state,
    homeCurrency,
  };
}

/**
 * @param {AppState} state
 * @param {string} category
 */
export function setFilterCategory(state, category) {
  return {
    ...state,
    filterCategory: category,
  };
}

/**
 * @param {AppState} state
 * @param {Partial<Pick<AppState, 'rates'|'ratesLoading'|'ratesError'>>} patch
 */
export function setRatesState(state, patch) {
  return {
    ...state,
    ...patch,
  };
}