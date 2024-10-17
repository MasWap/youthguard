document.addEventListener('DOMContentLoaded', function() {
  // Gère le retour à la page d'accueil
  fetchTags();
  document.getElementById('backToHome').addEventListener('click', function() {
    window.location.href = "home.html";
  });

  // Gère la suppression du profil
  document.getElementById('deleteProfile').addEventListener('click', async function() {
    const selectedProfileName = document.getElementById('profileName').textContent; // Récupérer le nom du profil affiché
    const kidId = new URLSearchParams(window.location.search).get('id'); // Récupérer l'ID de l'enfant

    if (confirm(`Voulez-vous vraiment supprimer le profil ${selectedProfileName} ?`)) {
      try {
        const response = await fetch(`http://localhost:3000/kids/${kidId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          window.location.href = "login.html";
        } else {
          alert("Erreur lors de la suppression de l'enfant.");
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'enfant:', error);
      }
    }
  });

  // Gère la sauvegarde des modifications du profil
  document.getElementById('saveProfile').addEventListener('click', async function() {
    const username = document.getElementById('username').value; // Récupérer le nom d'utilisateur
    const dob = document.getElementById('dob').value; // Date de naissance
    const maxTimeInput = document.getElementById('maxTimeInput').value; // Récupérer le temps maximum
  
    // Convertir le temps maximum en secondes
    const [hours, minutes] = maxTimeInput.split(':').map(Number);
    const maxTimeInSeconds = (hours * 3600) + (minutes * 60); // Convertir en secondes
  
    // Récupérer les tags sélectionnés
    const selectedTags = Array.from(document.querySelectorAll('#tagList input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);
  
    // Récupérer l'ID de l'enfant
    const kidId = new URLSearchParams(window.location.search).get('id');
  
    // Appeler la route pour activer l'enfant
    await activateKid(kidId);
  
    // Mettre à jour les tags associés à l'enfant
    await updateKidTags(kidId, selectedTags);
  
    // Mettre à jour les détails de l'enfant
    await updateKidDetails(kidId, username, dob, maxTimeInSeconds); // Passer maxTimeInSeconds à la fonction
  
    // Rediriger vers la page d'accueil
    window.location.href = "login.html"; // Remplacez par le chemin correct vers votre page d'accueil
  });
  
  // Fonction pour activer un enfant
  async function activateKid(kidId) {
    try {
      const response = await fetch(`http://localhost:3000/kids/${kidId}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (!data.success) {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'enfant:', error);
    }
  }

  // Récupérer et afficher les détails de l'enfant
  const kidId = new URLSearchParams(window.location.search).get('id'); // Récupérer l'ID de l'enfant depuis l'URL
  if (kidId) {
    fetchKidDetails(kidId);
  }
});

// Fonction pour récupérer les détails d'un enfant depuis l'API
async function fetchKidDetails(kidId) {
  try {
    const response = await fetch(`http://localhost:3000/kids/${kidId}`); // Remplacez par l'URL de votre API
    const kid = await response.json();
    displayKidDetails(kid);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'enfant:', error);
  }
}

// Fonction pour mettre à jour les détails de l'enfant
async function updateKidDetails(kidId, username, dob, maxTimeInSeconds) {
  try {
    await fetch(`http://localhost:3000/kids/${kidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username, // Inclure le nom d'utilisateur
        birth_date: dob,
        max_time: maxTimeInSeconds, // Passer max_time en secondes
        is_active: true // Vous pouvez ajuster cela selon vos besoins
      }),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des détails de l\'enfant:', error);
  }
}

async function fetchTags() {
  try {
    const response = await fetch('http://localhost:3000/tags'); // Remplacez par l'URL de votre API
    const tags = await response.json();
    populateTagList(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
  }
}

// Fonction pour remplir la liste avec des checkboxes
function populateTagList(tags) {
  const tagList = document.getElementById('tagList');
  tagList.innerHTML = ''; // Vider la liste avant d'ajouter les tags

  tags.forEach(tag => {
    const label = document.createElement('label');
    label.textContent = tag.libelle; // Afficher le libellé du tag

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = tag.id; // Assurez-vous que l'ID du tag est utilisé
    checkbox.id = `tag-${tag.id}`; // ID unique pour chaque checkbox

    label.prepend(checkbox); // Ajouter la checkbox avant le texte

    // Appliquer un style pour que les labels s'affichent en ligne
    label.style.cssText = `
      display: inline-block;
      margin-right: 10px; /* Espacement entre les checkboxes */
      font-size: 14px; /* Ajuster la taille de la police si nécessaire */
    `;

    tagList.appendChild(label); // Ajouter le label (et la checkbox) à la liste
  });
}

// Fonction pour afficher les détails de l'enfant sur la page
function displayKidDetails(kid) {
  const profileNameElement = document.getElementById('profileName');
  profileNameElement.textContent = kid.username; // Afficher le nom de l'enfant

  // Vérifier si kid.birth_date est valide
  if (kid.birth_date) {
    const birthDate = new Date(kid.birth_date); // Utiliser directement kid.birth_date
    birthDate.setDate(birthDate.getDate() + 1); // Ajouter 1 jour pour compenser le décalage
    const formattedDate = birthDate.toISOString().split('T')[0]; // Obtenir la partie date au format 'yyyy-MM-dd'
    
    document.getElementById('dob').value = formattedDate; // Date de naissance
  } else {
    console.error('Aucune date de naissance fournie');
    document.getElementById('dob').value = ''; // Réinitialiser si aucune date n'est fournie
  }

  document.getElementById('isActive').textContent = kid.is_active ? 'Actif' : 'Inactif'; // Statut

  // Pré-remplir le champ username
  document.getElementById('username').value = kid.username; // Remplir le champ username

  // Convertir max_time (en secondes) en heures et minutes
  const maxTimeInSeconds = kid.max_time; // Récupérer max_time
  const hours = Math.floor(maxTimeInSeconds / 3600); // Calculer les heures
  const minutes = Math.floor((maxTimeInSeconds % 3600) / 60); // Calculer les minutes

  // Formater le temps pour l'affichage
  const formattedMaxTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; // Format HH:MM
  document.getElementById('maxTimeInput').value = formattedMaxTime; // Remplir le champ max_time

  // Cocher les tags associés à l'enfant
  const bannedTags = kid.tag_ids ? kid.tag_ids.split(',') : []; // Convertir en tableau
  bannedTags.forEach(tagId => {
    const checkbox = document.getElementById(`tag-${tagId.trim()}`);
    if (checkbox) {
      checkbox.checked = true; // Cocher la checkbox si le tag est associé
    }
  });
}

// Fonction pour mettre à jour les tags associés à l'enfant
async function updateKidTags(kidId, tagIds) {
  try {
    await fetch(`http://localhost:3000/kids/${kidId}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagIds }),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des tags:', error);
  }
}