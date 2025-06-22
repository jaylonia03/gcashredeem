document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link and corresponding section
            this.parentElement.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(`${sectionId}-section`).classList.add('active');
            sectionTitle.textContent = this.textContent.trim();
            
            // Load data for the section
            switch(sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'codes':
                    loadRedemptionCodes();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
            }
        });
    });

    // Initialize dashboard
    loadDashboard();

    // Modal functionality
    const editCodeModal = document.getElementById('editCodeModal');
    const confirmModal = document.getElementById('confirmModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const confirmCancel = document.getElementById('confirmCancel');
    
    function showModal(modal) {
        modal.classList.add('show');
    }
    
    function closeModal(modal) {
        modal.classList.remove('show');
    }
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            closeModal(modal);
        });
    });
    
    confirmCancel.addEventListener('click', function() {
        closeModal(confirmModal);
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('admin-modal')) {
            closeModal(event.target);
        }
    });

    // Dashboard functions
    function loadDashboard() {
        const redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || [];
        const transactions = JSON.parse(localStorage.getItem('redemptionTransactions') || [];
        
        // Update stats
        document.getElementById('activeCodesCount').textContent = redemptionCodes.length;
        document.getElementById('totalRedemptions').textContent = transactions.length;
        
        const totalRewards = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        document.getElementById('totalRewards').textContent = `₱${totalRewards.toFixed(2)}`;
        
        const pendingCount = transactions.filter(t => t.status === 'pending').length;
        document.getElementById('pendingTransactions').textContent = pendingCount;
        
        // Load recent transactions
        const recentTransactions = transactions.slice(-5).reverse();
        const tbody = document.querySelector('#recentTransactionsTable tbody');
        tbody.innerHTML = '';
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.code}</td>
                <td>${transaction.gcashName}</td>
                <td>₱${transaction.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
                <td>${new Date(transaction.timestamp).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Redemption Codes functions
    function loadRedemptionCodes() {
        const redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || [];
        const tbody = document.querySelector('#codesTable tbody');
        tbody.innerHTML = '';
        
        redemptionCodes.forEach(code => {
            const row = document.createElement('tr');
            const status = code.currentRedemptions >= code.maxRedemptions ? 'Out of Stock' : 'Active';
            const statusClass = status === 'Out of Stock' ? 'status-pending' : 'status-success';
            
            row.innerHTML = `
                <td>${code.code}</td>
                <td>₱${code.amount.toFixed(2)}</td>
                <td>${code.currentRedemptions}</td>
                <td>${code.maxRedemptions}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-action btn-edit" data-code="${code.code}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-action btn-delete" data-code="${code.code}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                editRedemptionCode(code);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                confirmDeleteCode(code);
            });
        });
    }
    
    function editRedemptionCode(code) {
        const redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || [];
        const codeData = redemptionCodes.find(c => c.code === code);
        
        if (codeData) {
            document.getElementById('editCodeId').value = code;
            document.getElementById('editCode').value = code;
            document.getElementById('editAmount').value = codeData.amount;
            document.getElementById('editLimit').value = codeData.maxRedemptions;
            document.getElementById('editCurrent').value = codeData.currentRedemptions;
            
            showModal(editCodeModal);
        }
    }
    
    function confirmDeleteCode(code) {
        const confirmAction = document.getElementById('confirmAction');
        confirmAction.onclick = function() {
            deleteRedemptionCode(code);
            closeModal(confirmModal);
        };
        
        document.getElementById('confirmTitle').textContent = 'Delete Redemption Code';
        document.getElementById('confirmMessage').textContent = `Are you sure you want to delete the redemption code "${code}"? This action cannot be undone.`;
        
        showModal(confirmModal);
    }
    
    function deleteRedemptionCode(code) {
        let redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || [];
        redemptionCodes = redemptionCodes.filter(c => c.code !== code);
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
        loadRedemptionCodes();
    }
    
    // Edit Code Form
    document.getElementById('editCodeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const code = document.getElementById('editCodeId').value;
        const amount = parseFloat(document.getElementById('editAmount').value);
        const maxRedemptions = parseInt(document.getElementById('editLimit').value);
        const currentRedemptions = parseInt(document.getElementById('editCurrent').value);
        
        let redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || []);
        const codeIndex = redemptionCodes.findIndex(c => c.code === code);
        
        if (codeIndex !== -1) {
            redemptionCodes[codeIndex] = {
                code,
                amount,
                maxRedemptions,
                currentRedemptions
            };
            
            localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
            loadRedemptionCodes();
            closeModal(editCodeModal);
        }
    });
    
    // Transactions functions
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('redemptionTransactions') || [];
        const statusFilter = document.getElementById('statusFilter').value;
        
        let filteredTransactions = transactions;
        if (statusFilter !== 'all') {
            filteredTransactions = transactions.filter(t => t.status === statusFilter);
        }
        
        filteredTransactions = filteredTransactions.reverse();
        const tbody = document.querySelector('#transactionsTable tbody');
        tbody.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.code}</td>
                <td>${transaction.gcashName}</td>
                <td>${transaction.gcashNumber}</td>
                <td>₱${transaction.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
                <td>${new Date(transaction.timestamp).toLocaleString()}</td>
                <td>
                    ${transaction.status === 'pending' ? 
                        `<button class="btn-action btn-complete" data-id="${transaction.id}"><i class="fas fa-check"></i> Complete</button>` : 
                        ''}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners to complete buttons
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                completeTransaction(transactionId);
            });
        });
    }
    
    function completeTransaction(transactionId) {
        let transactions = JSON.parse(localStorage.getItem('redemptionTransactions') || [];
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);
        
        if (transactionIndex !== -1) {
            transactions[transactionIndex].status = 'success';
            localStorage.setItem('redemptionTransactions', JSON.stringify(transactions));
            loadTransactions();
        }
    }
    
    // Status filter change
    document.getElementById('statusFilter').addEventListener('change', loadTransactions);
    
    // Create Code Form
    document.getElementById('createCodeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newCode = document.getElementById('newCode').value.trim().toUpperCase();
        const codeAmount = parseFloat(document.getElementById('codeAmount').value);
        const codeLimit = parseInt(document.getElementById('codeLimit').value);
        
        if (!newCode || isNaN(codeAmount) || isNaN(codeLimit)) {
            alert('Please fill all fields with valid values');
            return;
        }
        
        let redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes') || [];
        
        // Check if code already exists
        if (redemptionCodes.some(c => c.code === newCode)) {
            alert('This redemption code already exists');
            return;
        }
        
        // Add new code
        redemptionCodes.push({
            code: newCode,
            amount: codeAmount,
            maxRedemptions: codeLimit,
            currentRedemptions: 0
        });
        
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
        
        // Reset form and show success
        this.reset();
        alert('Redemption code created successfully!');
        loadRedemptionCodes();
    });
    
    // Refresh buttons
    document.getElementById('refreshCodes').addEventListener('click', loadRedemptionCodes);
    document.getElementById('refreshTransactions').addEventListener('click', loadTransactions);
    
    // Admin login simulation
    const currentUrl = window.location.href;
    if (currentUrl.includes('admin')) {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            const username = prompt('Enter admin username:');
            const password = prompt('Enter admin password:');
            
            if (username === 'admin' && password === 'pass8080') {
                sessionStorage.setItem('adminLoggedIn', 'true');
            } else {
                alert('Invalid credentials');
                window.location.href = '../';
            }
        }
    }
});
