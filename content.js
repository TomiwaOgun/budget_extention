let hasRedirected = false;



// Check if the current page is an order confirmation page
function isOrderConfirmationPage() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging

    // Check for Amazon confirmation page
    const isAmazonConfirmation = url.includes('/checkout') || url.includes('/thankyou') || url.includes('/order-history');

    // Check for Temu confirmation page
    const isTemuConfirmation = url.includes('bgt_payment_success.html');

    return isAmazonConfirmation || isTemuConfirmation;
}

function isAmazon() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debuggingS
    return url.includes('amazon.ca') || url.includes('amazon.com');
}

function isTemu() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('temu.com');
}

function isOrderHistoryPageAmazon() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('gp/css/order-history') ;
}

function isOrderHistoryPageTemu() {
    const url = window.location.href;
    console.log("Current URL:", url); // Log the URL for debugging
    return url.includes('/bgt_orders.html') ;
}



function extractFromOrderHistoryAmazon(){
    console.log("extracting total price from order history...");
    // Select all instances of the price element
    const priceElements = document.querySelectorAll("div.a-row > span.a-size-base.a-color-secondary.aok-break-word");
    
    // Select the second instance (index 1)
    const priceElement = priceElements[1]; // Second instance is at index 1
    
    const nameElement = document.querySelector(".a-row .yohtmlc-product-title a.a-link-normal");
    if (priceElement && nameElement) {
        console.log("price element and name element found");
        // Debugging: log the price and name elements
        console.log("Price Text:", priceElement.textContent);
        console.log("Product Name:", nameElement.textContent);
        // Remove currency symbols and commas, then parse as a number
        const priceAmount = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
        const itemName = nameElement.textContent.trim();
        if (!isNaN(priceAmount)) {
            return { price: priceAmount, name: itemName, store: "Amazon" };
        } else {
            console.error("Failed to parse price:", priceElement.textContent);
        }
    } 
    else{
        console.error("Could not find total price in order history.");
        return null;
    }
     
}

function extractFromOrderHistoryTemu(){
    console.log("Extracting total price from Temu order history...");
    const priceElement = document.querySelector("#OrderContainerId > div.EXnAPKW4._1TVhLYuz._1zXPh4hL > div > div > div._2DCuXnC8._3XuYgWk7 > div._3mkhPT0m > div._3VQB0npX > span:nth-child(1) > span.V1INftP1");
    if (priceElement) {
        console.log("Price element found:", priceElement);
        // Remove currency symbols and commas, then parse as a number
        const priceAmount = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ''));
        if (!isNaN(priceAmount)) {
            console.log("Price amount parsed:", priceAmount);
            return { price: priceAmount, name: "", store: "Temu" };
        } else {
            console.error("Failed to parse price:", priceElement.textContent);
        }
    } 
    else{
        console.error("Could not find total price in Temu order history.");
        return null;
    }
    
}

// Save the total amount to Chrome storage
function saveTotalAmount(amount) {
    chrome.storage.sync.get(['totalSpent'], (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving totalSpent:", chrome.runtime.lastError);
            return;
        }

        const totalSpent = (data.totalSpent || 0) + amount;
        chrome.storage.sync.set({ totalSpent }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving totalSpent:", chrome.runtime.lastError);
                return;
            }
            console.log("Total amount saved:", totalSpent);
            chrome.runtime.sendMessage({ action: "updateUI" });
        });
    });
}

// Save the total amount to Chrome storage
function saveList(orderDetails) {
    chrome.storage.sync.get(['spentList'], (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving spent list:", chrome.runtime.lastError);
            return;
        }

        const spentList = data.spentList || [];
        spentList.push(orderDetails);
        chrome.storage.sync.set({ spentList }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving spent list:", chrome.runtime.lastError);
                return;
            }
            console.log("Spent List saved:", spentList);
            chrome.runtime.sendMessage({ action: "updateUI" });
        });
    });
}

function redirectToOrderHistoryAmazon(){
    console.log("Redirecting to order history...");
    // Set the flag to indicate redirection from the confirmation page
    chrome.storage.local.set({ redirectedFromConfirmation: true }, () => {
        window.location.href = "https://www.amazon.ca/gp/css/order-history?ref_=nav_orders_first";
    });
}

function redirectToOrderHistoryTemu() {
    console.log("Redirecting to order history...");
    // Set the flag to indicate redirection from the confirmation page
    chrome.storage.local.set({ redirectedFromConfirmation: true }, () => {
        window.location.href = "https://www.temu.com/ca/bgt_orders.html";
    });
}

// Wait for the purchase confirmation
function waitForPurchaseConfirmation() {
    console.log("waitForPurchaseConfirmation called"); // Debugging
    // Common selectors for confirmation messages or total amounts
    if (isAmazon() && !hasRedirected) {
        console.log("Redirecting to order history...");
        hasRedirected = true; // Set the flag to prevent infinite redirection
        redirectToOrderHistoryAmazon();
        return;
    }
    if (isTemu() && !hasRedirected) {
        console.log("Redirecting to order history...");
        hasRedirected = true; // Set the flag to prevent infinite redirection
        redirectToOrderHistoryTemu();
        return;
    }
    // If the confirmation element is not found, check again after a short delay
    console.log("Redirection not triggered yet. Retrying in 1 second..."); // Debugging
    setTimeout(waitForPurchaseConfirmation, 1000); // Check every second
    
}

if (isOrderHistoryPageAmazon()) {
    console.log("On order history page. Checking if redirected from confirmation...");
    // Check if the redirection was triggered by the script
    chrome.storage.local.get(['redirectedFromConfirmation'], (data) => {
        if (data.redirectedFromConfirmation) {
            console.log("Redirected from confirmation page. Extracting total...");
            const orderDetails = extractFromOrderHistoryAmazon();
            if (orderDetails) {
                const price = orderDetails.price;
                
                saveTotalAmount(price);
                saveList(orderDetails);
            }
            // Reset the flag after processing
            chrome.storage.local.set({ redirectedFromConfirmation: false });
        } else {
            console.log("Not redirected from confirmation page. Skipping extraction.");
        }
    });
} 
else if (isOrderHistoryPageTemu()) {
    console.log("On order history page. Checking if redirected from confirmation...");
    // Check if the redirection was triggered by the script
    chrome.storage.local.get(['redirectedFromConfirmation'], (data) => {
        if (data.redirectedFromConfirmation) {
            console.log("Redirected from confirmation page. Extracting total...");
            const orderDetails = extractFromOrderHistoryTemu();
            if (orderDetails) {
                const price = orderDetails.price;
                saveTotalAmount(price);
                saveList(orderDetails);
            }
            // Reset the flag after processing
            chrome.storage.local.set({ redirectedFromConfirmation: false });
        } else {
            console.log("Not redirected from confirmation page. Skipping extraction.");
        }
    });

}
else if (isOrderConfirmationPage()) {
    console.log("content.js loaded"); // This should appear in the web page's console

    // Wait for the page to load
    setTimeout(() => {
        console.log("Checking for purchase confirmation...");
        waitForPurchaseConfirmation();
    }, 2000); // Wait 2 seconds before checking
}