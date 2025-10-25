const budgetForm = document.getElementById('budget-form');
const monthInput = document.getElementById('month');
const incomeInput = document.getElementById('income');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');

const displayIncome = document.getElementById('display-income');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance = document.getElementById('display-balance');
const expenseItems = document.getElementById('expense-items');

let totalIncome = 0;
let totalExpenses = 0;

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
  li.textContent = `${name}: $${amount}`;
  li.classList.add('p-2', 'bg-gray-100', 'rounded-lg');
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

  // Guardamos el ingreso si es la primera vez
  if (totalIncome === 0) {
    totalIncome = income;
  }

  // Sumamos el gasto
  totalExpenses += expenseAmount;

  // Actualizamos el resumen
  updateSummary();

  // Agregamos el gasto a la lista
  addExpense(expenseName, expenseAmount);

  // Limpiamos los campos de gasto
  expenseNameInput.value = '';
  expenseAmountInput.value = '';
});
