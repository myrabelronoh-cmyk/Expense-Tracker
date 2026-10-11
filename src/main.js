import { fetchExchangeRates } from './api.js';
import {
  initialState,
  addExpense,
  removeExpense,
  setHomeCurrency,
  setFilterCategory,
  setRatesState,
} from './state.js';
import { cacheElements, populateSelects, renderExpenses, renderRatesStatus } from './ui.js';
import { EXPENSE_CATEGORIES } from './utils.js';

/** @type {import('./state.js').AppState} */
let state = { ...initialState };

const app = document.querySelector('#app');
const els = cacheElements(app);
populateSelects(els);

function render() {
  renderRatesStatus(els, {
    ratesLoading: state.ratesLoading,
    ratesError: state.ratesError,
    rates: state.rates,
    timeLastUpdateUtc: state.ratesMeta?.timeLastUpdateUtc,
  });
  renderExpenses(els, state);
}

async function loadRates() {
  state = setRatesState(state, { ratesLoading: true, ratesError: null });
  render();

  try {
    const data = await fetchExchangeRates();
    state = setRatesState(state, {
      ratesLoading: false,
      ratesError: null,
      rates: data.rates,
    });
    state = { ...state, ratesMeta: { timeLastUpdateUtc: data.timeLastUpdateUtc } };
  } catch (err) {
    state = setRatesState(state, {
      ratesLoading: false,
      ratesError: err instanceof Error ? err.message : 'Unknown error',
      rates: state.rates,
    });
  }
  render();
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = els.description.value.trim();
  const amount = parseFloat(els.amount.value, 10);
  const currency = els.currency.value;
  const category = els.category.value;

  if (!description || Number.isNaN(amount) || amount < 0) {
    return;
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return;
  }

  state = addExpense(state, { description, amount, currency, category });
  els.form.reset();
  els.currency.value = currency;
  render();
});

els.expenseList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const button = target.closest('.delete-btn');
  if (!button) {
    return;
  }
  const item = button.closest('[data-id]');
  if (!item) {
    return;
  }
  const id = item.getAttribute('data-id');
  if (id) {
    state = removeExpense(state, id);
    render();
  }
});

els.homeCurrency.addEventListener('change', () => {
  const next = els.homeCurrency.value;
  state = setHomeCurrency(state, next);
  loadRates();
});

els.filterCategory.addEventListener('change', () => {
  state = setFilterCategory(state, els.filterCategory.value);
  render();
});

document.querySelector('#retry-rates')?.addEventListener('click', () => {
  loadRates();
});

els.homeCurrency.value = state.homeCurrency;
loadRates();