const budgetForm = document.getElementById('budget-form');
const monthInput = document.getElementById('month');
const incomeInput = document.getElementById('income');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDateInput = document.getElementById('expense-date');

const displayIncome = document.getElementById('display-income');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance = document.getElementById('display-balance');
const expenseItems = document.getElementById('expense-items');

let totalIncome = 0;
let totalExpenses = 0;
let expenses = []; // guardará objetos {name, amount, date}

// logica del formulario

function validateForm() {
  if (monthInput.value.trim() === '') {
    alert('Por favor, ingresa el mes.');
    return false;
  }
  if (incomeInput.value === '' || incomeInput.value <= 0) {
    alert('Ingresa un presupuesto válido.');
    return false;
  }
  if (expenseNameInput.value.trim() === '') {
    alert('Ingresa el nombre del gasto.');
    return false;
  }
  if (expenseAmountInput.value === '' || expenseAmountInput.value <= 0) {
    alert('Ingresa un monto de gasto válido.');
    return false;
  }
  return true;
}

function updateSummary() {
  displayIncome.textContent = totalIncome;
  displayExpenses.textContent = totalExpenses;
  displayBalance.textContent = totalIncome - totalExpenses;
}

function addExpense(name, amount) {
  const li = document.createElement('li');
  li.classList.add('p-2', 'bg-gray-100', 'rounded-lg', 'flex', 'justify-between', 'items-center');

  const left = document.createElement('div');
  left.innerHTML = `<strong>${name}</strong><div class="text-sm text-gray-600">${amount.toFixed(2)}</div>`;

  const right = document.createElement('div');
  right.classList.add('text-sm', 'text-gray-500');
  right.textContent = new Date().toLocaleDateString();

  li.appendChild(left);
  li.appendChild(right);
  expenseItems.appendChild(li);
}

budgetForm.addEventListener('submit', function(e) {
  e.preventDefault(); // Evita que la página se recargue

  // Validamos los datos
  if (!validateForm()) return;

  // Tomamos los valores
  const month = monthInput.value.trim();
  const income = parseFloat(incomeInput.value);
  const expenseName = expenseNameInput.value.trim();
  const expenseAmount = parseFloat(expenseAmountInput.value);

  // Fecha del gasto (editable) — si no se provee, usar hoy
  let expenseDate = expenseDateInput && expenseDateInput.value ? new Date(expenseDateInput.value) : new Date();

  // Guardamos el ingreso si es la primera vez
  if (totalIncome === 0) {
    totalIncome = income;
  }

  // Sumamos el gasto
  totalExpenses += expenseAmount;

  // Guardar gasto con fecha
  expenses.push({ name: expenseName, amount: expenseAmount, date: expenseDate.toISOString() });

  // Actualizamos el resumen
  updateSummary();

  // Agregamos el gasto a la lista
  addExpense(expenseName, expenseAmount);

  // Limpiamos los campos de gasto
  expenseNameInput.value = '';
  expenseAmountInput.value = '';
  // reset fecha a hoy
  if (expenseDateInput) expenseDateInput.value = new Date().toISOString().split('T')[0];
});

// Inicializar valores por defecto
(function initDefaults(){
  // Fecha actual en input date
  if (expenseDateInput) {
    expenseDateInput.value = new Date().toISOString().split('T')[0];
  }
})();
