document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page or dashboard
    if (document.getElementById('login-form')) {
        // Login Page
        const loginForm = document.getElementById('login-form');
        const errorMessage = document.getElementById('login-error');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Check credentials (in a real app, this would be an API call)
            if (username === 'admin' && password === 'pass8080') {
                // Store login state in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                // Redirect to dashboard
                window.location.href = 'admin/dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid username or password';
                errorMessage.style.display = 'block';
            }
        });
    } else if (document.getElementById('logout')) {
        // Dashboard Page
        // Check if user is logged in
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'admin/index.html';
            return;
        }
        
        // Logout functionality
        document.getElementById('logout').addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        });
        
        // Sample data (in a real app, this would come from a database)
        let redemptionCodes = {
            '1872HD7': { amount: 1, maxRedemptions: 5, currentRedemptions: 0 },
            'GCASH50': { amount: 50, maxRedemptions: 10, currentRedemptions: 5 },
            'FREE100': { amount: 100, maxRedemptions: 3, currentRedemptions: 3 },
            'NEWUSER': { amount: 10, maxRedemptions: 100, currentRedemptions: 42 }
        };
        
        let redemptionHistory = JSON.parse(localStorage.getItem('redemptionHistory')) || [];
        
        // DOM Elements
        const totalRedemptionsEl = document.getElementById('total-redemptions');
        const pendingRedemptionsEl = document.getElementById('pending-redemptions');
        const completedRedemptionsEl = document.getElementById('completed-redemptions');
        const totalAmountEl = document.getElementById('total-amount');
        const redemptionsTable = document.getElementById('redemptions-table').getElementsByTagName('tbody')[0];
        const codesTable = document.getElementById('codes-table').getElementsByTagName('tbody')[0];
        const refreshBtn = document.getElementById('refresh-redemptions');
        const addCodeBtn = document.getElementById('add-code-btn');
        const addCodeModal = document.getElementById('add-code-modal');
        const addCodeForm = document.getElementById('add-code-form');
        const closeModalBtns = document.querySelectorAll('.close-modal, .btn-cancel');
        
        // Navigation
        const navLinks = document.querySelectorAll('.sidebar nav a');
        const sections = document.querySelectorAll('.section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links and sections
                navLinks.forEach(l => l.parentNode.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked link
                this.parentNode.classList.add('active');
                
                // Show corresponding section
                const target = this.getAttribute('href').substring(1);
                document.getElementById(`${target}-section`).classList.add('active');
            });
        });
        
        // Update stats
        function updateStats() {
            const total = redemptionHistory.length;
            const pending = redemptionHistory.filter(r => r.status === 'pending').length;
            const completed = redemptionHistory.filter(r => r.status === 'success').length;
            const totalAmount = redemptionHistory.reduce((sum, r) => sum + r.amount, 0);
            
            totalRedemptionsEl.textContent = total;
            pendingRedemptionsEl.textContent = pending;
            completedRedemptionsEl.textContent = completed;
            totalAmountEl.textContent = `₱${totalAmount}`;
        }
        
        // Populate redemptions table
        function populateRedemptionsTable() {
            redemptionsTable.innerHTML = '';
            
            // Show latest 10 redemptions
            const recentRedemptions = [...redemptionHistory].reverse().slice(0, 10);
            
            recentRedemptions.forEach(redemption => {
                const row = redemptionsTable.insertRow();
                
                row.innerHTML = `
                    <td>${redemption.code}</td>
                    <td>${redemption.name}</td>
                    <td>${redemption.number}</td>
                    <td>₱${redemption.amount}</td>
                    <td>${new Date(redemption.date).toLocaleString()}</td>
                    <td><span class="status status-${redemption.status}">${redemption.status}</span></td>
                    <td>
                        ${redemption.status === 'pending' ? 
                            `<button class="btn-action btn-complete" data-id="${redemption.date}">Complete</button>` : ''}
                        <button class="btn-action btn-delete" data-id="${redemption.date}">Delete</button>
                    </td>
                `;
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.btn-complete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const date = this.getAttribute('data-id');
                    completeRedemption(date);
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const date = this.getAttribute('data-id');
                    deleteRedemption(date);
                });
            });
        }
        
        // Populate codes table
        function populateCodesTable() {
            codesTable.innerHTML = '';
            
            for (const [code, data] of Object.entries(redemptionCodes)) {
                const row = codesTable.insertRow();
                const isOutOfStock = data.currentRedemptions >= data.maxRedemptions;
                
                row.innerHTML = `
                    <td>${code}</td>
                    <td>₱${data.amount}</td>
                    <td>${data.currentRedemptions}/${data.maxRedemptions}</td>
                    <td>${data.maxRedemptions}</td>
                    <td><span class="status ${isOutOfStock ? 'status-pending' : 'status-success'}">${isOutOfStock ? 'Out of Stock' : 'Active'}</span></td>
                    <td>
                        <button class="btn-action btn-edit" data-code="${code}">Edit</button>
                        <button class="btn-action btn-delete" data-code="${code}">Delete</button>
                    </td>
                `;
            }
            
            // Add event listeners to action buttons
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const code = this.getAttribute('data-code');
                    editCode(code);
                });
            });
            
            document.querySelectorAll('.btn-delete[data-code]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const code = this.getAttribute('data-code');
                    deleteCode(code);
                });
            });
        }
        
        // Complete redemption
        function completeRedemption(date) {
            const redemption = redemptionHistory.find(r => r.date === date);
            if (redemption) {
                redemption.status = 'success';
                localStorage.setItem('redemptionHistory', JSON.stringify(redemptionHistory));
                updateStats();
                populateRedemptionsTable();
            }
        }
        
        // Delete redemption
        function deleteRedemption(date) {
            if (confirm('Are you sure you want to delete this redemption?')) {
                redemptionHistory = redemptionHistory.filter(r => r.date !== date);
                localStorage.setItem('redemptionHistory', JSON.stringify(redemptionHistory));
                updateStats();
                populateRedemptionsTable();
            }
        }
        
        // Edit code
        function editCode(code) {
            // In a real app, this would open an edit modal
            alert(`Editing code ${code} would be implemented here`);
        }
        
        // Delete code
        function deleteCode(code) {
            if (confirm(`Are you sure you want to delete code ${code}?`)) {
                delete redemptionCodes[code];
                // In a real app, this would update the database
                updateStats();
                populateCodesTable();
            }
        }
        
        // Add new code
        function addNewCode(code, amount, limit) {
            if (redemptionCodes[code]) {
                alert('This code already exists');
                return;
            }
            
            redemptionCodes[code] = {
                amount: parseInt(amount),
                maxRedemptions: parseInt(limit),
                currentRedemptions: 0
            };
            
            // In a real app, this would update the database
            populateCodesTable();
            closeModal(addCodeModal);
            addCodeForm.reset();
        }
        
        // Modal functions
        function openModal(modal) {
            modal.style.display = 'block';
        }
        
        function closeModal(modal) {
            modal.style.display = 'none';
        }
        
        // Event listeners
        refreshBtn.addEventListener('click', function() {
            populateRedemptionsTable();
            // Animation for refresh
            this.querySelector('i').classList.add('fa-spin');
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
            }, 1000);
        });
        
        addCodeBtn.addEventListener('click', function() {
            openModal(addCodeModal);
        });
        
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                closeModal(addCodeModal);
            });
        });
        
        addCodeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('new-code').value.trim().toUpperCase();
            const amount = document.getElementById('code-amount').value;
            const limit = document.getElementById('code-limit').value;
            
            addNewCode(code, amount, limit);
        });
        
        // Initialize
        updateStats();
        populateRedemptionsTable();
        populateCodesTable();
    }
});
