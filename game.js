let currency = 0;
let plants = 0;

// Load saved data from Chrome storage
chrome.storage.sync.get(['leftover'], (data) => {
    if (data.leftover) {
        currency = data.leftover;
        updateUI();
    }
});

// Update the UI with the current currency and plant count
function updateUI() {
    document.getElementById('currency').textContent = `$${currency}`;
    document.getElementById('plant-count').textContent = plants;
}

// Buy a seed
document.getElementById('buy-seed').addEventListener('click', () => {
    if (currency >= 10) {
        currency -= 10;
        plants += 1;
        plantSeed();
        updateUI();
    } else {
        alert('Not enough currency!');
    }
});

// Buy a decoration
document.getElementById('buy-decoration').addEventListener('click', () => {
    if (currency >= 20) {
        currency -= 20;
        alert('Decoration purchased!');
        updateUI();
    } else {
        alert('Not enough currency!');
    }
});

// Plant a seed in the garden
function plantSeed() {
    const gardenPlot = document.getElementById('garden-plot');
    const plot = document.createElement('div');
    plot.className = 'plot';
    plot.textContent = '🌱';
    gardenPlot.appendChild(plot);
}

// Simulate transferring leftover money to the game
function transferToGame(amount) {
    currency += amount;
    updateUI();
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "transferToGame") {
        transferToGame(message.amount);
    }
});