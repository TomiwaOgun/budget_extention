// Check if the current page is an order confirmation page
function isOrderConfirmationPage() {
    const url = window.location.href;
    return url.includes('/checkout') || url.includes('/order-confirmation')
}

// Extract the total amount spent from the page
function extractTotalAmount() {
    const url = window.location.href;
    const selectors = [
        "order-summary-line-definition", // Original selector
        ".order-total", // Common class for order total
        ".total-price", // Another common class
        "[data-testid='order-total']", // Data attribute selector
        "span.price", // Generic price selector
        "div.total" // Generic total selector
    ];
    let priceElement = null;

    for (const selector of selectors) {
        priceElement = document.querySelector(selector);
        if (priceElement) {
            break; // Stop if a matching element is found
        }
    }
    
    if(priceElement){
        const priceText = priceElement.textContent.trim();
        const priceAmount = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        // Check if the parsed amount is a valid number
        if (!isNaN(priceAmount)) {
            return priceAmount;
        } else {
            console.error("Failed to parse price:", priceText);
        }
    }
    else {
        console.error("Price element not found on the page.");
    }
    return null;

}

// Save the total amount to Chrome storage
function saveTotalAmount(amount) {
    chrome.storage.sync.get(['totalSpent'], (data) => {
      const totalSpent = (data.totalSpent || 0) + amount;
      chrome.storage.sync.set({ totalSpent });
    });
  }

// Main logic
/*
if (isOrderConfirmationPage()) {
    if(document.getElementById('placeOrder').clicked == true)
        {
           const price = extractTotalAmount();
           if (price){
                saveTotalAmount(price)
            }
           
        }
}
*/
// Wait for the purchase confirmation
function waitForPurchaseConfirmation() {
    // Check for a specific element that appears after purchase (e.g., a "Thank you" message)
    const confirmationElement = document.querySelector("widget-purchaseConfirmationStatus"); // Adjust the selector as needed

    if (confirmationElement) {
        // If the confirmation element is found, extract and save the total amount
        const price = extractTotalAmount();
        if (price) {
            saveTotalAmount(price);
            console.log("Purchase confirmed. Total amount saved:", price);
        }
    } else {
        // If the confirmation element is not found, check again after a short delay
        setTimeout(waitForPurchaseConfirmation, 1000); // Check every second
    }
}

if (isOrderConfirmationPage()) {
    console.log("Order confirmation page detected. Waiting for purchase confirmation...");
    waitForPurchaseConfirmation();
    /*
    console.log('Total Spent:', totalSpent); // Debugging
    const remainingBudget = budget - totalSpent;
    remainingBudgetDisplay.textContent = `$${remainingBudget.toFixed(2)}`;
    totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
    leftoverDisplay.textContent = `$${(budget - totalSpent).toFixed(2)}`;
   
 // Save updated values to Chrome storage (Use sync consistently)
    chrome.storage.sync.set({ budget, totalSpent });
    */
}
