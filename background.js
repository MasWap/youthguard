let timeSpent = {};
let MAX_TIME = 60 * 60 * 1000; // 1 heure en millisecondes
let currentInterval = null;
let currentDomain = null;

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
  
  currentDomain = domain;
  if (!timeSpent[domain]) {
    timeSpent[domain] = 0;
  }

  currentInterval = setInterval(() => {
    timeSpent[domain] += 1000;
    saveTimeSpent();
    updateContentScript();

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

function updateContentScript() {
  if (currentDomain) {
    const remainingTime = Math.max(0, (MAX_TIME - timeSpent[currentDomain]) / 1000);
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateTimer",
          remainingTime: remainingTime
        }, (response) => {
          if (chrome.runtime.lastError) {
            // Gérer l'erreur silencieusement
            console.log("Impossible de mettre à jour le timer : ", chrome.runtime.lastError.message);
            // Optionnel : Vous pouvez essayer de réinjecter le content script ici si nécessaire
            // injectContentScript(tabs[0].id);
          }
        });
      }
    });
  }
}

function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.log("Erreur lors de l'injection du content script : ", chrome.runtime.lastError.message);
    } else {
      console.log("Content script réinjecté avec succès");
    }
  });
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

// Ajoutez cette fonction pour vérifier l'état de la popup
function checkPopupState() {
  chrome.storage.local.get(['popupOpen', 'isLoggedIn'], (result) => {
    if (!result.popupOpen && result.isLoggedIn) {
      chrome.storage.local.set({ isLoggedIn: false });
    }
  });
}

// Vérifiez l'état de la popup toutes les secondes
setInterval(checkPopupState, 1000);

// Charger les données sauvegardées au démarrage
chrome.storage.local.get(['timeSpent'], (result) => {
  if (result.timeSpent) {
    timeSpent = result.timeSpent;
  }
});