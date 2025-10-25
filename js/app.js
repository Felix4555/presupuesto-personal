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
const STORAGE_KEY = 'presupuestoData';

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
  displayIncome.textContent = totalIncome.toFixed(2);
  displayExpenses.textContent = totalExpenses.toFixed(2);
  displayBalance.textContent = (totalIncome - totalExpenses).toFixed(2);
}

function addExpense(name, amount, dateISO) {
  const li = document.createElement('li');
  li.classList.add('p-2', 'bg-gray-100', 'rounded-lg', 'flex', 'justify-between', 'items-center');

  const left = document.createElement('div');

  left.innerHTML = `<strong>${name}</strong><div class="text-sm text-gray-600">$${amount.toFixed(2)}</div>`;

  const right = document.createElement('div');
  right.classList.add('text-sm', 'text-gray-500');
  // mostrar la fecha real del gasto si se proporcionó
  if (dateISO) {
    try {
      right.textContent = new Date(dateISO).toLocaleDateString();
    } catch (e) {
      right.textContent = dateISO;
    }
  } else {
    right.textContent = new Date().toLocaleDateString();
  }

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

  // Guardamos el ingreso si es la primera vez (o actualizar si cambió)
  if (totalIncome === 0) {
    totalIncome = income;
  } else {
    // si el usuario ingresó un nuevo valor de income, respetarlo
    if (!isNaN(income) && income > 0) totalIncome = income;
  }

  // Sumamos el gasto
  totalExpenses += expenseAmount;

  // Guardar gasto con fecha
  const iso = expenseDate.toISOString();
  expenses.push({ name: expenseName, amount: expenseAmount, date: iso });

  // Actualizamos el resumen
  updateSummary();

  // Agregamos el gasto a la lista (mostrando su fecha)
  addExpense(expenseName, expenseAmount, iso);

  // Persistir datos
  saveData();

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
  // Cargar datos guardados (si los hay)
  loadData();
})();

function saveData() {
  const data = {
    month: monthInput.value.trim(),
    totalIncome,
    expenses
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('No se pudo guardar en localStorage', e);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;

    if (data.month) monthInput.value = data.month;
    if (typeof data.totalIncome === 'number') {
      totalIncome = data.totalIncome;
      incomeInput.value = totalIncome;
    }
    if (Array.isArray(data.expenses)) {
      expenses = data.expenses;
      // recalcular totalExpenses
      totalExpenses = expenses.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
      // renderizar gastos
      renderExpenses();
    }
    updateSummary();
  } catch (e) {
    console.error('Error cargando datos de localStorage', e);
  }
}

function renderExpenses() {
  expenseItems.innerHTML = '';
  expenses.forEach(it => {
    addExpense(it.name, parseFloat(it.amount), it.date);
  });
}
