function checkLoginStatus() {
  chrome.storage.local.get(['isLoggedIn', 'username'], (result) => {
    if (!result.isLoggedIn) {
      window.location.href = 'login.html'; // Rediriger vers la page de connexion si non connecté
    } else {
      console.log(`Connecté en tant que ${result.username}`);
    }
  });
  fetchTags();
}

// Affichage de la modale pour ajouter un enfant
const kidModal = document.getElementById('kidModal');
const addKidBtn = document.getElementById('addKid');
const closeKidBtn = document.querySelector('.close-kid-btn');
const saveKidBtn = document.getElementById('saveKid');
const cancelKidBtn = document.getElementById('cancelKid');
const newKidInput = document.getElementById('newKidName');

addKidBtn.addEventListener('click', function() {
  kidModal.style.display = 'block';
});

closeKidBtn.addEventListener('click', function() {
  kidModal.style.display = 'none';
});

cancelKidBtn.addEventListener('click', function() {
  kidModal.style.display = 'none';
});

async function loginUser(username, password) {
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      // Stocker l'UUID dans le local storage
      localStorage.setItem('uuid', data.token); // Remplacez l'ancien UUID par le nouveau
      console.log(`Connecté en tant que ${data.user.username} avec UUID: ${data.token}`);
      window.location.href = 'home.html'; // Rediriger vers la page d'accueil
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
  }
}

// Ajouter le nouvel enfant à la liste
saveKidBtn.addEventListener('click', async function() {
  const newKidName = newKidInput.value.trim();

  if (newKidName !== "") {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('http://localhost:3000/kids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newKidName,
          birth_date: today, // Valeur par défaut pour la date de naissance
          is_active: false, // Valeur par défaut pour le statut
          max_time: 3600 // Valeur par défaut pour le temps de visionnage (1 heure)
        }),
      });

      if (response.ok) {
        const kid = await response.json();
        displayKids([kid]); // Afficher le nouvel enfant
        kidModal.style.display = 'none'; // Fermer la modale
        newKidInput.value = ''; // Réinitialiser le champ

        window.location.href = 'login.html';
      } else {
        alert("Erreur lors de l'ajout de l'enfant.");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'enfant:', error);
    }
  } else {
    alert("Veuillez entrer un nom d'enfant.");
  }
});

// Fonction pour récupérer et afficher les enfants
async function fetchKids() {
  try {
    const response = await fetch('http://localhost:3000/kids'); // Remplacez par l'URL de votre API
    const kids = await response.json();
    displayKids(kids);
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
  }
}

// Fonction pour afficher les enfants sur la page
function displayKids(kids) {
  const profileList = document.querySelector('.profile-list');
  profileList.innerHTML = ''; // Vider la liste avant d'ajouter les enfants

  kids.forEach(kid => {
    const kidItem = document.createElement('li');
    kidItem.classList.add('profile-item');
    kidItem.innerHTML = `
      <span>${kid.username} (${kid.is_active ? 'Actif' : 'Inactif'})</span>
      <label class="switch">
        <input type="checkbox" class="profile-switch" data-id="${kid.id}" ${kid.is_active ? 'checked' : ''}>
        <span class="slider round"></span>
      </label>
      <span class="arrow" style="cursor: pointer;">&#9654;</span> <!-- Flèche cliquable -->
    `;

    // Ajouter un événement pour rediriger vers les détails de l'enfant uniquement sur la flèche
    const arrow = kidItem.querySelector('.arrow');
    arrow.addEventListener('click', function(event) {
      event.stopPropagation(); // Empêche la propagation de l'événement au parent
      window.location.href = `profile-detail.html?id=${kid.id}`;  // Rediriger vers les détails de l'enfant
    });

    // Ajouter un événement pour gérer le changement de l'état du switch
    const switchInput = kidItem.querySelector('.profile-switch');
    switchInput.addEventListener('change', async function() {
      const isActive = switchInput.checked; // Vérifier si le switch est activé
      await toggleKidActivation(kid.id, isActive); // Appeler la fonction pour activer/désactiver l'enfant
    });

    profileList.appendChild(kidItem);  // Ajouter à la liste
  });
}

// Fonction pour activer ou désactiver un enfant
async function toggleKidActivation(kidId, isActive) {
  try {
    const uuid = localStorage.getItem('uuid'); // Récupérer l'UUID du local storage
    const response = await fetch(`http://localhost:3000/kids/${kidId}/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uuid, is_active: isActive }), // Envoyer l'UUID et l'état
    });

    const data = await response.json();
    if (!data.success) {
      alert(data.message); // Afficher un message d'erreur si l'activation échoue
    } else {
      // Mettre à jour l'affichage des enfants après l'activation/désactivation
      fetchKids(); // Récupérer à nouveau la liste des enfants pour mettre à jour l'affichage

      // Si l'enfant est activé, envoyer un message au background.js pour démarrer le timer
      if (isActive) {
        chrome.runtime.sendMessage({ action: "startTimer", kidId: kidId });
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'enfant:', error);
  }
}

// Vérification de l'état de connexion lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  fetchKids(); // Récupérer et afficher les enfants
});

async function fetchTags() {
  try {
    const response = await fetch('http://localhost:3000/tags'); // Remplacez par l'URL de votre API
    const tags = await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
  }
}