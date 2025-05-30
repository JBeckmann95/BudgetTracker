// Simple password (change this to your own)
const CORRECT_PASSWORD = "myBudget123";

// Pre-populated categories
const defaultCategories = [
    { name: "Mortgage", budget: 500 },
    { name: "Light", budget: 100 },
    { name: "Water", budget: 50 },
    { name: "Gas", budget: 75 },
    { name: "Home Security", budget: 50 },
    { name: "Phone", budget: 80 },
    { name: "Internet", budget: 60 },
    { name: "Groceries", budget: 300 },
    { name: "Insurance", budget: 150 },
    { name: "Car Payment", budget: 200 },
    { name: "Subscriptions", budget: 30 },
    { name: "Miscellaneous", budget: 100 }
];

// Initialize data
let budgetItems = JSON.parse(localStorage.getItem('budgetItems')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
localStorage.setItem('categories', JSON.stringify(categories));

// Password check on load
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const appContainer = document.getElementById('app-container');
    const passwordInput = document.getElementById('password-input');
    const submitPassword = document.getElementById('submit-password');

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
            ${item.date} | ${item.category} | ${item.description} | $${item.amount.toFixed(2)}
            <button onclick="deleteItem(${index})">Delete</button>
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

    const existingIndex = categories.findIndex(cat => cat.name === name);
    if (existingIndex !== -1) {
        categories[existingIndex].budget = budget;
    } else {
        categories.push({ name, budget });
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
            ${category.name}: $${category.budget.toFixed(2)}
            <button onclick="editCategory(${index})">Edit</button>
            <button onclick="deleteCategory(${index})">Delete</button>
        `;
        categoryList.appendChild(catDiv);
    });
}

// Edit category
function editCategory(index) {
    const newName = prompt('Enter new category name:', categories[index].name);
    const newBudget = parseFloat(prompt('Enter new monthly budget:', categories[index].budget));
    if (newName && !isNaN(newBudget)) {
        categories[index] = { name: newName, budget: newBudget };
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategoryBudgets();
    }
}

// Delete category
function deleteCategory(index) {
    if (confirm(`Delete category "${categories[index].name}"?`)) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategoryBudgets();
    }
}