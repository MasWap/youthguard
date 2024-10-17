let timeSpent = {};
let currentInterval = null;
let currentDomain = null;
let currentMaxTime = 3600; // Valeur par défaut (1 heure en secondes)
let currentKidId = null; // ID de l'enfant actif

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
    fetchActiveKid().then(kid => {
      if (kid) {
        currentMaxTime = kid.max_time; // Mettez à jour le temps maximum avec l'attribut max_time de l'enfant actif
        currentKidId = kid.id; // Mettez à jour l'ID de l'enfant actif
        startTimer(domain);
      } else {
        console.error('Aucun enfant actif trouvé.');
      }
    }).catch(error => {
      console.error('Erreur lors de la récupération de l\'enfant actif:', error);
    });
  } else {
    stopTimer();
  }
}

function fetchActiveKid() {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/kids') // Récupérer tous les enfants
      .then(response => response.json())
      .then(kids => {
        // Trouver l'enfant actif
        const activeKid = kids.find(kid => kid.is_active === 1); // Vérifiez ici
        resolve(activeKid); // Renvoyer l'enfant actif ou undefined
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des enfants:', error);
        reject(error);
      });
  });
}

function startTimer(domain) {
  stopTimer(); // Arrête le timer précédent s'il existe
  
  currentDomain = domain;
  if (!timeSpent[domain]) {
    timeSpent[domain] = 0;
  }

  currentInterval = setInterval(() => {
    timeSpent[domain] += 1; // Incrémentez le temps en secondes
    saveTimeSpent();
    updateContentScript();

    if (timeSpent[domain] >= currentMaxTime) {
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
    const remainingTime = Math.max(0, currentMaxTime - timeSpent[currentDomain]);
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateTimer",
          remainingTime: remainingTime,
          kidId: currentKidId // Envoyer l'ID de l'enfant actif
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("Impossible de mettre à jour le timer : ", chrome.runtime.lastError.message);
          }
        });
      }
    });
  }
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