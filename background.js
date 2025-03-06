//background.js
// Listen for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("Budget Garden extension installed.");
    // Initialize default values in Chrome storage
    chrome.storage.sync.set({ budget: 0, totalSpent: 0 });
});

// Listen for tab updates to check if the user is on an order confirmation page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('/thankyou')||tab.url.includes('gp/css/order-history')) {
            console.log("Order confirmation page detected. Injecting content.js...");

            // Inject the content script to extract the total amount
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            })
            .then(() => {
                console.log("content.js injected successfully.");
                //console.log("total spent ", totalSpent);
            })
            .catch((error) => {
                console.error("Failed to inject content.js:", error);
            });
        }
    }
});