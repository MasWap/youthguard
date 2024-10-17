document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const email = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  // Récupérer l'adresse IP publique
  const ipAddress = await getPublicIP();
  if (!ipAddress) {
      alert("Impossible de récupérer l'adresse IP publique.");
      return;
  }

  // Vérifiez si l'inscription est possible
  const canRegister = await checkCanRegister(ipAddress);
  if (!canRegister) {
      alert("L'enregistrement est fermé pour cette adresse IP.");
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password: password, ip: ipAddress }),
      });

      const data = await response.json();

      if (data.success) {
          window.location.href = "home.html";
      } else {
          alert("Erreur d'inscription : " + data.message);
      }
  } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      alert("Erreur serveur lors de l'inscription");
  }
});

async function getPublicIP() {
  try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip; // Retourne l'adresse IP
  } catch (error) {
      console.error('Erreur lors de la récupération de l\'IP publique :', error);
      return null;
  }
}

// Fonction pour vérifier si l'enregistrement est possible
async function checkCanRegister(ipAddress) {
  try {
      const response = await fetch(`http://localhost:3000/can-register?ip=${ipAddress}`);
      const data = await response.json();
      return data.canRegister;
  } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
  }
}
