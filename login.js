let tesseractLoaded = false;
let MAX_TIME = 60 * 60 * 1000; // 1 heure en millisecondes

function initTesseract() {
  if (typeof Tesseract !== 'undefined') {
    tesseractLoaded = true;
    console.log('Tesseract loaded successfully');
  } else {
    console.error('Tesseract not loaded');
  }
}

document.addEventListener('DOMContentLoaded', initTesseract);

function resetPopupState() {
  chrome.storage.local.set({ popupOpen: false });
}

window.addEventListener('unload', resetPopupState);

async function checkCanRegister() {
  try {
    const response = await fetch('http://localhost:3000/can-register');
    const data = await response.json();
    return data.canRegister;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
}

function updateUIBasedOnLoginStatus(isLoggedIn) {
  const loginForm = document.getElementById('loginForm');
  const registerButtonContainer = document.getElementById('registerButtonContainer');
  const loginStatus = document.getElementById('loginStatus');

  if (isLoggedIn) {
    loginForm.style.display = 'none';
    // Rediriger vers la page d'accueil ou afficher les options d'administrateur
    window.location.href = "home.html";
  } else {
    loginForm.style.display = 'block';
    
    // Vérifier si l'inscription est possible
    checkCanRegister().then(canRegister => {
      registerButtonContainer.style.display = canRegister ? 'block' : 'none';
    });
  }
}

async function getUsername() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['username'], (result) => {
      resolve(result.username || '');
    });
  });
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert("Veuillez entrer un nom d'utilisateur et un mot de passe.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      chrome.storage.local.set({ isLoggedIn: true, username: data.user.username }, () => {
        updateUIBasedOnLoginStatus(true);
      });
    } else {
      document.getElementById('loginStatus').textContent = "Échec de la connexion : Identifiants incorrects";
      updateUIBasedOnLoginStatus(false);
    }
  } catch (error) {
    console.error('Erreur de connexion :', error);
    document.getElementById('loginStatus').textContent = "Échec de la connexion : Erreur serveur";
    updateUIBasedOnLoginStatus(false);
  }
});

document.getElementById('registerButton').addEventListener('click', function() {
  window.location.href = 'register.html';  // Redirige vers la page d'inscription
});

// Vérification de l'état de connexion lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['isLoggedIn', 'popupOpen'], (result) => {
    chrome.storage.local.set({ popupOpen: true });
    if (result.popupOpen === false) {
      // La popup a été fermée, on réinitialise l'état de connexion
      chrome.storage.local.set({ isLoggedIn: false });
      updateUIBasedOnLoginStatus(false);
    } else {
      // La popup était déjà ouverte, on conserve l'état de connexion
      updateUIBasedOnLoginStatus(result.isLoggedIn);
    }
  });
});