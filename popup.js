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

function updateTimeDisplay() {
  chrome.storage.local.get(['timeSpent'], (result) => {
    if (result.timeSpent) {
      const totalTime = Object.values(result.timeSpent).reduce((a, b) => a + b, 0);
      const remainingTime = MAX_TIME - totalTime;
      document.getElementById('timeRemaining').textContent = formatTime(Math.max(0, remainingTime / 1000));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
});

chrome.runtime.sendMessage({action: "getTime"}, (response) => {
  if (response && response.timeSpent) {
    updateTimeDisplay(response.timeSpent);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTime") {
    updateTimeDisplay(request.timeSpent);
  }
});

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

function updateUIBasedOnLoginStatus(isLoggedIn) {
  console.log('Updating UI, isLoggedIn:', isLoggedIn);
  const timeRemainingElement = document.getElementById('timeRemaining');
  const timeRemainingLabel = document.getElementById('timeRemainingLabel');
  const loginPrompt = document.getElementById('loginPrompt');
  const idCardUploadElement = document.getElementById('idCardUpload');
  const birthDateElement = document.getElementById('birthDate');
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  const logoutButton = document.getElementById('logoutButton');
  const showUsersButton = document.getElementById('showUsersButton');
  const userListElement = document.getElementById('userList');

  if (isLoggedIn) {
    timeRemainingElement.style.display = 'block';
    timeRemainingLabel.style.display = 'block';
    loginPrompt.style.display = 'none';
    idCardUploadElement.style.display = 'block';
    birthDateElement.style.display = 'block';
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
    logoutButton.style.display = 'block';
    showUsersButton.style.display = 'block';
  } else {
    timeRemainingElement.style.display = 'none';
    timeRemainingLabel.style.display = 'none';
    loginPrompt.style.display = 'block';
    idCardUploadElement.style.display = 'none';
    birthDateElement.style.display = 'none';
    loginButton.style.display = 'block';
    registerButton.style.display = 'block';
    logoutButton.style.display = 'none';
    showUsersButton.style.display = 'none';
    userListElement.style.display = 'none';
    userListElement.innerHTML = '';
  }
}

document.getElementById('loginButton').addEventListener('click', async () => {
  const username = prompt("Enter your username:");
  const password = prompt("Enter your password:");

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('loginStatus').textContent = "Logged in as " + data.user.username;
      chrome.storage.local.set({ isLoggedIn: true, username: data.user.username });
      updateUIBasedOnLoginStatus(true);
    } else {
      document.getElementById('loginStatus').textContent = "Login failed: " + data.message;
      chrome.storage.local.set({ isLoggedIn: false, username: null });
      updateUIBasedOnLoginStatus(false);
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('loginStatus').textContent = "Login failed: Server error";
    chrome.storage.local.set({ isLoggedIn: false, username: null });
    updateUIBasedOnLoginStatus(false);
  }
});

document.getElementById('registerButton').addEventListener('click', async () => {
  const username = prompt("Enter your username:");
  const password = prompt("Enter your password:");

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('loginStatus').textContent = "Inscrit et enregistré en tant que " + data.user.username;
      chrome.storage.local.set({ isLoggedIn: true, username: data.user.username });
      updateUIBasedOnLoginStatus(true);
    } else {
      if (response.status === 409) {
        document.getElementById('loginStatus').textContent = "Erreur d'inscription: Utilisateur déjà existant";
      } else {
        document.getElementById('loginStatus').textContent = "Registration failed: " + data.message;
      }
      chrome.storage.local.set({ isLoggedIn: false, username: null });
      updateUIBasedOnLoginStatus(false);
    }
  } catch (error) {
    console.error('Register error:', error);
    document.getElementById('loginStatus').textContent = "Registration failed: Server error";
    chrome.storage.local.set({ isLoggedIn: false, username: null });
    updateUIBasedOnLoginStatus(false);
  }
});

// Bouton de déconnexion (Logout)
function logout() {
  console.log('Logout function called');
  fetch('http://localhost:3000/logout', { method: 'POST' })
    .then(() => {
      console.log('Logout successful');
      document.getElementById('loginStatus').textContent = "Logged out";
      document.getElementById('userList').innerHTML = '';
      chrome.storage.local.set({ isLoggedIn: false, username: null }, () => {
        console.log('Chrome storage updated');
        updateUIBasedOnLoginStatus(false);
      });
    })
    .catch(error => console.error('Logout error:', error));
}

// Fonction pour afficher la liste des utilisateurs
async function displayUsers() {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';
    userListElement.style.display = 'block'; // Assurez-vous que la liste est visible
    users.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'user-item';
      userElement.innerHTML = `
        ${user.username}
        <button class="delete-user" data-id="${user.id}">Supprimer</button>
      `;
      userListElement.appendChild(userElement);
    });
    // Ajouter des écouteurs d'événements pour les boutons de suppression
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', deleteUser);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    document.getElementById('userList').innerHTML = 'Error fetching users. Please try again.';
  }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(event) {
  const userId = event.target.getAttribute('data-id');
  const username = event.target.parentElement.textContent.trim().split('Supprimer')[0].trim();
  
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      event.target.parentElement.remove();
      
      // Vérifier si l'utilisateur supprimé est l'utilisateur connecté
      const result = await new Promise(resolve => chrome.storage.local.get(['username'], resolve));
      console.log('Current user:', result.username);
      console.log('Deleted user:', username);
      if (result.username === username) {
        console.log('User deleted themselves, logging out');
        logout();
      }
    } else {
      console.error('Failed to delete user:', data.message);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Ajouter un écouteur d'événements pour le bouton d'affichage des utilisateurs
document.getElementById('showUsersButton').addEventListener('click', displayUsers);
document.getElementById('logoutButton').addEventListener('click', logout);

// Vérification de l'état de connexion lors de l'ouverture du popup
chrome.storage.local.get(['isLoggedIn', 'username'], (result) => {
  if (result.isLoggedIn) {
    document.getElementById('loginStatus').textContent = "Logged in as " + result.username;
    updateUIBasedOnLoginStatus(true);
  } else {
    document.getElementById('loginStatus').textContent = "Not logged in";
    updateUIBasedOnLoginStatus(false);
  }
});