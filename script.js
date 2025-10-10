// Global variables
let currentUser = null;
let isAdmin = false;
let currentCategory = 'all';
let stockData = [];
let adminPassword = 'battlekart2025'; // In production, this should be more secure

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStockData();
    updateCurrentDate();
    setupEventListeners();
});

function initializeApp() {
    // Set current date
    const now = new Date();
    const dateString = now.toLocaleDateString('nl-NL');
    document.getElementById('current-date').textContent = dateString;
    
    // Initialize category
    currentCategory = 'all';
}

function updateCurrentDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('nl-NL');
    document.getElementById('current-date').textContent = dateString;
}

function setupEventListeners() {
    // Login buttons
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    document.getElementById('confirm-login').addEventListener('click', handleUserLogin);
    document.getElementById('cancel-login').addEventListener('click', hideLoginModal);
    
    // Admin login
    document.getElementById('admin-panel-btn').addEventListener('click', showAdminLoginModal);
    document.getElementById('confirm-admin-login').addEventListener('click', handleAdminLogin);
    document.getElementById('cancel-admin-login').addEventListener('click', hideAdminLoginModal);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategory = this.id.replace('category-', '');
            updateCategoryButtons();
            renderStockGrid();
        });
    });
    
    // Action buttons
    document.getElementById('generate-order-list').addEventListener('click', generateOrderList);
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    document.getElementById('clear-all').addEventListener('click', clearAllStock);
    document.getElementById('copy-order-list').addEventListener('click', copyOrderList);    
    
    // Admin panel
    document.getElementById('close-admin').addEventListener('click', hideAdminPanel);
    document.getElementById('add-item').addEventListener('click', addNewItem);
    
    // Enter key for modals
    document.getElementById('user-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleUserLogin();
    });
    
    document.getElementById('admin-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAdminLogin();
    });
}

function showLoginModal() {
    document.getElementById('login-modal').classList.add('show');
    document.getElementById('user-name').focus();
}

function hideLoginModal() {
    document.getElementById('login-modal').classList.remove('show');
    document.getElementById('user-name').value = '';
}

function showAdminLoginModal() {
    document.getElementById('admin-login-modal').classList.add('show');
    document.getElementById('admin-password').focus();
}

function hideAdminLoginModal() {
    document.getElementById('admin-login-modal').classList.remove('show');
    document.getElementById('admin-password').value = '';
}

function handleUserLogin() {
    const userName = document.getElementById('user-name').value.trim();
    if (userName) {
        currentUser = userName;
        document.getElementById('current-user').textContent = `Ingelogd als: ${userName}`;
        document.getElementById('login-btn').style.display = 'none';
        hideLoginModal();
    } else {
        alert('Voer een geldige naam in.');
    }
}

function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === adminPassword) {
        isAdmin = true;
        document.querySelector('.admin-controls').style.display = 'flex';
        document.getElementById('current-user').textContent = `Admin: ${currentUser || 'Ingelogd'}`;
        document.getElementById('current-user').style.background = 'rgba(220, 53, 69, 0.2)';
        document.getElementById('current-user').style.border = '2px solid #dc3545';
        hideAdminLoginModal();
        renderStockGrid(); // Refresh to show admin controls
        alert('Admin modus geactiveerd! Je kunt nu items beheren en minimumwaarden aanpassen.');
    } else {
        alert('Onjuist wachtwoord.');
    }
}

function handleLogout() {
    currentUser = null;
    isAdmin = false;
    document.getElementById('current-user').textContent = 'Gebruiker niet ingelogd';
    document.getElementById('login-btn').style.display = 'inline-block';
    document.querySelector('.admin-controls').style.display = 'none';
    hideAdminPanel();
}

function updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`category-${currentCategory}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function loadStockData() {
    // Load from localStorage or initialize with sample data
    const savedData = localStorage.getItem('battlekartStockData');
    if (savedData) {
        stockData = JSON.parse(savedData);
    } else {
        // Initialize with sample data
        stockData = [
            { id: 1, name: 'Coca Cola', category: 'drank', unit: 'bakken van 24', minimum: 5, current: 0 },
            { id: 2, name: 'Fanta', category: 'drank', unit: 'bakken van 24', minimum: 3, current: 0 },
            { id: 3, name: 'Water', category: 'drank', unit: 'pakken van 6', minimum: 8, current: 0 },
            { id: 4, name: 'Chips Zout', category: 'eten', unit: 'zakken', minimum: 15, current: 0 },
            { id: 5, name: 'Chips Paprika', category: 'eten', unit: 'zakken', minimum: 12, current: 0 },
            { id: 6, name: 'M&M\'s', category: 'eten', unit: 'zakken', minimum: 10, current: 0 },
            { id: 7, name: 'Mars', category: 'eten', unit: 'stuks', minimum: 20, current: 0 },
            { id: 8, name: 'Snickers', category: 'eten', unit: 'stuks', minimum: 18, current: 0 },
            { id: 9, name: 'Red Bull', category: 'drank', unit: 'stuks', minimum: 25, current: 0 },
            { id: 10, name: 'Monster Energy', category: 'drank', unit: 'stuks', minimum: 15, current: 0 }
        ];
        saveStockData();
    }
    renderStockGrid();
    updateCategoryButtons();
}

function saveStockData() {
    localStorage.setItem('battlekartStockData', JSON.stringify(stockData));
}

function renderStockGrid() {
    const grid = document.getElementById('stock-grid');
    grid.innerHTML = '';
    
    if (currentCategory === 'all') {
        // Group all items by category
        const categories = ['drank', 'eten'];
        let hasItems = false;
        
        categories.forEach(category => {
            const categoryItems = stockData.filter(item => item.category === category);
            if (categoryItems.length > 0) {
                hasItems = true;
                const categoryGroup = createCategoryGroup(category, categoryItems);
                grid.appendChild(categoryGroup);
            }
        });
        
        if (!hasItems) {
            grid.innerHTML = '<div class="no-items">Geen items gevonden. Voeg items toe via het admin panel.</div>';
        }
    } else {
        // Show only selected category
        const filteredData = stockData.filter(item => item.category === currentCategory);
        if (filteredData.length > 0) {
            const categoryGroup = createCategoryGroup(currentCategory, filteredData);
            grid.appendChild(categoryGroup);
        } else {
            const categoryInfo = getCategoryInfo(currentCategory);
            grid.innerHTML = `<div class="no-items">Geen ${categoryInfo.name.toLowerCase()} items gevonden.</div>`;
        }
    }
    
    // Add event listeners after rendering
    addStockItemEventListeners();
}

function createCategoryGroup(category, items) {
    const group = document.createElement('div');
    group.className = 'category-group';
    
    const categoryInfo = getCategoryInfo(category);
    
    group.innerHTML = `
        <div class="category-group-header">
            <div class="category-group-icon">${categoryInfo.icon}</div>
            <h3 class="category-group-title">${categoryInfo.name}</h3>
            <div class="category-group-count">${items.length} items</div>
        </div>
        <div class="category-items">
            ${items.map(item => createStockItemHTML(item)).join('')}
        </div>
    `;
    
    return group;
}

function getCategoryInfo(category) {
    const categories = {
        'drank': { name: 'Drank', icon: '🥤' },
        'eten': { name: 'Eten & Snacks', icon: '🍿' }
    };
    return categories[category] || { name: category, icon: '📦' };
}

function createStockItemHTML(item) {
    return `
        <div class="stock-item">
            <div class="stock-item-header">
                <div class="stock-item-name">${item.name}</div>
                <div class="stock-item-category ${item.category}">${item.category.toUpperCase()}</div>
            </div>
            <div class="stock-item-details">
                <div class="stock-detail">
                    <label>Huidige Stock</label>
                    <input type="number" value="${item.current}" min="0" data-item-id="${item.id}" data-field="current">
                </div>
                <div class="stock-detail">
                    <label>Minimum</label>
                    <input type="number" value="${item.minimum}" min="0" data-item-id="${item.id}" data-field="minimum" ${!isAdmin ? 'readonly' : ''} ${!isAdmin ? 'style="background-color: #f8f9fa; cursor: not-allowed;"' : ''}>
                </div>
            </div>
            <div class="stock-item-unit">Eenheid: ${item.unit}</div>
        </div>
    `;
}

// Event listeners are now added after rendering the HTML
function addStockItemEventListeners() {
    document.querySelectorAll('.stock-item input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseInt(this.dataset.itemId);
            const field = this.dataset.field;
            const value = parseInt(this.value) || 0;
            
            const item = stockData.find(i => i.id === itemId);
            if (item) {
                item[field] = value;
                saveStockData();
            }
        });
    });
}

function generateOrderList() {
    if (!currentUser) {
        alert('Je moet eerst inloggen om een bestellijst te genereren.');
        return;
    }
    
    const orderItems = stockData.filter(item => item.current < item.minimum);
    
    const orderSection = document.getElementById('order-list-section');
    const orderList = document.getElementById('order-list');
    
    if (orderItems.length === 0) {
        orderList.innerHTML = `
            <div class="no-orders">
                <h3>✅ Geen bestellingen nodig!</h3>
                <p>Alle items zijn voldoende op voorraad.</p>
            </div>
        `;
    } else {
        const totalItems = orderItems.length;
        const totalNeeded = orderItems.reduce((sum, item) => sum + (item.minimum - item.current), 0);
        
        orderList.innerHTML = `
            <div class="order-header">
                <div>Item</div>
                <div>Categorie</div>
                <div>Huidig</div>
                <div>Minimum</div>
                <div>Te Bestellen</div>
            </div>
            ${orderItems.map(item => {
                const needed = item.minimum - item.current;
                return `
                    <div class="order-item">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-category ${item.category}">${item.category}</div>
                        <div class="order-item-current">${item.current}</div>
                        <div class="order-item-minimum">${item.minimum}</div>
                        <div class="order-item-needed">${needed}</div>
                    </div>
                `;
            }).join('')}
            <div class="order-summary">
                <h3>📊 Bestellijst Samenvatting</h3>
                <p><strong>Gebruiker:</strong> ${currentUser}</p>
                <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
                <p><strong>Aantal items te bestellen:</strong> ${totalItems}</p>
                <p><strong>Totale hoeveelheid:</strong> ${totalNeeded} stuks</p>
            </div>
        `;
    }
    
    orderSection.style.display = 'block';
    orderSection.scrollIntoView({ behavior: 'smooth' });
}

function exportToExcel() {
    if (!currentUser) {
        alert('Je moet eerst inloggen om te kunnen exporteren.');
        return;
    }
    
    // Create CSV data
    const csvData = [
        ['Item', 'Categorie', 'Huidige Stock', 'Minimum', 'Eenheid', 'Te Bestellen', 'Gebruiker', 'Datum'],
        ...stockData.map(item => {
            const needed = Math.max(0, item.minimum - item.current);
            return [
                item.name,
                item.category,
                item.current,
                item.minimum,
                item.unit,
                needed,
                currentUser,
                new Date().toLocaleDateString('nl-NL')
            ];
        })
    ];
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `battlekart_stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllStock() {
    if (!currentUser) {
        alert('Je moet eerst inloggen om stock te kunnen wissen.');
        return;
    }
    
    if (confirm('Weet je zeker dat je alle stock waardes wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
        stockData.forEach(item => {
            item.current = 0;
        });
        saveStockData();
        renderStockGrid();
        alert('Alle stock waardes zijn gewist.');
    }
}

function showAdminPanel() {
    if (!isAdmin) {
        showAdminLoginModal();
        return;
    }
    
    document.getElementById('admin-panel').style.display = 'flex';
    renderAdminItemsList();
}

function hideAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
}

function renderAdminItemsList() {
    const list = document.getElementById('admin-items-list');
    list.innerHTML = '';
    
    stockData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        div.innerHTML = `
            <div class="admin-item-name">${item.name}</div>
            <div class="admin-item-category ${item.category}">${item.category.toUpperCase()}</div>
            <div>
                <input type="text" value="${item.unit}" data-item-id="${item.id}" data-field="unit">
            </div>
            <div>
                <input type="number" value="${item.minimum}" min="0" data-item-id="${item.id}" data-field="minimum">
            </div>
            <button class="delete-item" onclick="deleteItem(${item.id})">Verwijder</button>
        `;
        
        // Add event listeners for input changes
        const inputs = div.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                const itemId = parseInt(this.dataset.itemId);
                const field = this.dataset.field;
                const value = this.value;
                
                const item = stockData.find(i => i.id === itemId);
                if (item) {
                    item[field] = field === 'minimum' ? parseInt(value) || 0 : value;
                    saveStockData();
                    renderStockGrid(); // Update main grid
                }
            });
        });
        
        list.appendChild(div);
    });
}

function addNewItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const category = document.getElementById('new-item-category').value;
    const unit = document.getElementById('new-item-unit').value.trim();
    const minimum = parseInt(document.getElementById('new-item-minimum').value) || 0;
    
    if (!name || !unit) {
        alert('Vul alle verplichte velden in.');
        return;
    }
    
    const newItem = {
        id: Math.max(...stockData.map(item => item.id)) + 1,
        name: name,
        category: category,
        unit: unit,
        minimum: minimum,
        current: 0
    };
    
    stockData.push(newItem);
    saveStockData();
    renderStockGrid();
    renderAdminItemsList();
    
    // Clear form
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-unit').value = '';
    document.getElementById('new-item-minimum').value = '';
    
    alert('Item succesvol toegevoegd!');
}

function deleteItem(itemId) {
    if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
        stockData = stockData.filter(item => item.id !== itemId);
        saveStockData();
        renderStockGrid();
        renderAdminItemsList();
        alert('Item succesvol verwijderd!');
    }
}

// Update admin panel button event listener
document.getElementById('admin-panel-btn').addEventListener('click', showAdminPanel);

function copyOrderList() {
    if (!currentUser) {
        alert('Je moet eerst inloggen om de bestellijst te kunnen kopiëren.');
        return;
    }
    
    const orderItems = stockData.filter(item => item.current < item.minimum);
    
    if (orderItems.length === 0) {
        alert('Er zijn geen items om te bestellen.');
        return;
    }
    
    // Create formatted text for copying
    let copyText = `🏁 BATTLEKART BESTELLIJST\n`;
    copyText += `📅 Datum: ${new Date().toLocaleDateString('nl-NL')}\n`;
    copyText += `👤 Gebruiker: ${currentUser}\n`;
    copyText += `\n📋 TE BESTELLEN ITEMS:\n`;
    copyText += `\n`;
    
    // Add table header
    copyText += `Item\t\t\tCategorie\tHuidig\tMinimum\tTe Bestellen\n`;
    copyText += `─`.repeat(80) + `\n`;
    
    // Add items
    orderItems.forEach(item => {
        const needed = item.minimum - item.current;
        const itemName = item.name.padEnd(20);
        const category = item.category.toUpperCase().padEnd(10);
        const current = item.current.toString().padStart(6);
        const minimum = item.minimum.toString().padStart(7);
        const neededStr = needed.toString().padStart(12);
        
        copyText += `${itemName}\t${category}\t${current}\t${minimum}\t${neededStr}\n`;
    });
    
    // Add summary
    const totalItems = orderItems.length;
    const totalNeeded = orderItems.reduce((sum, item) => sum + (item.minimum - item.current), 0);
    
    copyText += `\n`;
    copyText += `📊 SAMENVATTING:\n`;
    copyText += `• Aantal items: ${totalItems}\n`;
    copyText += `• Totale hoeveelheid: ${totalNeeded} stuks\n`;
    copyText += `\n`;
    copyText += `---\n`;
    copyText += `Deze bestellijst is gegenereerd door het Battlekart Stock Management System\n`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(copyText).then(() => {
        const copyBtn = document.getElementById('copy-order-list');
        const originalText = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '✅ Gekopieerd!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
        
        alert('Bestellijst is gekopieerd naar het klembord! Je kunt deze nu plakken in een bericht naar de leverancier.');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Kon niet naar klembord kopiëren. Probeer het handmatig te selecteren en te kopiëren.');
    });
}
