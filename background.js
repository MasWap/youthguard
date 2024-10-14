let timeSpent = {};
let MAX_TIME = 60 * 60 * 1000; // 1 heure en millisecondes

chrome.webNavigation.onCompleted.addListener((details) => {
  const url = new URL(details.url);
  const domain = url.hostname;
  
  if (["www.facebook.com", "www.instagram.com", "www.tiktok.com"].includes(domain)) {
    if (!timeSpent[domain]) {
      timeSpent[domain] = 0;
    }

    const interval = setInterval(() => {
      timeSpent[domain] += 1000;

      if (timeSpent[domain] >= MAX_TIME) {
        chrome.tabs.update(details.tabId, {url: "blocked.html"});
        clearInterval(interval);
      }
    }, 1000);
  }
});
