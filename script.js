// Initialize data if not exists
if (!localStorage.getItem('redemptionCodes')) {
    const initialCodes = [
        { code: '1872HD7', amount: 1, maxRedemptions: 5, currentRedemptions: 0 },
        { code: 'GCASH2023', amount: 5, maxRedemptions: 10, currentRedemptions: 0 },
        { code: 'REWARD50', amount: 50, maxRedemptions: 2, currentRedemptions: 0 }
    ];
    localStorage.setItem('redemptionCodes', JSON.stringify(initialCodes));
}

if (!localStorage.getItem('redemptionTransactions')) {
    localStorage.setItem('redemptionTransactions', JSON.stringify([]));
}

document.addEventListener('DOMContentLoaded', function() {
    const redemptionForm = document.getElementById('redemptionForm');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const closeModalButtons = document.querySelectorAll('.close-modal, .btn-close-modal');
    const rewardAmountDisplay = document.getElementById('rewardAmountDisplay');
    const transactionIdDisplay = document.getElementById('transactionId');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');

    // Close modal function
    function closeModal(modal) {
        modal.classList.remove('show');
    }

    // Show modal function
    function showModal(modal) {
        modal.classList.add('show');
    }

    // Close modals when clicking X or close button
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Form submission
    redemptionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const redeemCode = document.getElementById('redeemCode').value.trim();
        const gcashName = document.getElementById('gcashName').value.trim();
        const gcashNumber = document.getElementById('gcashNumber').value.trim();
        
        // Validate GCash number
        if (!/^09\d{9}$/.test(gcashNumber)) {
            errorTitle.textContent = 'Invalid GCash Number';
            errorMessage.textContent = 'Please enter a valid 11-digit GCash mobile number starting with 09.';
            showModal(errorModal);
            return;
        }
        
        // Check if code exists and has remaining redemptions
        const redemptionCodes = JSON.parse(localStorage.getItem('redemptionCodes'));
        const codeData = redemptionCodes.find(c => c.code === redeemCode);
        
        if (!codeData) {
            errorTitle.textContent = 'Invalid Code';
            errorMessage.textContent = 'The redemption code you entered is invalid. Please check and try again.';
            showModal(errorModal);
            return;
        }
        
        if (codeData.currentRedemptions >= codeData.maxRedemptions) {
            errorTitle.textContent = 'Code Limit Reached';
            errorMessage.textContent = 'This redemption code has reached its maximum number of redemptions.';
            showModal(errorModal);
            return;
        }
        
        // Create transaction
        const transactionId = 'GC' + Date.now().toString().slice(-8);
        const transaction = {
            id: transactionId,
            code: redeemCode,
            gcashName: gcashName,
            gcashNumber: gcashNumber,
            amount: codeData.amount,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        // Update transactions
        const transactions = JSON.parse(localStorage.getItem('redemptionTransactions'));
        transactions.push(transaction);
        localStorage.setItem('redemptionTransactions', JSON.stringify(transactions));
        
        // Update code redemption count
        codeData.currentRedemptions += 1;
        localStorage.setItem('redemptionCodes', JSON.stringify(redemptionCodes));
        
        // Show success modal
        rewardAmountDisplay.textContent = `₱${codeData.amount.toFixed(2)}`;
        transactionIdDisplay.textContent = transactionId;
        showModal(successModal);
        
        // Reset form
        redemptionForm.reset();
    });
});
