document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // 1. INITIALIZATION
    // ======================
    initializeData();
    checkAdminAuth();

    // ======================
    // 2. CORE FUNCTIONS
    // ======================
    function initializeData() {
        if (!localStorage.getItem('redemptionCodes')) {
            const defaultCodes = [
                { code: 'WELCOME10', amount: 10, maxRedemptions: 100, currentRedemptions: 0 },
                { code: 'GCASH2023', amount: 50, maxRedemptions: 50, currentRedemptions: 0 }
            ];
            localStorage.setItem('redemptionCodes', JSON.stringify(defaultCodes));
        }

        if (!localStorage.getItem('redemptionTransactions')) {
            localStorage.setItem('redemptionTransactions', JSON.stringify([]));
        }
    }

    function checkAdminAuth() {
        const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
        if (!isAuthenticated) {
            const username = prompt('Admin Username:');
            const password = prompt('Admin Password:');
            if (username !== 'admin' || password !== 'pass8080') {
                alert('Access denied. Redirecting...');
                window.location.href = '../';
            } else {
                sessionStorage.setItem('adminAuth', 'true');
            }
        }
    }

    // ======================
    // 3. DASHBOARD FUNCTIONS
    // ======================
    function loadDashboard() {
        const codes = JSON.parse(localStorage.getItem('redemptionCodes')) || [];
        const transactions = JSON.parse(localStorage.getItem('redemptionTransactions')) || [];

        // Update stats cards
        document.querySelector('.stats-container').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
                <div class="stat-info">
                    <h3>Active Codes</h3>
                    <p>${codes.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-info">
                    <h3>Total Redemptions</h3>
                    <p>${transactions.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-peso-sign"></i></div>
                <div class="stat-info">
                    <h3>Total Rewards</h3>
                    <p>₱${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-info">
                    <h3>Pending</h3>
                    <p>${transactions.filter(t => t.status === 'pending').length}</p>
                </div>
            </div>
        `;

        // Load recent transactions
        const recentTransactions = transactions.slice(-5).reverse();
        const tbody = document.querySelector('#recentTransactionsTable tbody');
        tbody.innerHTML = recentTransactions.map(t => `
            <tr>
                <td>${t.id}</td>
                <td>${t.code}</td>
                <td>${t.gcashName}</td>
                <td>₱${t.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    // ======================
    // 4. NAVIGATION
    // ======================
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');
            document.getElementById('sectionTitle').textContent = this.textContent.trim();
            
            // Load appropriate data
            if (section === 'dashboard') loadDashboard();
            if (section === 'codes') loadRedemptionCodes();
            if (section === 'transactions') loadTransactions();
        });
    });

    // ======================
    // 5. REDEMPTION CODES
    // ======================
    function loadRedemptionCodes() {
        const codes = JSON.parse(localStorage.getItem('redemptionCodes')) || [];
        const tbody = document.querySelector('#codesTable tbody');
        tbody.innerHTML = codes.map(code => `
            <tr>
                <td>${code.code}</td>
                <td>₱${code.amount.toFixed(2)}</td>
                <td>${code.currentRedemptions}</td>
                <td>${code.maxRedemptions}</td>
                <td><span class="status-badge ${code.currentRedemptions >= code.maxRedemptions ? 'status-pending' : 'status-success'}">
                    ${code.currentRedemptions >= code.maxRedemptions ? 'Out of Stock' : 'Active'}
                </span></td>
                <td>
                    <button class="btn-action btn-edit" data-code="${code.code}">Edit</button>
                    <button class="btn-action btn-delete" data-code="${code.code}">Delete</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editCode(btn.dataset.code));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete(btn.dataset.code));
        });
    }

    // ... (Include similar complete functions for transactions, create-code, etc.)
});
