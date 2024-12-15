document.addEventListener("DOMContentLoaded", () => {
    const emailListTextarea = document.getElementById("emailList");
    const saveButton = document.getElementById("saveSettings");
  
    // Load saved email list
    chrome.storage.local.get({ trackedEmails: [] }, (result) => {
      emailListTextarea.value = result.trackedEmails.join("\n");
    });
  
    // Save email list
    saveButton.addEventListener("click", () => {
      const emails = emailListTextarea.value
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email !== "");
      chrome.storage.local.set({ trackedEmails: emails }, () => {
        alert("Settings saved!");
      });
    });
  });
  