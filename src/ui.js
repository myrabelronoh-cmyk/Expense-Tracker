import {
  calculateTotalInHomeCurrency,
  convertAmount,
  filterExpensesByCategory,
  formatMoney,
  EXPENSE_CATEGORIES,
  SUPPORTED_CURRENCIES,
} from './utilis.js';

/**
 * @param {HTMLElement} root
 */
export function cacheElements(root) {
  return {
    form: root.querySelector('#expense-form'),
    description: root.querySelector('#description'),
    amount: root.querySelector('#amount'),
    currency: root.querySelector('#currency'),
    category: root.querySelector('#category'),
    homeCurrency: root.querySelector('#home-currency'),
    filterCategory: root.querySelector('#filter-category'),
    ratesStatus: root.querySelector('#rates-status'),
    expenseList: root.querySelector('#expense-list'),
    emptyState: root.querySelector('#empty-state'),
    totalAmount: root.querySelector('#total-amount'),
    filteredLabel: root.querySelector('#filtered-label'),
  };
}

/**
 * @param {ReturnType<typeof cacheElements>} els
 */
export function populateSelects(els) {
  els.currency.innerHTML = SUPPORTED_CURRENCIES.map(
    (code) => `<option value="${code}">${code}</option>`
  ).join('');

  els.homeCurrency.innerHTML = SUPPORTED_CURRENCIES.map(
    (code) => `<option value="${code}">${code}</option>`
  ).join('');

  const categoryOptions = EXPENSE_CATEGORIES.map(
    (cat) => `<option value="${cat}">${cat}</option>`
  ).join('');
  els.category.innerHTML = categoryOptions;

  const filterOptions =
    `<option value="All">All categories</option>` +
    EXPENSE_CATEGORIES.map((cat) => `<option value="${cat}">${cat}</option>`).join('');
  els.filterCategory.innerHTML = filterOptions;
}

/**
 * @param {ReturnType<typeof cacheElements>} els
 * @param {{ ratesLoading: boolean, ratesError: string|null, rates: object|null, timeLastUpdateUtc?: string }} ratesInfo
 */
export function renderRatesStatus(els, ratesInfo) {
  const { ratesLoading, ratesError, rates, timeLastUpdateUtc } = ratesInfo;
  els.ratesStatus.classList.remove('status--loading', 'status--error', 'status--ok');

  if (ratesLoading) {
    els.ratesStatus.textContent = 'Loading live exchange rates…';
    els.ratesStatus.classList.add('status--loading');
    return;
  }

  if (ratesError) {
    els.ratesStatus.textContent = `Could not load rates: ${ratesError}. Totals may be unavailable until you retry.`;
    els.ratesStatus.classList.add('status--error');
    return;
  }

  if (rates) {
    const updated = timeLastUpdateUtc ? ` Last updated: ${timeLastUpdateUtc}.` : '';
    els.ratesStatus.textContent = `Live rates loaded.${updated}`;
    els.ratesStatus.classList.add('status--ok');
    return;
  }

  els.ratesStatus.textContent = 'Exchange rates not loaded yet.';
}

/**
 * @param {ReturnType<typeof cacheElements>} els
 * @param {import('./state.js').AppState} state
 */
export function renderExpenses(els, state) {
  const filtered = filterExpensesByCategory(state.expenses, state.filterCategory);
  const { homeCurrency, rates } = state;

  els.filteredLabel.textContent =
    state.filterCategory === 'All'
      ? 'Showing all expenses'
      : `Filtered by: ${state.filterCategory}`;

  if (filtered.length === 0) {
    els.emptyState.hidden = state.expenses.length > 0;
    els.expenseList.innerHTML = '';
    if (state.expenses.length > 0) {
      els.expenseList.innerHTML =
        '<li class="expense-item expense-item--muted">No expenses match this filter.</li>';
    }
  } else {
    els.emptyState.hidden = true;
    els.expenseList.innerHTML = filtered
      .map((expense) => {
        const converted =
          rates === null
            ? null
            : convertAmount(expense.amount, expense.currency, homeCurrency, rates);
        const original = formatMoney(expense.amount, expense.currency);
        const home =
          converted === null
            ? '—'
            : formatMoney(converted, homeCurrency);

        return `
          <li class="expense-item" data-id="${expense.id}">
            <div class="expense-item__main">
              <strong class="expense-item__title">${escapeHtml(expense.description)}</strong>
              <span class="expense-item__category">${escapeHtml(expense.category)}</span>
            </div>
            <div class="expense-item__amounts">
              <span class="expense-item__original" title="Original amount">${original}</span>
              <span class="expense-item__converted" title="In home currency">≈ ${home}</span>
            </div>
            <button type="button" class="btn btn--danger btn--icon delete-btn" aria-label="Delete expense">×</button>
          </li>
        `;
      })
      .join('');
  }

  const total = rates === null ? null : calculateTotalInHomeCurrency(filtered, homeCurrency, rates);
  els.totalAmount.textContent =
    total === null ? '—' : formatMoney(total, homeCurrency);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}