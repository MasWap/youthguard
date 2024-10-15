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

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

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
  console.log('Updating UI, isLoggedIn:', isLoggedIn);
  const loginForm = document.getElementById('loginForm');
  const logoutButton = document.getElementById('logoutButton');
  const showUsersButton = document.getElementById('showUsersButton');
  const userListElement = document.getElementById('userList');
  const registerButton = document.getElementById('registerButton');

  if (isLoggedIn) {
    loginForm.style.display = 'none';
    logoutButton.style.display = 'block';
    showUsersButton.style.display = 'block';
    document.getElementById('loginStatus').textContent = "Connecté en tant que " + getUsername();
  } else {
    loginForm.style.display = 'block';
    logoutButton.style.display = 'none';
    showUsersButton.style.display = 'none';
    userListElement.style.display = 'none';
    userListElement.innerHTML = '';
    document.getElementById('loginStatus').textContent = "Non connecté";
    
    // Vérifier si l'inscription est possible
    checkCanRegister().then(canRegister => {
      registerButton.style.display = canRegister ? 'inline-block' : 'none';
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

document.getElementById('loginButton').addEventListener('click', async () => {
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
      document.getElementById('loginStatus').textContent = "Échec de la connexion : " + data.message;
      updateUIBasedOnLoginStatus(false);
    }
  } catch (error) {
    console.error('Erreur de connexion :', error);
    document.getElementById('loginStatus').textContent = "Échec de la connexion : Erreur serveur";
    updateUIBasedOnLoginStatus(false);
  }
});

document.getElementById('registerButton').addEventListener('click', async () => {
  const canRegister = await checkCanRegister();
  if (!canRegister) {
    alert("L'enregistrement est fermé. Un seul compte est autorisé.");
    return;
  }

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
      } else if (response.status === 403) {
        document.getElementById('loginStatus').textContent = "Erreur d'inscription: L'enregistrement est fermé";
      } else {
        document.getElementById('loginStatus').textContent = "Erreur d'inscription: " + data.message;
      }
      chrome.storage.local.set({ isLoggedIn: false, username: null });
      updateUIBasedOnLoginStatus(false);
    }
  } catch (error) {
    console.error('Register error:', error);
    document.getElementById('loginStatus').textContent = "Erreur d'inscription: Erreur serveur";
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
      chrome.storage.local.set({ isLoggedIn: false, username: null }, () => {
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