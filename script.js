// Simple password (change this to your own)
const CORRECT_PASSWORD = "myBudget123";

// Pre-populated categories
const defaultCategories = [
    { name: "Mortgage", budget: 500, frequency: "Monthly" },
    { name: "Light", budget: 100, frequency: "Monthly" },
    { name: "Water", budget: 50, frequency: "Monthly" },
    { name: "Gas", budget: 75, frequency: "Monthly" },
    { name: "Home Security", budget: 50, frequency: "Monthly" },
    { name: "Phone", budget: 80, frequency: "Monthly" },
    { name: "Internet", budget: 60, frequency: "Monthly" },
    { name: "Groceries", budget: 300, frequency: "Weekly" },
    { name: "Insurance", budget: 150, frequency: "Monthly" },
    { name: "Car Payment", budget: 200, frequency: "Monthly" },
    { name: "Subscriptions", budget: 30, frequency: "Monthly" },
    { name: "Miscellaneous", budget: 100, frequency: "Monthly" }
];

// Initialize data
let budgetItems = JSON.parse(localStorage.getItem('budgetItems')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
localStorage.setItem('categories', JSON.stringify(categories));

// Dark mode toggle (default to dark)
const body = document.body;
const themeColorMeta = document.getElementById('theme-color');
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeColorMeta.content = '#333';
}
document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';

document.getElementById('theme-toggle').addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-toggle').textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    themeColorMeta.content = isDark ? '#333' : '#f4f4f4';
});

// Password check on load
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const appContainer = document.getElementById('app-container');
    const passwordInput = document.getElementById('password-input');
    const submitPassword = document.getElementById('submit-password');

    // Submit on Enter key
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitPassword.click();
        }
    });

    submitPassword.addEventListener('click', () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            authSection.style.display = 'none';
            appContainer.style.display = 'block';
            loadCategories();
            showScreen('welcome');
        } else {
            alert('Incorrect password');
        }
    });
});

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = screen.id === screenId + '-screen' ? 'block' : 'none';
    });
    if (screenId === 'tracker') {
        loadCategories();
        loadBudgetItems();
    } else if (screenId === 'categories') {
        loadCategoryBudgets();
    }
}

// Load categories into dropdown
function loadCategories() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Add new budget item
document.getElementById('budget-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    const newItem = { date, category, description, amount };
    budgetItems.push(newItem);
    localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
    loadBudgetItems();
    e.target.reset();
});

// Load and display budget items
function loadBudgetItems() {
    const budgetList = document.getElementById('budget-list');
    budgetList.innerHTML = '';
    budgetItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.innerHTML = `
            <span>${item.date}</span>
            <span>${item.category}</span>
            <span>${item.description}</span>
            <span>$${item.amount.toFixed(2)}</span>
            <span style="justify-self: end;">
                <button onclick="deleteItem(${index})">Delete</button>
            </span>
        `;
        budgetList.appendChild(itemDiv);
    });
    updateSummary();
}

// Delete budget item
function deleteItem(index) {
    budgetItems.splice(index, 1);
    localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
    loadBudgetItems();
}

// Update summary
function updateSummary() {
    const totalSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById('summary').innerHTML = `Total Spent: $${totalSpent.toFixed(2)}`;
}

// Export to CSV
document.getElementById('export-csv').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Category,Description,Amount\n";
    budgetItems.forEach(item => {
        csvContent += `${item.date},${item.category},${item.description},${item.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "budget_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Add new category
document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-category').value;
    const budget = parseFloat(document.getElementById('category-budget').value);
    const frequency = document.getElementById('category-frequency').value;

    const existingIndex = categories.findIndex(cat => cat.name === name);
    if (existingIndex !== -1) {
        categories[existingIndex].budget = budget;
        categories[existingIndex].frequency = frequency;
    } else {
        categories.push({ name, budget, frequency });
    }
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategoryBudgets();
    e.target.reset();
});

// Load and display category budgets
function loadCategoryBudgets() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach((category, index) => {
        const catDiv = document.createElement('div');
        catDiv.classList.add('category-item');
        catDiv.innerHTML = `
            <span>${category.name}</span>
            <span>$${category.budget.toFixed(2)}</span>
            <span>${category.frequency}</span>
            <span style="justify-self: end;">
                <button onclick="editCategory(${index})">Edit</button>
                <button onclick="deleteCategory(${index})">Delete</button>
            </span>
        `;
        categoryList.appendChild(catDiv);
    });
}

// Edit category
function editCategory(index) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';

    const form = document.createElement('form');
    form.style.backgroundColor = body.classList.contains('dark-mode') ? '#333' : '#fff';
    form.style.padding = '20px';
    form.style.borderRadius = '8px';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';
    form.style.color = body.classList.contains('dark-mode') ? '#f4f4f4' : '#333';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = categories[index].name;
    nameInput.placeholder = 'Category Name';
    nameInput.required = true;

    const budgetInput = document.createElement('input');
    budgetInput.type = 'number';
    budgetInput.value = categories[index].budget;
    budgetInput.placeholder = 'Monthly Budget';
    budgetInput.step = '0.01';
    budgetInput.required = true;

    const frequencySelect = document.createElement('select');
    frequencySelect.required = true;
    ['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'].forEach(freq => {
        const option = document.createElement('option');
        option.value = freq;
        option.textContent = freq;
        if (freq === categories[index].frequency) option.selected = true;
        frequencySelect.appendChild(option);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Save';
    submitButton.style.backgroundColor = '#007BFF';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.padding = '8px';
    submitButton.style.borderRadius = '4px';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.style.backgroundColor = '#ccc';
    cancelButton.style.color = '#333';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '8px';
    cancelButton.style.borderRadius = '4px';
    cancelButton.onclick = () => document.body.removeChild(modal);

    form.appendChild(nameInput);
    form.appendChild(budgetInput);
    form.appendChild(frequencySelect);
    form.appendChild(submitButton);
    form.appendChild(cancelButton);
    modal.appendChild(form);
    document.body.appendChild(modal);

    form.onsubmit = (e) => {
        e.preventDefault();
        const newName = nameInput.value;
        const newBudget = parseFloat(budgetInput.value);
        const newFrequency = frequencySelect.value;
        if (newName && !isNaN(newBudget) && ['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'].includes(newFrequency)) {
            categories[index] = { name: newName, budget: newBudget, frequency: newFrequency };
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategoryBudgets();
            document.body.removeChild(modal);
        } else {
            alert('Invalid input. Ensure all fields are filled and frequency is valid.');
        }
    };
}

// Delete category
function deleteCategory(index) {
    if (confirm(`Delete category "${categories[index].name}"?`)) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategoryBudgets();
    }
}