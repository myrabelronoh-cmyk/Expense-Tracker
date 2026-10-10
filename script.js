const STORAGE_KEY = 'expense-tracker-data-v1';
const THEME_KEY = 'expense-tracker-theme';
const defaultTransactions = [
  { id: 1, type: 'expense', title: 'Rent', category: 'Housing', amount: 1450, date: '2026-10-01', tag: 'Monthly' },
  { id: 2, type: 'expense', title: 'Groceries', category: 'Food', amount: 215, date: '2026-10-08', tag: 'Essentials' },
  { id: 3, type: 'income', title: 'Monthly salary', category: 'Salary', amount: 4200, date: '2026-10-01', tag: 'Salary' },
  { id: 4, type: 'expense', title: 'Fuel', category: 'Transport', amount: 90, date: '2026-10-12', tag: 'Travel' },
  { id: 5, type: 'expense', title: 'Pharmacy', category: 'Health', amount: 68, date: '2026-10-15', tag: 'Care' },
  { id: 6, type: 'income', title: 'Freelance work', category: 'Freelance', amount: 750, date: '2026-10-20', tag: 'Side income' }
];

const budgetGoals = [
  { name: 'Housing', amount: 1600, used: 1450 },
  { name: 'Food', amount: 600, used: 215, warning: false },
  { name: 'Transport', amount: 250, used: 90 },
  { name: 'Shopping', amount: 400, used: 310, warning: true }
];

let currentType = 'expense';
let transactions = loadTransactions();
let editingId = null;

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultTransactions;
  } catch {
    return defaultTransactions;
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function getMonthSummary() {
  const income = transactions.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = transactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expense;
  const savingsRate = income ? ((income - expense) / income) * 100 : 0;

  return { income, expense, balance, savingsRate };
}

function renderSummary() {
  const { income, expense, balance, savingsRate } = getMonthSummary();
  document.getElementById('incomeValue').textContent = formatCurrency(income);
  document.getElementById('expenseValue').textContent = formatCurrency(expense);
  document.getElementById('balanceValue').textContent = formatCurrency(balance);
  document.getElementById('savingsValue').textContent = `${savingsRate.toFixed(0)}%`;
}

function renderChart() {
  const selectedCategory = document.getElementById('categoryFilter')?.value || 'All';
  const filtered = selectedCategory === 'All'
    ? transactions
    : transactions.filter(item => item.category === selectedCategory || (selectedCategory === 'Salary' && item.type === 'income'));

  const chartData = [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Apr', value: 0 },
    { label: 'May', value: 0 },
    { label: 'Jun', value: 0 },
    { label: 'Jul', value: 0 },
    { label: 'Aug', value: 0 },
    { label: 'Sep', value: 0 },
    { label: 'Oct', value: 0 }
  ];

  filtered.forEach(item => {
    const monthIndex = new Date(item.date).getMonth();
    if (monthIndex >= 0 && monthIndex < chartData.length) {
      chartData[monthIndex].value += Number(item.amount) * (item.type === 'expense' ? 1 : 0.35);
    }
  });

  const maxValue = Math.max(...chartData.map(item => item.value), 1);
  const bars = chartData.map(item => {
    const height = (item.value / maxValue) * 100;
    return `
      <div class="bar-col">
        <div class="bar-value">${formatCurrency(item.value).replace('.00', '')}</div>
        <div class="bar" style="height: ${height}%"></div>
        <div class="bar-label">${item.label}</div>
      </div>
    `;
  }).join('');

  document.getElementById('chartBars').innerHTML = bars;
}

function renderBudgets() {
  const list = budgetGoals.map(goal => {
    const percent = Math.min((goal.used / goal.amount) * 100, 100);
    const className = goal.warning ? 'warning' : '';
    const remaining = goal.amount - goal.used;
    return `
      <div class="budget-item ${className}">
        <div class="budget-head">
          <div class="budget-name">${goal.name}</div>
          <div class="tag">${Math.round(percent)}%</div>
        </div>
        <div class="progress"><span style="width:${Math.min(percent, 100)}%"></span></div>
        <div class="budget-meta">
          <span>${formatCurrency(goal.used)} used</span>
          <span>${formatCurrency(Math.max(remaining, 0))} left</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('budgetList').innerHTML = list;
}

function renderTransactions() {
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const items = sorted.slice(0, 6).map(item => {
    const sign = item.type === 'income' ? '+' : '-';
    return `
      <div class="transaction-item tx-${item.type}">
        <div class="tx-icon">${item.type === 'income' ? '↑' : '↓'}</div>
        <div class="tx-main">
          <div class="tx-name">${item.title}</div>
          <div class="tx-meta">${item.category} • ${item.date}</div>
        </div>
        <div class="tx-amount">${sign}${formatCurrency(item.amount)}</div>
        <div class="tx-actions">
          <button class="edit-btn" data-id="${item.id}" aria-label="Edit ${item.title}">Edit</button>
          <button class="delete-btn" data-id="${item.id}" aria-label="Delete ${item.title}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('transactionList').innerHTML = items;
}

function updateTypeButtons() {
  document.querySelectorAll('.toggle button').forEach(button => {
    button.classList.toggle('active', button.dataset.type === currentType);
  });
}

function resetForm() {
  document.getElementById('title').value = currentType === 'expense' ? 'Groceries' : 'Salary';
  document.getElementById('amount').value = currentType === 'expense' ? 120 : 2500;
  document.getElementById('category').value = currentType === 'expense' ? 'Food' : 'Salary';
  document.getElementById('tag').value = currentType === 'expense' ? 'Essentials' : 'Income';
  document.getElementById('date').valueAsDate = new Date();
}

document.querySelectorAll('.toggle button').forEach(button => {
  button.addEventListener('click', () => {
    currentType = button.dataset.type;
    updateTypeButtons();
    resetForm();
  });
});

function populateFormForEdit(transaction) {
  editingId = transaction.id;
  currentType = transaction.type;
  updateTypeButtons();

  document.getElementById('title').value = transaction.title;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('category').value = transaction.category;
  document.getElementById('tag').value = transaction.tag || '';
  document.getElementById('date').value = transaction.date;

  document.getElementById('submitButton').textContent = 'Update transaction';
  document.getElementById('cancelEdit').classList.remove('hidden');
}

function resetFormMode() {
  editingId = null;
  document.getElementById('submitButton').textContent = 'Save transaction';
  document.getElementById('cancelEdit').classList.add('hidden');
  resetForm();
}

document.getElementById('transactionForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const tag = document.getElementById('tag').value.trim() || 'General';

  if (!title || !amount || !date) return;

  if (editingId !== null) {
    transactions = transactions.map(item => item.id === editingId
      ? { ...item, type: currentType, title, category, amount, date, tag }
      : item
    );
  } else {
    transactions.push({
      id: Date.now(),
      type: currentType,
      title,
      category,
      amount,
      date,
      tag
    });
  }

  saveTransactions();
  renderSummary();
  renderBudgets();
  renderTransactions();
  resetFormMode();
});

document.getElementById('transactionList').addEventListener('click', (event) => {
  const editButton = event.target.closest('.edit-btn');
  if (editButton) {
    const idToEdit = Number(editButton.dataset.id);
    const item = transactions.find(entry => entry.id === idToEdit);
    if (item) populateFormForEdit(item);
    return;
  }

  const deleteButton = event.target.closest('.delete-btn');
  if (!deleteButton) return;

  const idToDelete = Number(deleteButton.dataset.id);
  transactions = transactions.filter(item => item.id !== idToDelete);
  saveTransactions();
  renderSummary();
  renderBudgets();
  renderTransactions();
  if (editingId === idToDelete) resetFormMode();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
  resetFormMode();
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  document.getElementById('themeToggle').textContent = isDark ? 'Light mode' : 'Dark mode';
});

document.getElementById('categoryFilter').addEventListener('change', () => {
  renderChart();
});

document.getElementById('quickAdd').addEventListener('click', () => {
  document.getElementById('title').focus();
});

const savedTheme = localStorage.getItem(THEME_KEY) === 'dark';
document.body.classList.toggle('dark-mode', savedTheme);
document.getElementById('themeToggle').textContent = savedTheme ? 'Light mode' : 'Dark mode';

document.getElementById('date').valueAsDate = new Date();
updateTypeButtons();
resetFormMode();
renderSummary();
renderChart();
renderBudgets();
renderTransactions();
