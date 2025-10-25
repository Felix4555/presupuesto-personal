const budgetForm = document.getElementById('budget-form');
const monthInput = document.getElementById('month');
const incomeInput = document.getElementById('income');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDateInput = document.getElementById('expense-date');
const saveConfigBtn = document.getElementById('save-config');

const displayIncome = document.getElementById('display-income');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance = document.getElementById('display-balance');
const expenseItems = document.getElementById('expense-items');
const headerMonth = document.getElementById('header-month');
const headerBudget = document.getElementById('header-budget');

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
  li.classList.add('p-2', 'bg-gray-100', 'rounded-lg');

  const info = document.createElement('div');
  info.innerHTML = `<strong>${name}</strong><div class="text-sm text-gray-600">$${amount.toFixed(2)}</div>`;

  const meta = document.createElement('div');
  meta.classList.add('flex', 'items-center', 'gap-3');

  const dateDiv = document.createElement('div');
  dateDiv.classList.add('text-sm', 'text-gray-500');
  if (dateISO) {
    try { dateDiv.textContent = new Date(dateISO).toLocaleDateString(); } catch(e) { dateDiv.textContent = dateISO; }
  } else {
    dateDiv.textContent = new Date().toLocaleDateString();
  }

  // botones editar / eliminar
  const editBtn = document.createElement('button');
  editBtn.classList.add('text-blue-600', 'underline', 'text-sm');
  editBtn.textContent = 'Editar';
  editBtn.addEventListener('click', () => editExpenseByElement(li.dataset.id));

  const delBtn = document.createElement('button');
  delBtn.classList.add('text-red-600', 'underline', 'text-sm');
  delBtn.textContent = 'Eliminar';
  delBtn.addEventListener('click', () => deleteExpenseByElement(li.dataset.id));

  meta.appendChild(dateDiv);
  meta.appendChild(editBtn);
  meta.appendChild(delBtn);

  li.appendChild(info);
  li.appendChild(meta);
  // asociar id (si hay) para operaciones; si no, se hará cuando se renderice desde data
  if (dateISO && typeof dateISO === 'string' && dateISO.startsWith('{')) {
    // nothing
  }
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

  // Guardar gasto con fecha y id
  const iso = expenseDate.toISOString();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  expenses.push({ id, name: expenseName, amount: expenseAmount, date: iso });

  // Actualizamos el resumen
  updateSummary();

  // Agregamos el gasto a la lista (mostrando su fecha)
  renderExpenses();

  // Persistir datos
  saveData();
  // Mostrar notificación de éxito al agregar
  showToast('Gasto agregado');

  // Limpiamos los campos de gasto
  expenseNameInput.value = '';
  expenseAmountInput.value = '';
  // reset fecha a hoy
  if (expenseDateInput) expenseDateInput.value = new Date().toISOString().split('T')[0];
  // actualizar header presupuesto si cambió
  renderHeader();
});

// Guardar configuración (mes + presupuesto) manualmente
if (saveConfigBtn) {
  saveConfigBtn.addEventListener('click', () => {
    const month = monthInput.value.trim();
    const income = parseFloat(incomeInput.value);
    if (!month) { alert('Por favor ingresa el mes.'); return; }
    if (isNaN(income) || income <= 0) { alert('Ingresa un presupuesto válido.'); return; }
    totalIncome = income;
    saveData();
    updateSummary();
    renderHeader();
    showToast('Configuración guardada');
  });
}

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
    const li = document.createElement('li');
    li.classList.add('p-2', 'bg-gray-100', 'rounded-lg');
    li.dataset.id = it.id;

    const info = document.createElement('div');
    info.innerHTML = `<strong>${it.name}</strong><div class="text-sm text-gray-600">$${parseFloat(it.amount).toFixed(2)}</div>`;

    const meta = document.createElement('div');
    meta.classList.add('flex', 'items-center', 'gap-3');

    const dateDiv = document.createElement('div');
    dateDiv.classList.add('text-sm', 'text-gray-500');
    try { dateDiv.textContent = new Date(it.date).toLocaleDateString(); } catch(e) { dateDiv.textContent = it.date; }

    const editBtn = document.createElement('button');
    editBtn.classList.add('text-blue-600', 'underline', 'text-sm');
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => editExpense(it.id));

    const delBtn = document.createElement('button');
    delBtn.classList.add('text-red-600', 'underline', 'text-sm');
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', () => deleteExpense(it.id));

    meta.appendChild(dateDiv);
    meta.appendChild(editBtn);
    meta.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(meta);
    expenseItems.appendChild(li);
  });
}

// Toast helper
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'bg-gray-800 text-white px-4 py-2 rounded shadow-lg opacity-0 transition-opacity duration-300';
  t.textContent = message;
  container.appendChild(t);
  // force reflow then show
  requestAnimationFrame(() => { t.classList.remove('opacity-0'); t.classList.add('opacity-100'); });
  setTimeout(() => {
    t.classList.remove('opacity-100');
    t.classList.add('opacity-0');
    setTimeout(() => container.removeChild(t), 300);
  }, duration);
}

function deleteExpense(id) {
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  // confirmar eliminación
  if (!confirm('¿Seguro que deseas eliminar este gasto?')) return;
  // ajustar totales
  totalExpenses -= parseFloat(expenses[idx].amount) || 0;
  expenses.splice(idx,1);
  saveData();
  renderExpenses();
  updateSummary();
  renderHeader();
  showToast('Gasto eliminado');
}

function editExpense(id) {
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  const it = expenses[idx];
  // rellenar formulario con datos del gasto
  expenseNameInput.value = it.name;
  expenseAmountInput.value = it.amount;
  try { expenseDateInput.value = new Date(it.date).toISOString().split('T')[0]; } catch(e) {}
  // eliminar el registro original para que al enviar se reemplace
  // no pedir confirm al editar: eliminamos temporalmente sin confirmación
  expenses.splice(idx,1);
  totalExpenses -= parseFloat(it.amount) || 0;
  renderExpenses();
  updateSummary();
  renderHeader();
  showToast('Edita los campos y guarda el gasto');
}

// helpers que usan dataset id cuando se crea con addExpense (compat)
function deleteExpenseByElement(datasetId) { if (!datasetId) return; deleteExpense(datasetId); }
function editExpenseByElement(datasetId) { if (!datasetId) return; editExpense(datasetId); }

function renderHeader() {
  if (headerMonth) headerMonth.textContent = monthInput.value ? `Mes: ${monthInput.value}` : '';
  if (headerBudget) headerBudget.textContent = incomeInput.value ? `Presupuesto: $${parseFloat(incomeInput.value).toFixed(2)}` : '';
}
