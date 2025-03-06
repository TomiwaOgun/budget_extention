// Get DOM elements
const budgetInput = document.getElementById('budget');
const leftoverDisplay = document.getElementById('leftover');
const setBudgetButton = document.getElementById('setBudget');
const remainingBudgetDisplay = document.getElementById('remainingBudget');
const totalSpentDisplay = document.getElementById('totalSpent');
const manualSpentInput = document.getElementById('manualSpent');
const addSpentButton = document.getElementById('addSpent')
const transferToGameButton = document.getElementById('transferToGame');
const resetBudgetButton = document.getElementById('resetBudget');

let budget = 0;
let totalSpent = 0;

// Load saved data from Chrome storage
chrome.storage.sync.get(['budget', 'totalSpent'], (data) => {
  budget = data.budget || 0;
  totalSpent = data.totalSpent || 0;
  updateUI();
});

// Set budget
setBudgetButton.addEventListener('click', () => {
  budget = parseFloat(budgetInput.value);
  if (isNaN(budget)) {
    alert('Please enter a valid number for your budget.');
    return;
  }
  if (budget < 0) {
    alert('Budget cannot be negative.');
    return;
  }
  chrome.storage.sync.set({ budget, totalSpent }); // Save budget to Chrome storage
  updateUI();
  budgetInput.value = ''; // Clear the input field
});

resetBudgetButton.addEventListener('click', () => {
    budget = 0;
    totalSpent = 0;
    chrome.storage.sync.set({ budget, totalSpent });
    updateUI();
  });

// Add manually spent money
addSpentButton.addEventListener('click', () => {
    const spentAmount = parseFloat(manualSpentInput.value);
    if (isNaN(spentAmount) || spentAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    totalSpent += spentAmount;
    chrome.storage.sync.set({ totalSpent });
    updateUI();
    manualSpentInput.value = ''; // Clear the input field
  });

// Transfer leftover money to the game
transferToGameButton.addEventListener('click', () => {
    const leftover = budget - totalSpent;
    if (leftover > 0) {
      alert(`Transferred $${leftover} to your game!`);
      // Reset spending and budget
      totalSpent = 0;
      budget = 0;
      chrome.storage.sync.set({ totalSpent, budget });
      updateUI();
  } else {
    alert('No leftover money to transfer!');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateUI") {
      updateUI();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.totalSpent) {
      console.log("Total spent changed from", changes.totalSpent.oldValue, "to", changes.totalSpent.newValue);
      updateUI(); // Update the popup UI
  }
  if (changes.budget) {
      console.log("Budget changed from", changes.budget.oldValue, "to", changes.budget.newValue);
      updateUI(); // Update the popup UI
  }
});

// Update the UI
function updateUI() {
    console.log('Updating UI'); // Debugging
    console.log('Budget:', budget); // Debugging
    console.log('Total Spent:', totalSpent); // Debugging

    const remainingBudget = budget - totalSpent;
    remainingBudgetDisplay.textContent = `$${remainingBudget.toFixed(2)}`;
    totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
    leftoverDisplay.textContent = `$${(budget - totalSpent).toFixed(2)}`;

    // Handle negative budget
    if (remainingBudget < 0) {
      remainingBudgetDisplay.style.color = 'red'; // Highlight in red
    } else {
      remainingBudgetDisplay.style.color = ''; // Reset color
    }
   
}