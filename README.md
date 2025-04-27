Budget Garden - Chrome Extension
Budget Garden is a Chrome extension designed to help users track their spending and manage their budget effectively. It automatically detects when a purchase is made on an order confirmation page and saves the total amount spent. Users can also manually add expenses, set a weekly budget, and track their remaining budget. Currently only works on amozon and temu.

Features
Automatic Spending Tracking: Detects purchases on order confirmation pages and saves the total amount spent. (in progress!)

Manual Expense Entry: Allows users to manually add expenses.

Weekly Budget: Set a weekly budget and track how much is left.

Leftover Calculation: Calculates the leftover money after expenses.

Reset Budget: Reset the budget and total spent at any time.

Tracks purchases made from amazon and temu as well as manual entries.

Installation
Step 1: Download the Extension
Clone or download this repository to your local machine.

Step 2: Load the Extension in Chrome
Open Chrome and go to chrome://extensions/.

Enable Developer mode (toggle in the top-right corner).

Click Load unpacked and select the folder where the extension files are located.

Step 3: Use the Extension
Click the Budget Garden icon in the Chrome toolbar to open the popup.

Set your weekly budget and start tracking your spending!

How to Use
Automatic Spending Tracking
When you complete a purchase on a website, the extension will automatically detect the order confirmation page and save the total amount spent. (It should work for amazon now)

Manual Expense Entry
Open the Budget Garden popup.

Enter the amount spent in the Add Spent Money field.

Click Add Spent to update the total spent.

Set a Weekly Budget
Open the Budget Garden popup.

Enter your weekly budget in the Weekly Budget field.

Click Set Budget to save your budget.

Reset Budget
Click Reset Budget to reset your weekly budget and total spent to zero.


Files in the Extension
content.js: Detects order confirmation pages and extracts the total amount spent.

background.js: Listens for tab updates and injects content.js into order confirmation pages.

popup.js: Handles the popup UI, including setting the budget, adding manual expenses, and resetting the budget.

popup.html: Defines the structure of the popup UI.

popup.css: Styles the popup UI.

manifest.json: Defines the extension's metadata, permissions, and behavior.

Permissions
storage: Saves the user's budget and total spent in Chrome storage.

tabs: Listens for tab updates to detect order confirmation pages.

scripting: Injects content.js into order confirmation pages.

activeTab: Allows the extension to interact with the active tab.

Customization
Change Icons: Replace the icons in the icons folder with your own.

Modify Selectors: If the extension doesn't detect the total amount on a specific website, update the selectors in content.js.

Add Features: Extend the functionality by adding new features to popup.js or content.js.

Troubleshooting
The Extension Doesn't Detect the Total Amount
Ensure the website's order confirmation page includes a recognizable element (e.g., a total price element).

Update the selectors in content.js to match the website's structure.

The Popup Doesn't Open
Make sure the extension is properly loaded in Chrome.

Check the console for errors (chrome://extensions/ → Click Budget Garden → Click Service Worker → Check the console).

Credits
Icons: Icons by charlie from freeicons.io.

Inspiration: Inspired by the need to track impulse buying and manage budgets effectively.
