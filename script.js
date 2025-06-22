document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const redeemBtn = document.getElementById('redeem-btn');
    const redeemCodeInput = document.getElementById('redeem-code');
    const gcashNameInput = document.getElementById('gcash-name');
    const gcashNumberInput = document.getElementById('gcash-number');
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const rewardAmountSpan = document.getElementById('reward-amount');
    const errorTitle = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    const closeModalButtons = document.querySelectorAll('.close-modal, .btn-ok');

    // Sample redemption codes data (in a real app, this would come from a database)
    const redemptionCodes = {
        '1872HD7': { amount: 1, maxRedemptions: 5, currentRedemptions: 0 },
        'GCASH50': { amount: 50, maxRedemptions: 10, currentRedemptions: 5 },
        'FREE100': { amount: 100, maxRedemptions: 3, currentRedemptions: 3 }, // Out of stock
        'NEWUSER': { amount: 10, maxRedemptions: 100, currentRedemptions: 42 }
    };

    // Get redemption history from localStorage or initialize
    let redemptionHistory = JSON.parse(localStorage.getItem('redemptionHistory')) || [];

    // Close modal function
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Close modals when clicking X or OK button
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('close-modal')) {
                const modal = this.closest('.modal');
                closeModal(modal);
            } else {
                closeModal(successModal);
                closeModal(errorModal);
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Redeem button click handler
    redeemBtn.addEventListener('click', function() {
        const redeemCode = redeemCodeInput.value.trim().toUpperCase();
        const gcashName = gcashNameInput.value.trim();
        const gcashNumber = gcashNumberInput.value.trim();

        // Validate inputs
        if (!redeemCode || !gcashName || !gcashNumber) {
            showError('Missing Information', 'Please fill in all fields.');
            return;
        }

        if (!/^09\d{9}$/.test(gcashNumber)) {
            showError('Invalid GCash Number', 'Please enter a valid 11-digit GCash number starting with 09.');
            return;
        }

        // Check if code exists
        if (!redemptionCodes[redeemCode]) {
            showError('Invalid Code', 'The redemption code you entered is invalid.');
            return;
        }

        const codeData = redemptionCodes[redeemCode];

        // Check if code is out of stock
        if (codeData.currentRedemptions >= codeData.maxRedemptions) {
            showError('Code Expired', 'This redemption code has reached its maximum usage limit.');
            return;
        }

        // Check if this number already redeemed this code
        const alreadyRedeemed = redemptionHistory.some(redemption => 
            redemption.code === redeemCode && redemption.gcashNumber === gcashNumber
        );

        if (alreadyRedeemed) {
            showError('Already Redeemed', 'You have already redeemed this code with this GCash number.');
            return;
        }

        // Process redemption
        processRedemption(redeemCode, gcashName, gcashNumber, codeData.amount);
    });

    // Process redemption function
    function processRedemption(code, name, number, amount) {
        // In a real app, this would be an API call to your backend
        redemptionCodes[code].currentRedemptions += 1;
        
        // Add to redemption history
        const redemption = {
            code,
            name,
            number,
            amount,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        redemptionHistory.push(redemption);
        localStorage.setItem('redemptionHistory', JSON.stringify(redemptionHistory));
        
        // Show success
        rewardAmountSpan.textContent = `₱${amount}`;
        successModal.style.display = 'block';
        
        // Clear form
        redeemCodeInput.value = '';
        gcashNameInput.value = '';
        gcashNumberInput.value = '';
    }

    // Show error function
    function showError(title, message) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }
});
