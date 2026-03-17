const firebaseConfig = {
  apiKey: "AIzaSyDqDrusuQqUVNv30nim7kRVgID_98XCfg",
  authDomain: "inventory-system-5a036.firebaseapp.com",
  databaseURL: "https://inventory-system-5a036-default-rtdb.firebaseio.com",
  projectId: "inventory-system-5a036",
  storageBucket: "inventory-system-5a036.firebasestorage.app",
  messagingSenderId: "834014896123",
  appId: "1:834014896123:web:58533a5f3d44b94ad1355e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const loadingScreen = document.getElementById('loadingScreen');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const auth = document.getElementById('auth');
let progress = 0;

const loadingInterval = setInterval(() => {
  progress += 2;
  if (progress > 100) progress = 100;
  progressFill.style.width = progress + '%';
  progressText.textContent = progress + '%';

  if (progress >= 100) {
    clearInterval(loadingInterval);
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      auth.classList.remove('hidden');
    }, 500);
  }
}, 30);

const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authBtn = document.getElementById('authBtn');
const switchMode = document.getElementById('switchMode');
const msg = document.getElementById('msg');
const username = document.getElementById('username');
const password = document.getElementById('password');
const clearInventoryBtn = document.getElementById('clearInventoryBtn');
const resetAllDataBtn = document.getElementById('resetAllDataBtn');
const dashBtn = document.getElementById('dashBtn');
const ingredientsBtn = document.getElementById('ingredientsBtn');
const productsBtn = document.getElementById('productsBtn');
const deliveriesBtn = document.getElementById('deliveriesBtn');
const lapsesBtn = document.getElementById('lapsesBtn');
const movementBtn = document.getElementById('movementBtn');
const accountsBtn = document.getElementById('accountsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const lightTheme = document.getElementById('lightTheme');
const darkTheme = document.getElementById('darkTheme');
const dashboard = document.getElementById('dashboard');
const notification = document.getElementById('notification');
const searchIngredient = document.getElementById("searchIngredient");
const searchProduct2 = document.getElementById("searchProduct2");
// ===== INPUT ELEMENTS =====

// Ingredients
const ingredientName = document.getElementById("ingredientName");
const ingredientQty = document.getElementById("ingredientQty");

// Products
const productName2 = document.getElementById("productName2");
const productQty2 = document.getElementById("productQty2");

// Deliveries
const deliveryItem = document.getElementById("deliveryItem");
const deliveryQty = document.getElementById("deliveryQty");

// Lapses
const lapseItem = document.getElementById("lapseItem");
const lapseQty = document.getElementById("lapseQty");
const lapseCost = document.getElementById("lapseCost");
const newUserName = document.getElementById('newUserName');
const newUserPass = document.getElementById('newUserPass');
const newUserRole = document.getElementById('newUserRole');
const createUserBtn = document.getElementById('createUserBtn');
const accountMsg = document.getElementById('accountMsg');

let users = [];
db.ref("users").on("value", snapshot => {
  users = snapshot.val() || [];

  users = users.map(u => ({
    ...u,
    role: u.role || (u.admin ? 'admin' : 'staff')
  }));
});

let currentUser = null;
let isLogin = true;

authForm.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    authForm.requestSubmit();
  }
});

authForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = username.value.trim();
  const p = password.value.trim();

  if (!u || !p) {
    msg.textContent = 'Fill all fields';
    return;
  }

  login(u, p);
});

function register(u, p) {
  if (users.find(x => x.user.toLowerCase() === u.toLowerCase())) {
    msg.textContent = 'Username exists';
    return;
  }

  const firstUser = users.length === 0;
  const role = firstUser ? 'admin' : 'staff';

  users.push({
    user: u,
    pass: p,
    role: role
  });

  db.ref("users").set(users);
  msg.style.color = 'green';
  msg.textContent = `Account created as ${role}. Login now.`;
  username.value = '';
  password.value = '';
}

function login(u, p) {
  const found = users.find(x => x.user === u && x.pass === p);

  if (!found) {
    msg.textContent = 'Invalid credentials';
    return;
  }

  currentUser = found;
  auth.classList.add('hidden');
  dashboard.classList.remove('hidden');
  document.getElementById('welcome').textContent = `Welcome: ${found.user} (${found.role})`;

  if (found.role === 'staff') {
    accountsBtn.style.display = 'none';
  } else {
    accountsBtn.style.display = 'flex';
  }

  showSection('dash');
  username.value = '';
  password.value = '';
}

dashBtn.onclick = () => showSection('dash');
accountsBtn.onclick = () => showSection('accounts');
settingsBtn.onclick = () => showSection('settings');
ingredientsBtn.onclick = () => showSection('ingredients');
productsBtn.onclick = () => showSection('products');
deliveriesBtn.onclick = () => showSection('deliveries');
lapsesBtn.onclick = () => showSection('lapses');
movementBtn.onclick = () => showSection('movement');
logoutBtn.onclick = () => location.reload();

function showSection(id) {
  ['dash','ingredients','products','deliveries','lapses','movement','accounts','settings'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });

  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));

if (id === 'dash') dashBtn.classList.add('active');
else if (id === 'ingredients') ingredientsBtn.classList.add('active');
else if (id === 'products') productsBtn.classList.add('active');
else if (id === 'deliveries') deliveriesBtn.classList.add('active');
else if (id === 'lapses') lapsesBtn.classList.add('active');
else if (id === 'movement') movementBtn.classList.add('active');
else if (id === 'accounts') accountsBtn.classList.add('active');
else if (id === 'settings') settingsBtn.classList.add('active');
  
  if (id === 'accounts') {
    if (!canManageAccounts()) {
      showSection('dash');
      return;
    }
    loadUsers();
  }
}

function canManageAccounts() {
  return currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
}

function clearInventoryData() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Only admin can do this.");
    return;
  }

  const confirmed = confirm("Clear all ingredients, products, deliveries, lapses, and movements?");
  if (!confirmed) return;

  ingredients = [];
  products = [];
  deliveries = [];
  lapses = [];
  movements = [];

  db.ref("ingredients").set([]);
  db.ref("products").set([]);
  db.ref("deliveries").set([]);
  db.ref("lapses").set([]);
  db.ref("movements").set([]);

  showNotification("Inventory data cleared.");
  addMovement("SYSTEM", "Admin Clear", 0, 0, "Cleared all inventory data");
}

function resetAllSystemData() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Only admin can do this.");
    return;
  }

  const confirmed = confirm("Reset the whole system? This will erase inventory, logs, and all accounts except your current admin account.");
  if (!confirmed) return;

  const adminAccount = {
    user: currentUser.user,
    pass: currentUser.pass,
    role: 'admin'
  };

  ingredients = [];
  products = [];
  deliveries = [];
  lapses = [];
  movements = [];
  users = [adminAccount];

  db.ref("ingredients").set([]);
  db.ref("products").set([]);
  db.ref("deliveries").set([]);
  db.ref("lapses").set([]);
  db.ref("movements").set([]);
  db.ref("users").set([adminAccount]);

  loadUsers();
  showNotification("System reset completed.");
  addMovement("SYSTEM", "Admin Reset", 0, 0, "Reset entire system");
}

function canEditRole(targetRole) {
  if (!currentUser) return false;

  if (currentUser.role === 'admin') return true;

  if (currentUser.role === 'manager') {
    return targetRole !== 'admin';
  }

  return false;
}

function allowedRolesForCreator() {
  if (!currentUser) return [];
  if (currentUser.role === 'admin') return ['admin', 'manager', 'staff'];
  if (currentUser.role === 'manager') return ['manager', 'staff'];
  return [];
}

function loadUsers() {
  if (!canManageAccounts()) return;

  const table = document.getElementById('userTable');
  table.innerHTML = `
    <tr>
      <th>Username</th>
      <th>Password</th>
      <th>Role</th>
      <th>Action</th>
    </tr>
  `;

  users.forEach((u, i) => {
    if (currentUser.role === 'manager' && u.role === 'admin') return;

    const roleOptions = ['admin', 'manager', 'staff']
      .filter(role => currentUser.role === 'admin' || role !== 'admin')
      .map(role => `<option value="${role}" ${u.role === role ? 'selected' : ''}>${role}</option>`)
      .join('');

    table.innerHTML += `
      <tr>
        <td><input type="text" value="${u.user}" data-index="${i}" class="edit-user"></td>
        <td><input type="password" value="${u.pass}" data-index="${i}" class="edit-pass"></td>
        <td>
          <select data-index="${i}" class="edit-role">
            ${roleOptions}
          </select>
        </td>
        <td>
          <button class="edit-btn" onclick="saveUser(${i})">Save</button>
          <button class="delete-btn" onclick="deleteUser(${i})">Delete</button>
        </td>
      </tr>
    `;
  });

  setupCreateAccountRoleOptions();
}

function setupCreateAccountRoleOptions() {
  const roleSelect = document.getElementById('newUserRole');
  if (!roleSelect) return;

  const roles = allowedRolesForCreator();
  roleSelect.innerHTML = '';

  roles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    roleSelect.appendChild(option);
  });
}

function saveUser(i) {
  if (!canManageAccounts()) return;

  const inputsUser = document.querySelectorAll('.edit-user');
  const inputsPass = document.querySelectorAll('.edit-pass');
  const inputsRole = document.querySelectorAll('.edit-role');

  const rowIndex = Array.from(inputsUser).findIndex(input => Number(input.dataset.index) === i);
  if (rowIndex === -1) return;

  const newUser = inputsUser[rowIndex].value.trim();
  const newPass = inputsPass[rowIndex].value.trim();
  const newRole = inputsRole[rowIndex].value;

  if (!newUser || !newPass || !newRole) {
    alert('Fill all fields');
    return;
  }

  if (!canEditRole(users[i].role) || !canEditRole(newRole)) {
    alert('You are not allowed to edit this account.');
    return;
  }

  const duplicate = users.find((u, idx) => idx !== i && u.user.toLowerCase() === newUser.toLowerCase());
  if (duplicate) {
    alert('Username already exists');
    return;
  }

  const oldUser = users[i].user;
  const oldRole = users[i].role;

  users[i].user = newUser;
  users[i].pass = newPass;
  users[i].role = newRole;

  db.ref("users").set(users);
  loadUsers();
  showNotification('Account updated successfully!');
  addMovement('SYSTEM', 'User Update', 0, 0, `Changed "${oldUser}" (${oldRole}) to "${newUser}" (${newRole})`);
}

function deleteUser(i) {
  if (!canManageAccounts()) return;

  const target = users[i];
  if (!target) return;

  if (!canEditRole(target.role)) {
    alert('You are not allowed to delete this account.');
    return;
  }

  if (target.user === currentUser.user) {
    alert('You cannot delete your own account while logged in.');
    return;
  }

  const deletedUser = target.user;
  const deletedRole = target.role;

  users.splice(i, 1);
  db.ref("users").set(users);
  loadUsers();
  showNotification('Account deleted!');
  addMovement('SYSTEM', 'User Delete', 0, 0, `Deleted user "${deletedUser}" (${deletedRole})`);
}

if (createUserBtn) {
  createUserBtn.addEventListener('click', () => {
    if (!canManageAccounts()) return;

    const u = newUserName.value.trim();
    const p = newUserPass.value.trim();
    const r = newUserRole.value;

    accountMsg.textContent = '';
    accountMsg.style.color = 'red';

    if (!u || !p || !r) {
      accountMsg.textContent = 'Fill all fields';
      return;
    }

    if (users.find(x => x.user.toLowerCase() === u.toLowerCase())) {
      accountMsg.textContent = 'Username exists';
      return;
    }

    if (!allowedRolesForCreator().includes(r)) {
      accountMsg.textContent = 'You are not allowed to create that role';
      return;
    }

    users.push({
      user: u,
      pass: p,
      role: r
    });

    db.ref("users").set(users);
    loadUsers();
    showNotification('Account created!');
    addMovement('SYSTEM', 'User Create', 0, 0, `Created account "${u}" with role "${r}"`);

    accountMsg.style.color = 'green';
    accountMsg.textContent = `Account created: ${u} (${r})`;

    newUserName.value = '';
    newUserPass.value = '';
    setupCreateAccountRoleOptions();
  });
}

if (clearInventoryBtn) {
  clearInventoryBtn.addEventListener('click', clearInventoryData);
}

if (resetAllDataBtn) {
  resetAllDataBtn.addEventListener('click', resetAllSystemData);
}

toggleSidebar.onclick = () => sidebar.classList.toggle('minimized');
lightTheme.onclick = () => document.body.classList.remove('dark');
darkTheme.onclick = () => document.body.classList.add('dark');

function showNotification(text) {
  notification.textContent = text;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 2000);
}

let ingredients = [];
let products = [];
let deliveries = [];
let lapses = [];
let movements = [];

db.ref("ingredients").on("value", snap => {
  ingredients = snap.val() || [];
  renderIngredients();
  updateDashboard();
});

db.ref("products").on("value", snap => {
  products = snap.val() || [];
  renderProducts();
  updateDashboard();
});

db.ref("deliveries").on("value", snap => {
  deliveries = snap.val() || [];
  renderDeliveries();
  updateDashboard();
});

db.ref("lapses").on("value", snap => {
  lapses = snap.val() || [];
  renderLapses();
  updateDashboard();
});

db.ref("movements").on("value", snap => {
  movements = snap.val() || [];
  renderMovements();
  renderRecentActivity();
  updateDashboard();
});

document.getElementById("addIngredientBtn").onclick = () => {
  const name = ingredientName.value.trim();
  const qty = Number(ingredientQty.value);

  if (!name || qty <= 0) return;

let existing = ingredients.find(i => i.name.toLowerCase() === name.toLowerCase());

if (existing) {
  existing.qty += qty;
} else {
  ingredients.push({ name, qty });
}

  db.ref("ingredients").set(JSON.parse(JSON.stringify(ingredients)));

  addMovement(name, "Ingredient Added", qty, 0);

  ingredientName.value = "";
  ingredientQty.value = 1;
};

function renderIngredients() {
  const table = document.getElementById("ingredientTable");
  const keyword = (searchIngredient?.value || "").toLowerCase().trim();

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Qty</th>
      <th>Action</th>
    </tr>
  `;

  const filtered = ingredients.filter(item =>
    item.name.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    table.innerHTML += `
      <tr>
        <td colspan="3">No ingredients found.</td>
      </tr>
    `;
    return;
  }

  filtered.forEach((item) => {
    const originalIndex = ingredients.findIndex(
      x => x.name === item.name && x.qty === item.qty
    );

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>
  <button class="plus" onclick="updateIngredient(${originalIndex}, 1)">+</button>
  <button class="minus" onclick="updateIngredient(${originalIndex}, -1)">−</button>
  <button class="delete-product-btn" onclick="deleteIngredient(${originalIndex})">Delete</button>
</td>
      </tr>
    `;
  });
}

function updateIngredient(index, change) {
  if (!ingredients[index]) return;

  ingredients[index].qty += change;

  if (ingredients[index].qty < 0) {
    ingredients[index].qty = 0;
  }

  db.ref("ingredients").set(JSON.parse(JSON.stringify(ingredients)));

  addMovement(
    ingredients[index].name,
    change > 0 ? "Manual Add" : "Manual Deduct",
    Math.abs(change),
    0
  );
}

function deleteIngredient(i) {
  addMovement(ingredients[i].name, "Ingredient Deleted", ingredients[i].qty, 0);
  ingredients.splice(i, 1);
  db.ref("ingredients").set(JSON.parse(JSON.stringify(ingredients)));
}

document.getElementById("addProductBtn2").onclick = () => {
  const name = productName2.value.trim();
  const qty = Number(productQty2.value);

  if (!name || qty <= 0) return;

  let existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());

if (existing) {
  existing.qty += qty;
} else {
  products.push({ name, qty });
}

  db.ref("products").set(JSON.parse(JSON.stringify(products)));

  addMovement(name, "Product Added", qty, 0);

  productName2.value = "";
  productQty2.value = 1;
};

function renderProducts() {
  const table = document.getElementById("productTable");
  const keyword = (searchProduct2?.value || "").toLowerCase().trim();

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Qty</th>
      <th>Action</th>
    </tr>
  `;

  const filtered = products.filter(item =>
    item.name.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    table.innerHTML += `
      <tr>
        <td colspan="3">No products found.</td>
      </tr>
    `;
    return;
  }

  filtered.forEach((item) => {
    const originalIndex = products.findIndex(
      x => x.name === item.name && x.qty === item.qty
    );

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>
  <button class="plus" onclick="updateProduct(${originalIndex}, 1)">+</button>
  <button class="minus" onclick="updateProduct(${originalIndex}, -1)">−</button>
  <button class="delete-product-btn" onclick="deleteProduct(${originalIndex})">Delete</button>
</td>
      </tr>
    `;
  });
}

function updateProduct(index, change) {
  if (!products[index]) return;

  products[index].qty += change;

  if (products[index].qty < 0) {
    products[index].qty = 0;
  }

  db.ref("products").set(JSON.parse(JSON.stringify(products)));

  addMovement(
    products[index].name,
    change > 0 ? "Manual Add" : "Manual Deduct",
    Math.abs(change),
    0
  );
}

function deleteProduct(i) {
  addMovement(products[i].name, "Product Deleted", products[i].qty, 0);
  products.splice(i, 1);
  db.ref("products").set(JSON.parse(JSON.stringify(products)));
}

document.getElementById("recordDeliveryBtn").onclick = () => {
  const item = deliveryItem.value.trim();
  const qty = Number(deliveryQty.value);

  if (!item || qty <= 0) return;

  let existingIngredient = ingredients.find(
    i => i.name.toLowerCase() === item.toLowerCase()
  );

  if (existingIngredient) {
    existingIngredient.qty += qty;
  } else {
    ingredients.push({ name: item, qty: qty });
  }

  db.ref("ingredients").set(JSON.parse(JSON.stringify(ingredients)));

  deliveries.push({
    item,
    qty,
    date: new Date().toISOString()
  });

  db.ref("deliveries").set(deliveries);

  addMovement(item, "Delivery", qty, 0, "Stock increased from delivery");

  deliveryItem.value = "";
  deliveryQty.value = 1;
};

function renderDeliveries() {
  const table = document.getElementById("deliveryTable");

  table.innerHTML = `
    <tr>
      <th>Item</th>
      <th>Qty</th>
      <th>Date</th>
    </tr>
  `;

  deliveries.forEach(d => {
    table.innerHTML += `
      <tr>
        <td>${d.item}</td>
        <td>${d.qty}</td>
        <td>${d.date}</td>
      </tr>
    `;
  });
}

document.getElementById("recordLapseBtn").onclick = () => {
  const item = lapseItem.value.trim();
  const qty = Number(lapseQty.value);
  const cost = Number(lapseCost.value);

  if (!item || qty <= 0 || cost <= 0) return;

  let existingIngredient = ingredients.find(
    i => i.name.toLowerCase() === item.toLowerCase()
  );

  if (!existingIngredient) {
    alert("Ingredient not found.");
    return;
  }

  if (existingIngredient.qty < qty) {
    alert("Not enough stock.");
    return;
  }

  existingIngredient.qty -= qty;

  db.ref("ingredients").set(JSON.parse(JSON.stringify(ingredients)));

  lapses.push({
    item,
    qty,
    cost,
    total: qty * cost,
    date: new Date().toISOString()
  });

  db.ref("lapses").set(lapses);

  addMovement(item, "Lapse", qty, cost, "Stock decreased from lapse");

  lapseItem.value = "";
  lapseQty.value = 1;
  lapseCost.value = "";
};

function renderLapses() {
  const table = document.getElementById("lapseTable");

  table.innerHTML = `
    <tr>
      <th>Item</th>
      <th>Qty</th>
      <th>Cost</th>
      <th>Total</th>
    </tr>
  `;

  lapses.forEach(l => {
    table.innerHTML += `
      <tr>
        <td>${l.item}</td>
        <td>${l.qty}</td>
        <td>₱${l.cost}</td>
        <td>₱${l.total}</td>
      </tr>
    `;
  });
}

function addMovement(item, type, qty, cost, note = "") {
  movements.unshift({
    date: new Date().toLocaleString(),
    user: currentUser ? currentUser.user : "System",
    item,
    type,
    qty,
    cost,
    note
  });

  db.ref("movements").set(movements);
}

function renderMovements() {
  const table = document.getElementById("movementTable");

  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>User</th>
      <th>Item</th>
      <th>Type</th>
      <th>Qty</th>
      <th>Cost</th>
    </tr>
  `;

  movements.forEach(m => {
    table.innerHTML += `
      <tr>
        <td>${m.date}</td>
        <td>${m.user || "System"}</td>
        <td>${m.item}</td>
        <td>${m.type}</td>
        <td>${m.qty}</td>
        <td>${m.cost}</td>
      </tr>
    `;
  });
}

function renderRecentActivity() {
  const table = document.getElementById("recentActivityTable");

  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>User</th>
      <th>Item</th>
      <th>Action</th>
      <th>Details</th>
    </tr>
  `;

  movements.slice(0, 5).forEach(m => {
    table.innerHTML += `
      <tr>
        <td>${m.date}</td>
        <td>${m.user || "System"}</td>
        <td>${m.item}</td>
        <td>${m.type}</td>
        <td>${m.note && m.note.trim() ? m.note : `Qty: ${m.qty}, Cost: ₱${m.cost}`}</td>
      </tr>
    `;
  });
}

function updateDashboard() {
  document.getElementById("dashIngredientsCount").textContent = ingredients.length;
  document.getElementById("dashProductsCount").textContent = products.length;

  const low = [...ingredients, ...products].filter(x => x.qty > 0 && x.qty <= 5).length;
  const out = [...ingredients, ...products].filter(x => x.qty === 0).length;

  document.getElementById("dashLowStockCount").textContent = low;
  document.getElementById("dashOutStockCount").textContent = out;

  const today = new Date().toLocaleDateString();

  const todayDeliveries = deliveries.filter(d => {
    if (!d.date) return false;
    return new Date(d.date).toLocaleDateString() === today;
  });

  const todayLapses = lapses.filter(l => {
    if (!l.date) return false;
    return new Date(l.date).toLocaleDateString() === today;
  });

  const todayMovements = movements.filter(m => {
    if (!m.date) return false;
    return new Date(m.date).toLocaleDateString() === today;
  });

  document.getElementById("dashDeliveriesCount").textContent = todayDeliveries.length;
  document.getElementById("dashLapsesCount").textContent = todayLapses.length;
  document.getElementById("dashMovementsCount").textContent = todayMovements.length;

  const todayLapseCost = todayLapses.reduce((sum, l) => sum + Number(l.total || 0), 0);
  document.getElementById("dashLapseCost").textContent = "₱" + todayLapseCost.toFixed(2);

  const alerts = [];

  ingredients.forEach(i => {
    if (i.qty === 0) {
      alerts.push(`❌ Out of stock ingredient: ${i.name}`);
    } else if (i.qty <= 5) {
      alerts.push(`⚠ Low stock ingredient: ${i.name} (${i.qty})`);
    }
  });

  products.forEach(p => {
    if (p.qty === 0) {
      alerts.push(`❌ Out of stock product: ${p.name}`);
    } else if (p.qty <= 5) {
      alerts.push(`⚠ Low stock product: ${p.name} (${p.qty})`);
    }
  });

  document.getElementById("dashAlerts").innerHTML =
    alerts.length ? alerts.join("<br>") : "No alerts yet.";
}
