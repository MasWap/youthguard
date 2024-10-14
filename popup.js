function initTesseract() {
  if (typeof Tesseract !== 'undefined') {
    tesseractLoaded = true;
    console.log('Tesseract loaded successfully');
  } else {
    console.error('Tesseract not loaded');
  }
}

document.addEventListener('DOMContentLoaded', initTesseract);

chrome.storage.local.get(['timeSpent'], (result) => {
  const remainingTime = 3600 - (result.timeSpent || 0);
  document.getElementById('timeRemaining').textContent = formatTime(remainingTime);
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes} minutes ${sec} seconds`;
}

document.getElementById('idCardUpload').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (!tesseractLoaded) {
        console.error('Tesseract not loaded yet');
        return;
      }
      Tesseract.recognize(
        e.target.result,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        // Recherche d'une date dans le texte extrait
        const dateMatch = text.match(/\d{2}[/-]\d{2}[/-]\d{4}/);
        if (dateMatch) {
          document.getElementById('birthDate').textContent = `Birth date: ${dateMatch[0]}`;
        } else {
          document.getElementById('birthDate').textContent = 'No birth date found';
        }
      }).catch(error => {
        console.error('Tesseract error:', error);
      });
    };
    reader.readAsDataURL(file);
  }
});

// Fonction pour extraire la date de naissance à partir du texte reconnu
function extractBirthDate(text) {
  const match = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/); // Format DD/MM/YYYY
  return match ? match[0] : "Date not found";
}

function updateUIBasedOnLoginStatus(isLoggedIn) {
  const timeRemainingElement = document.getElementById('timeRemaining');
  const idCardUploadElement = document.getElementById('idCardUpload');
  const birthDateElement = document.getElementById('birthDate');

  if (isLoggedIn) {
    timeRemainingElement.style.display = 'block';
    idCardUploadElement.style.display = 'block';
    birthDateElement.style.display = 'block';
  } else {
    timeRemainingElement.style.display = 'none';
    idCardUploadElement.style.display = 'none';
    birthDateElement.style.display = 'none';
  }
}

document.getElementById('loginButton').addEventListener('click', async () => {
  const username = prompt("Enter your username:");
  const password = prompt("Enter your password:");

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

// Check login status when popup opens
chrome.storage.local.get(['isLoggedIn', 'username'], (result) => {
  if (result.isLoggedIn) {
    document.getElementById('loginStatus').textContent = "Logged in as " + result.username;
    updateUIBasedOnLoginStatus(true);
  } else {
    document.getElementById('loginStatus').textContent = "Not logged in";
    updateUIBasedOnLoginStatus(false);
  }
});
