document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const redeemBtn = document.getElementById('redeem-btn');
    const redeemCodeInput = document.getElementById('redeem-code');
    const gcashNameInput = document.getElementById('gcash-name');
    const gcashNumberInput = document.getElementById('gcash-number');
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const amountDisplay = document.getElementById('amount-display');
    const errorTitle = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    const closeModals = document.querySelectorAll('.close-modal');
    
    // Sample redemption codes data (in a real app, this would come from a database)
    // This is just for demonstration since we're not using a database
    let redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes')) || [
        { code: '1872HD7', amount: 1, maxRedemptions: 5, currentRedemptions: 0, status: 'active' },
        { code: '2893JK8', amount: 5, maxRedemptions: 10, currentRedemptions: 0, status: 'active' },
        { code: '3654LM9', amount: 10, maxRedemptions: 3, currentRedemptions: 0, status: 'active' }
    ];
    
    // Initialize if not exists
    if (!localStorage.getItem('redemptionCodes')) {
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
    }
    
    // Initialize transactions if not exists
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Close modal function
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Close modals when clicking X
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Redeem button click handler
    redeemBtn.addEventListener('click', function() {
        const code = redeemCodeInput.value.trim().toUpperCase();
        const gcashName = gcashNameInput.value.trim();
        const gcashNumber = gcashNumberInput.value.trim();
        
        // Validate inputs
        if (!code || !gcashName || !gcashNumber) {
            showError('Incomplete Information', 'Please fill in all fields to proceed with redemption.');
            return;
        }
        
        if (!/^09\d{9}$/.test(gcashNumber)) {
            showError('Invalid GCash Number', 'Please enter a valid 11-digit GCash number starting with 09.');
            return;
        }
        
        // Find the redemption code
        const redemptionCode = redemptionCodes.find(rc => rc.code === code);
        
        if (!redemptionCode) {
            showError('Invalid Code', 'The redemption code you entered is invalid. Please check and try again.');
            return;
        }
        
        if (redemptionCode.status !== 'active') {
            showError('Code Not Active', 'This redemption code is no longer active.');
            return;
        }
        
        if (redemptionCode.currentRedemptions >= redemptionCode.maxRedemptions) {
            showError('Code Limit Reached', 'This redemption code has reached its maximum number of redemptions.');
            return;
        }
        
        // Check if this GCash number has already redeemed this code
        const existingTransaction = transactions.find(t => 
            t.code === code && t.gcashNumber === gcashNumber
        );
        
        if (existingTransaction) {
            if (existingTransaction.status === 'success') {
                showError('Already Redeemed', 'You have already successfully redeemed this code.');
                return;
            } else if (existingTransaction.status === 'pending') {
                showError('Pending Redemption', 'You have a pending redemption for this code. Please wait for processing.');
                return;
            }
        }
        
        // Create transaction
        const transaction = {
            id: Date.now(),
            code: code,
            gcashName: gcashName,
            gcashNumber: gcashNumber,
            amount: redemptionCode.amount,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Update redemption code count
        redemptionCode.currentRedemptions += 1;
        if (redemptionCode.currentRedemptions >= redemptionCode.maxRedemptions) {
            redemptionCode.status = 'inactive';
        }
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
        
        // Show success message
        amountDisplay.textContent = `₱${redemptionCode.amount}`;
        successModal.style.display = 'block';
        
        // Clear form
        redeemCodeInput.value = '';
        gcashNameInput.value = '';
        gcashNumberInput.value = '';
    });
    
    // Show error modal
    function showError(title, message) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }
    
    // Add input masking for GCash number
    gcashNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        e.target.value = value;
    });
});
