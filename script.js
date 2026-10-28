
const STORAGE_KEY = "personalExpenseTracker.transactions";
let transactions = loadTransactions();
 

const form = document.getElementById("transactionForm");
const typeEl = document.getElementById("type");
const descEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const dateEl = document.getElementById("date");
const filterEl = document.getElementById("filter");
const searchEl = document.getElementById("search");
const clearBtn = document.getElementById("clearBtn");
const tbody = document.getElementById("transactionBody");
 
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const balanceEl = document.getElementById("currentBalance");
 

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
 
function formatLKR(value) {
  return "LKR " + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
 
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
 

function loadTransactions() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}
 
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
 

function setError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
}
 
function validateForm() {
  let valid = true;
 
  const description = descEl.value.trim();
  const amount = parseFloat(amountEl.value);
 
  setError(descEl, "descriptionError", description ? "" : "Enter a description.");
  if (!description) valid = false;
 
  if (amountEl.value === "" || isNaN(amount) || amount <= 0) {
    setError(amountEl, "amountError", "Enter an amount greater than 0.");
    valid = false;
  } else {
    setError(amountEl, "amountError", "");
  }
 
  setError(categoryEl, "categoryError", categoryEl.value ? "" : "Select a category.");
  if (!categoryEl.value) valid = false;
 
  setError(dateEl, "dateError", dateEl.value ? "" : "Select a date.");
  if (!dateEl.value) valid = false;
 
  return valid;
}
 
function clearErrors() {
  [
    [descEl, "descriptionError"],
    [amountEl, "amountError"],
    [categoryEl, "categoryError"],
    [dateEl, "dateError"],
  ].forEach(([el, id]) => setError(el, id, ""));
}
 

function addTransaction(e) {
  e.preventDefault();
  if (!validateForm()) return;
 
  transactions.push({
    id: Date.now(),
    type: typeEl.value,
    description: descEl.value.trim(),
    amount: parseFloat(amountEl.value),
    category: categoryEl.value,
    date: dateEl.value,
  });
 
  saveTransactions();
  render();
  resetForm();
  alert("Transaction added successfully!");
}
 
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
}
 
function resetForm() {
  form.reset();
  dateEl.value = todayISO();
  clearErrors();
}
 

function updateSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;
 
  totalIncomeEl.textContent = formatLKR(income);
  totalExpensesEl.textContent = formatLKR(expenses);
  balanceEl.textContent = formatLKR(balance);
  balanceEl.classList.toggle("negative", balance < 0);
}
 
function getVisibleTransactions() {
  const filter = filterEl.value;
  const query = searchEl.value.trim().toLowerCase();
 
  return transactions.filter((t) => {
    const matchesType = filter === "all" || t.type === filter;
    const matchesSearch =
      !query ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });
}
 
function renderTable() {
  const visible = getVisibleTransactions();
 
  if (visible.length === 0) {
    tbody.innerHTML = `<tr><td class="empty" colspan="6">No transactions found.</td></tr>`;
    return;
  }
 
  tbody.innerHTML = visible
    .map((t) => {
      const isIncome = t.type === "income";
      const sign = isIncome ? "+" : "\u2212";
      return `
        <tr>
          <td>${escapeHTML(t.date)}</td>
          <td>${escapeHTML(t.description)}</td>
          <td><span class="badge badge-${t.type}">${isIncome ? "Income" : "Expense"}</span></td>
          <td>${escapeHTML(t.category)}</td>
          <td class="num amount-${t.type}">${sign} ${formatLKR(t.amount)}</td>
          <td><button type="button" class="btn btn-delete" data-id="${t.id}">Delete</button></td>
        </tr>`;
    })
    .join("");
}
 
function render() {
  updateSummary();
  renderTable();
}
 

form.addEventListener("submit", addTransaction);
clearBtn.addEventListener("click", resetForm);
filterEl.addEventListener("change", renderTable);
searchEl.addEventListener("input", renderTable);
 
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (btn) deleteTransaction(Number(btn.dataset.id));
});
 

dateEl.value = todayISO();
render();