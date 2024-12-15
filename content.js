// Helper function to check if a value looks like an email
function isEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
}

// Function to detect input changes and log potential email entries
function trackInput(event) {
    const input = event.target;

    // Skip non-input elements
    if (input.tagName !== "INPUT" && input.tagName !== "TEXTAREA") return;

    // Check if the value looks like an email
    const value = input.value;
    if (isEmail(value)) {
        const sourceUrl = window.location.href;

        // Retrieve tracked emails from storage
        chrome.storage.local.get({ trackedEmails: [] }, (result) => {
            const trackedEmails = result.trackedEmails;

            // If no specific emails are set, monitor all
            if (trackedEmails.length === 0 || trackedEmails.includes(value)) {
                const logEntry = {
                    action: "typed",
                    email: value,
                    sourceUrl,
                    timestamp: new Date().toISOString(),
                };

                // Send data to background script for storage
                chrome.runtime.sendMessage({ action: "logEmail", data: logEntry });
            }
        });
    }
}

// Function to detect form submissions and check for email-like values
function trackFormSubmission(event) {
    const form = event.target;

    // Search for potential email inputs within the form
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
        const value = input.value;
        if (isEmail(value)) {
            const sourceUrl = window.location.href;

            // Retrieve tracked emails from storage
            chrome.storage.local.get({ trackedEmails: [] }, (result) => {
                const trackedEmails = result.trackedEmails;

                // If no specific emails are set, monitor all
                if (trackedEmails.length === 0 || trackedEmails.includes(value)) {
                    const logEntry = {
                        action: "submitted",
                        email: value,
                        sourceUrl,
                        timestamp: new Date().toISOString(),
                    };

                    // Send data to background script for storage
                    chrome.runtime.sendMessage({ action: "logEmail", data: logEntry });
                }
            });
        }
    });
}

// Attach event listeners to detect inputs and submissions
document.addEventListener("input", trackInput, true);
document.addEventListener("submit", trackFormSubmission, true);
