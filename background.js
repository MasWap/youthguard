let timeSpent = {};
let MAX_TIME = 60 * 60 * 1000; // 1 heure en millisecondes
let currentInterval = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateTimer(tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateTimer(tab.url);
  });
});

function updateTimer(url) {
  const domain = new URL(url).hostname;
  if (["www.facebook.com", "www.instagram.com", "www.tiktok.com"].includes(domain)) {
    startTimer(domain);
  } else {
    stopTimer();
  }
}

function startTimer(domain) {
  stopTimer(); // Arrête le timer précédent s'il existe
  
  if (!timeSpent[domain]) {
    timeSpent[domain] = 0;
  }

  currentInterval = setInterval(() => {
    timeSpent[domain] += 1000;
    saveTimeSpent();

    if (timeSpent[domain] >= MAX_TIME) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, {url: "blocked.html"});
        }
      });
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
}

function saveTimeSpent() {
  chrome.storage.local.set({ timeSpent: timeSpent });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTime") {
    sendResponse({timeSpent: timeSpent});
  }
});

// Charger les données sauvegardées au démarrage
chrome.storage.local.get(['timeSpent'], (result) => {
  if (result.timeSpent) {
    timeSpent = result.timeSpent;
  }
});