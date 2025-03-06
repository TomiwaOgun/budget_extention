let hasRedirected = false;



// Check if the current page is an order confirmation page
function isOrderConfirmationPage() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('/checkout') || url.includes('/thankyou')
}

function isAmazon() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('amazon.ca') || url.includes('amazon.com')
}

function isOrderHistoryPage() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('gp/css/order-history') 
}

// Extract the total amount spent from the page
function extractTotalAmount() {
    const selectors = [
        "order-summary-line-definition", // Original selector
        ".order-total", // Common class for order total
        ".total-price", // Another common class
        "[data-testid='order-total']", // Data attribute selector
        "span.price", // Generic price selector
        "div.total", // Generic total selector
        ".a-row",
    ];
    let priceElement = null;

    for (const selector of selectors) {
        priceElement = document.querySelector(selector);
        if (priceElement) {
            console.log("price element found");
            break; // Stop if a matching element is found
        }
        else{
            console.error("price element not found:", error);
        }
    }

    if (priceElement) {
        const priceText = priceElement.textContent.trim();
        // Remove currency symbols and commas, then parse as a number
        const priceAmount = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        if (!isNaN(priceAmount)) {
            return priceAmount;
        } else {
            console.error("Failed to parse price:", priceText);
        }
    } else {
        console.error("Price element not found on the page.");
    }
    return null;
    
}

function extractFromOrderHistory(){
    console.log("extracting total price from order history...");
    const priceElement = document.querySelector(".a-column.a-span2.yohtmlc-order-total .a-row.a-size-base span");
    if (priceElement) {
        console.log("price element found");
        // Remove currency symbols and commas, then parse as a number
        const priceAmount = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
        if (!isNaN(priceAmount)) {
            return priceAmount;
        } else {
            console.error("Failed to parse price:", priceElement.textContent);
        }
    } 
    else{
        console.error("Could not find total price in order history.");
        return null;
    }
    
}

// Save the total amount to Chrome storage
function saveTotalAmount(amount) {
    chrome.storage.sync.get(['totalSpent'], (data) => {
      const totalSpent = (data.totalSpent || 0) + amount;
      chrome.storage.sync.set({ totalSpent });
      chrome.runtime.sendMessage({ action: "updateUI" });
    });
}


function redirectToOrderHistory() {
    console.log("Redirecting to order history...");
    // Set the flag to indicate redirection from the confirmation page
    chrome.storage.local.set({ redirectedFromConfirmation: true }, () => {
        window.location.href = "https://www.amazon.ca/gp/css/order-history?ref_=nav_orders_first";
    });
}

// Wait for the purchase confirmation
function waitForPurchaseConfirmation() {
    console.log("waitForPurchaseConfirmation called"); // Debugging
    // Common selectors for confirmation messages or total amounts
    if (isAmazon() && !hasRedirected) {
        console.log("Redirecting to order history...");
        hasRedirected = true; // Set the flag to prevent infinite redirection
        redirectToOrderHistory();
        return;
    }
    
    const confirmationSelectors = [
        ".a-row", // Example: Amazon
    ];
    // Check for a specific element that appears after purchase (e.g., a "Thank you" message)
    for (const selector of confirmationSelectors)
    {
        console.log("Checking selector:", selector); // Debugging
        const confirmationElement = document.querySelector(selector); // Adjust the selector as needed

        if (confirmationElement) {
            // If the confirmation element is found, extract and save the total amount
            console.log("Confirmation element found:", confirmationElement); // Debugging
    
            const price = extractTotalAmount();
            
            if (price) {
                saveTotalAmount(price);
                console.log("Purchase confirmed. Total amount saved:", price);
                return;
            }
        }
        else{
            console.log("Confirmation element not found for selector:", selector); // Debugging
        }
    }

    // If the confirmation element is not found, check again after a short delay
    console.log("No confirmation element found. Retrying in 1 second..."); // Debugging
    setTimeout(waitForPurchaseConfirmation, 1000); // Check every second
    
}

if (isOrderHistoryPage()) {
    console.log("On order history page. Checking if redirected from confirmation...");
    // Check if the redirection was triggered by the script
    chrome.storage.local.get(['redirectedFromConfirmation'], (data) => {
        if (data.redirectedFromConfirmation) {
            console.log("Redirected from confirmation page. Extracting total...");
            const price = extractFromOrderHistory();
            if (price) {
                saveTotalAmount(price);
            }
            // Reset the flag after processing
            chrome.storage.local.set({ redirectedFromConfirmation: false });
        } else {
            console.log("Not redirected from confirmation page. Skipping extraction.");
        }
    });
} else if (isOrderConfirmationPage()) {
    console.log("content.js loaded"); // This should appear in the web page's console

    // Wait for the page to load
    setTimeout(() => {
        console.log("Checking for purchase confirmation...");
        waitForPurchaseConfirmation();
    }, 2000); // Wait 2 seconds before checking
}