let timerElement;

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

function updateTimer(remainingTime) {
  if (!timerElement) {
    createTimerElement();
  }
  timerElement.textContent = formatTime(remainingTime);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

// Écouter les messages du background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimer") {
    updateTimer(request.remainingTime);
  }
});

// Initialiser le timer
createTimerElement();