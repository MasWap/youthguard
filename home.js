console.log("Le script home.js est chargé.");

// Affichage de la modale pour ajouter un profil
const modal = document.getElementById('profileModal');
const addProfileBtn = document.getElementById('addProfile');
const closeBtn = document.querySelector('.close-btn');
const saveProfileBtn = document.getElementById('saveProfile');
const cancelProfileBtn = document.getElementById('cancelProfile');
const newProfileInput = document.getElementById('newProfileName');

addProfileBtn.addEventListener('click', function() {
  modal.style.display = 'block';
  
});

  
closeBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});

cancelProfileBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});

// Ajouter le nouveau profil à la liste
saveProfileBtn.addEventListener('click', function() {
  const newProfileName = newProfileInput.value.trim();

  if (newProfileName !== "") {
    const profileList = document.querySelector('.profile-list');
    const newProfileItem = document.createElement('li');
    newProfileItem.classList.add('profile-item');
    newProfileItem.innerHTML = `
      <span>${newProfileName}</span>
      <label class="switch">
        <input type="checkbox" class="profile-switch">
        <span class="slider round"></span>
      </label>
      <span class="arrow">&#9654;</span>
    `;

    // Ajouter un événement pour rediriger vers les détails du nouveau profil
    newProfileItem.addEventListener('click', function() {
      window.location.href = "profile-detail.html";  // Rediriger vers les détails du profil
    });

    profileList.appendChild(newProfileItem);  // Ajouter à la liste
    modal.style.display = 'none';  // Fermer la modale
    newProfileInput.value = '';  // Réinitialiser le champ
  } else {
    alert("Veuillez entrer un nom de profil.");
  }
});

// Fermer la modale si on clique en dehors de la boîte modale
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// Rediriger vers la page des détails du profil uniquement lorsque le nom ou la flèche est cliqué
const profileItems = document.querySelectorAll('.profile-item');
profileItems.forEach(item => {
  const nameElement = item.querySelector('span:first-child');
  const arrowElement = item.querySelector('.arrow');

  // Si on clique sur le nom ou la flèche, on va vers les détails du profil
  nameElement.addEventListener('click', function() {
    window.location.href = "profile-detail.html";
  });

  arrowElement.addEventListener('click', function() {
    window.location.href = "profile-detail.html";
  });
});

// Gérer l'activation unique des profils avec les switches sans rediriger
const profileSwitches = document.querySelectorAll('.profile-switch');
profileSwitches.forEach(switchElement => {
  switchElement.addEventListener('change', function(event) {
    event.stopPropagation();  // Empêcher la propagation de l'événement vers le parent
    if (this.checked) {
      // Désactiver tous les autres switches
      profileSwitches.forEach(otherSwitch => {
        if (otherSwitch !== this) {
          otherSwitch.checked = false;
        }
      });
    }
  });
});

