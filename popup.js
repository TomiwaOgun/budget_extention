// Get DOM elements
const budgetInput = document.getElementById('budget');
const leftoverDisplay = document.getElementById('leftover');
const setBudgetButton = document.getElementById('setBudget');
const remainingBudgetDisplay = document.getElementById('remainingBudget');
const totalSpentDisplay = document.getElementById('totalSpent');
const manualSpentInput = document.getElementById('manualSpent');
const manualItemInput = document.getElementById('manualItem');
const manualStoreInput = document.getElementById('manualStoreName');
const addSpentButton = document.getElementById('addSpent')
const resetBudgetButton = document.getElementById('resetBudget');
const displaySpentList = document.getElementById('spentList');
const spentListButton = document.getElementById('toggle-spent');
const list = document.getElementById('List');

let budget = 0;
let totalSpent = 0;
let spentList = []; 
let isVisible = false;

// Load saved data from Chrome storage
chrome.storage.sync.get(['budget', 'totalSpent', 'spentList'], (data) => {
  budget = data.budget || 0;
  totalSpent = data.totalSpent || 0;
  spentList.push(...(data.spentList || []));
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
    spentList = [];
    chrome.storage.sync.set({ budget, totalSpent, spentList });
    updateUI();
  });

// Add manually spent money
addSpentButton.addEventListener('click', () => {
    const spentAmount = parseFloat(manualSpentInput.value);
    const item = manualItemInput.value || "";
    const store = manualStoreInput.value || "";
    if (isNaN(spentAmount) || spentAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    totalSpent += spentAmount;
    spentList.push({price: spentAmount,name: item,store: store});
    chrome.storage.sync.set({ totalSpent, spentList });
    updateUI();
    manualItemInput.value = ''; // Clear the input field
    manualStoreInput.value = '';
    manualSpentInput.value = '';
  });


spentListButton.addEventListener('click', () => {
  isVisible = !isVisible;
  list.style.display = isVisible ? "block" : "none";
  spentListButton.textContent = isVisible ? "Hide Spending" : "Review Spending";
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
    console.log('Spent list:', spentList); // Debugging

    displaySpentList.innerHTML = '';

    const remainingBudget = budget - totalSpent;
    remainingBudgetDisplay.textContent = `$${remainingBudget.toFixed(2)}`;
    totalSpentDisplay.textContent = `$${totalSpent.toFixed(2)}`;
    leftoverDisplay.textContent = `$${(budget - totalSpent).toFixed(2)}`;
 
    [...spentList].reverse().forEach(item => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-item"); // Apply a class for styling

      const itemDetails = document.createElement("div");
      itemDetails.classList.add("item-info");

      const itemName = document.createElement("div");
      itemName.classList.add("item-info");
      itemName.textContent = `Item: ${item.name}`;
      itemDetails.appendChild(itemName);

      const itemStore = document.createElement("div");
      itemStore.classList.add("item-store");
      itemStore.textContent = `Store: ${item.store}`;
      itemDetails.appendChild(itemStore);

      const itemPrice = document.createElement("div");
      itemPrice.classList.add("item-price");
      itemPrice.textContent = `Price: $${item.price.toFixed(2)}`;
      itemDetails.appendChild(itemPrice);

      listItem.appendChild(itemDetails);

      // Add a remove button for each item
      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-item");
      removeButton.textContent = "Remove";
      removeButton.onclick = () => removeItem(item);
      listItem.appendChild(removeButton);

      displaySpentList.appendChild(listItem);
    })

    // Handle negative budget
    if (remainingBudget < 0) {
      remainingBudgetDisplay.style.color = 'red'; // Highlight in red
    } else {
      remainingBudgetDisplay.style.color = ''; // Reset color
    }
   
}

function removeItem(item) {
  const index = spentList.indexOf(item);
  if (index > -1) {
      spentList.splice(index, 1); // Remove item from list
      updateUI(); // Re-render the list
  }
}