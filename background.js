chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logEmail") {
        // Retrieve stored logs or initialize an empty array
        chrome.storage.local.get({ emailLogs: [] }, (result) => {
            const logs = result.emailLogs;
            logs.push(message.data);

            // Update storage with the new log
            chrome.storage.local.set({ emailLogs: logs }, () => {
                console.log("Email logged:", message.data);
            });
        });
    }
});
