document.addEventListener('DOMContentLoaded', function() {
    // Check admin credentials
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        const username = prompt('Enter admin username:');
        const password = prompt('Enter admin password:');
        
        if (username === 'admin' && password === 'pass8080') {
            localStorage.setItem('adminLoggedIn', 'true');
        } else {
            alert('Invalid credentials. Redirecting...');
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Get elements
    const navItems = document.querySelectorAll('nav li');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutBtn = document.getElementById('logout-btn');
    const addCodeBtn = document.getElementById('add-code-btn');
    const saveCodeBtn = document.getElementById('save-code-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const addCodeModal = document.getElementById('add-code-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmOk = document.getElementById('confirm-ok');
    const tabTitle = document.getElementById('tab-title');
    
    // Load data
    let redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes')) || [];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Tab switching
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            
            // Update title
            tabTitle.textContent = this.textContent.trim();
            
            // Load data for the tab
            if (tabName === 'dashboard') {
                loadDashboard();
            } else if (tabName === 'codes') {
                loadCodesTable();
            } else if (tabName === 'transactions') {
                loadTransactionsTable();
            }
        });
    });
    
    // Logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    });
    
    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('admin-modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Add code button
    addCodeBtn.addEventListener('click', function() {
        document.getElementById('new-code').value = generateRandomCode();
        document.getElementById('new-amount').value = document.getElementById('default-amount').value || 1;
        document.getElementById('new-limit').value = document.getElementById('default-limit').value || 5;
        document.getElementById('new-status').value = 'active';
        addCodeModal.style.display = 'block';
    });
    
    // Save code
    saveCodeBtn.addEventListener('click', function() {
        const code = document.getElementById('new-code').value.trim().toUpperCase();
        const amount = parseInt(document.getElementById('new-amount').value);
        const limit = parseInt(document.getElementById('new-limit').value);
        const status = document.getElementById('new-status').value;
        
        if (!code || isNaN(amount) || isNaN(limit)) {
            showAlert('Error', 'Please fill in all fields with valid values.');
            return;
        }
        
        // Check if code already exists
        const existingCode = redemptionCodes.find(rc => rc.code === code);
        if (existingCode) {
            showAlert('Error', 'This redemption code already exists.');
            return;
        }
        
        // Add new code
        redemptionCodes.push({
            code: code,
            amount: amount,
            maxRedemptions: limit,
            currentRedemptions: 0,
            status: status
        });
        
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
        addCodeModal.style.display = 'none';
        loadCodesTable();
        showAlert('Success', 'Redemption code added successfully!');
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
        const newPassword = document.getElementById('admin-password').value;
        
        if (newPassword.length < 6) {
            showAlert('Error', 'Password must be at least 6 characters long.');
            return;
        }
        
        showAlert('Success', 'Settings saved successfully!');
    });
    
    // Confirm modal
    confirmCancel.addEventListener('click', function() {
        confirmModal.style.display = 'none';
    });
    
    // Generate random code
    function generateRandomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 7; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Load dashboard
    function loadDashboard() {
        const totalCodes = redemptionCodes.length;
        const activeCodes = redemptionCodes.filter(rc => rc.status === 'active').length;
        const totalRedeemed = transactions.length;
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('total-codes').textContent = totalCodes;
        document.getElementById('active-codes').textContent = activeCodes;
        document.getElementById('total-redeemed').textContent = totalRedeemed;
        document.getElementById('total-amount').textContent = `₱${totalAmount}`;
        
        // Load recent transactions
        const recentTransactions = [...transactions].reverse().slice(0, 5);
        const tbody = document.querySelector('#recent-transactions-table tbody');
        tbody.innerHTML = '';
        
        recentTransactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.code}</td>
                <td>${t.gcashName}</td>
                <td>₱${t.amount}</td>
                <td><span class="status ${t.status}">${t.status}</span></td>
                <td>${new Date(t.date).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Load codes table
    function loadCodesTable() {
        const tbody = document.querySelector('#codes-table tbody');
        tbody.innerHTML = '';
        
        redemptionCodes.forEach(rc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rc.code}</td>
                <td>₱${rc.amount}</td>
                <td>${rc.currentRedemptions} / ${rc.maxRedemptions}</td>
                <td>${rc.maxRedemptions}</td>
                <td><span class="status ${rc.status}">${rc.status}</span></td>
                <td>
                    <button class="action-btn edit" data-code="${rc.code}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-code="${rc.code}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                editCode(code);
            });
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                confirmDeleteCode(code);
            });
        });
    }
    
    // Load transactions table
    function loadTransactionsTable() {
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
        
        let filteredTransactions = [...transactions].reverse();
        
        if (statusFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
        }
        
        if (searchTerm) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.code.toLowerCase().includes(searchTerm) || 
                t.gcashName.toLowerCase().includes(searchTerm) ||
                t.gcashNumber.includes(searchTerm)
            );
        }
        
        const tbody = document.querySelector('#transactions-table tbody');
        tbody.innerHTML = '';
        
        filteredTransactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.code}</td>
                <td>${t.gcashName}</td>
                <td>${t.gcashNumber}</td>
                <td>₱${t.amount}</td>
                <td><span class="status ${t.status}">${t.status}</span></td>
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>
                    ${t.status === 'pending' ? 
                        `<button class="action-btn complete" data-id="${t.id}"><i class="fas fa-check"></i> Complete</button>` : 
                        `<button class="action-btn view" data-id="${t.id}"><i class="fas fa-eye"></i> View</button>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn.complete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                completeTransaction(id);
            });
        });
    }
    
    // Edit code
    function editCode(code) {
        const codeObj = redemptionCodes.find(rc => rc.code === code);
        if (!codeObj) return;
        
        document.getElementById('new-code').value = codeObj.code;
        document.getElementById('new-amount').value = codeObj.amount;
        document.getElementById('new-limit').value = codeObj.maxRedemptions;
        document.getElementById('new-status').value = codeObj.status;
        
        document.getElementById('new-code').readOnly = true;
        saveCodeBtn.textContent = 'Update Code';
        
        // Change the save button behavior
        saveCodeBtn.onclick = function() {
            codeObj.amount = parseInt(document.getElementById('new-amount').value);
            codeObj.maxRedemptions = parseInt(document.getElementById('new-limit').value);
            codeObj.status = document.getElementById('new-status').value;
            
            localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
            addCodeModal.style.display = 'none';
            loadCodesTable();
            showAlert('Success', 'Redemption code updated successfully!');
            
            // Reset the button
            document.getElementById('new-code').readOnly = false;
            saveCodeBtn.textContent = 'Save Code';
            saveCodeBtn.onclick = saveCodeBtnOriginal;
        };
        
        addCodeModal.style.display = 'block';
    }
    
    // Save the original save button function
    const saveCodeBtnOriginal = saveCodeBtn.onclick;
    
    // Confirm delete code
    function confirmDeleteCode(code) {
        document.getElementById('confirm-title').textContent = 'Delete Redemption Code';
        document.getElementById('confirm-message').textContent = `Are you sure you want to delete the code ${code}? This action cannot be undone.`;
        
        confirmOk.onclick = function() {
            redemptionCodes = redemptionCodes.filter(rc => rc.code !== code);
            localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
            loadCodesTable();
            confirmModal.style.display = 'none';
            showAlert('Success', 'Redemption code deleted successfully!');
        };
        
        confirmModal.style.display = 'block';
    }
    
    // Complete transaction
    function completeTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        transaction.status = 'success';
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadTransactionsTable();
        loadDashboard();
        showAlert('Success', 'Transaction marked as completed!');
    }
    
    // Search functionality for codes
    document.getElementById('code-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#codes-table tbody tr');
        
        rows.forEach(row => {
            const code = row.cells[0].textContent.toLowerCase();
            if (code.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    
    // Filter and search for transactions
    document.getElementById('status-filter').addEventListener('change', loadTransactionsTable);
    document.getElementById('transaction-search').addEventListener('input', loadTransactionsTable);
    
    // Show alert
    function showAlert(title, message) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-ok').textContent = 'OK';
        document.querySelector('.modal-icon').className = 'modal-icon info';
        document.querySelector('.modal-icon i').className = 'fas fa-info-circle';
        
        confirmOk.onclick = function() {
            confirmModal.style.display = 'none';
        };
        
        document.getElementById('confirm-cancel').style.display = 'none';
        confirmModal.style.display = 'block';
    }
    
    // Initialize dashboard on first load
    loadDashboard();
});
