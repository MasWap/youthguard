let timerElement;
let blockElement;
let resetButton;

function createTimerElement() {
  timerElement = document.createElement('div');
  timerElement.id = 'timeguard-timer';
  timerElement.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(timerElement);
}

function createBlockElement() {
  blockElement = document.createElement('div');
  blockElement.id = 'timeguard-block';
  blockElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    z-index: 9998;
    display: none;
  `;
  blockElement.textContent = "Temps écoulé ! Vous ne pouvez plus naviguer.";
  document.body.appendChild(blockElement);
}

function createResetButton() {
  resetButton = document.createElement('button');
  resetButton.textContent = 'Réinitialiser le temps';
  resetButton.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
  `;
  
  resetButton.addEventListener('click', () => {
    // Logique pour réinitialiser le temps
    chrome.runtime.sendMessage({ action: "resetTimer" });
  });

  document.body.appendChild(resetButton);
}

function updateTimer(remainingTime) {
  if (!timerElement) {
    createTimerElement();
  }
  timerElement.textContent = formatTime(remainingTime);

  if (remainingTime <= 0) {
    showBlockElement();
  }
}

function showBlockElement() {
  if (blockElement) {
    blockElement.style.display = 'flex';
  }
}

function hideBlockElement() {
  if (blockElement) {
    blockElement.style.display = 'none';
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimer") {
    updateTimer(request.remainingTime);
  }
});

createTimerElement();
createBlockElement();
createResetButton();