document.addEventListener("DOMContentLoaded", () => {
    const statsTableBody = document.getElementById("stats-body");
    const logsTableBody = document.getElementById("logs-body");
    const noStatsDiv = document.getElementById("no-stats");
    const noLogsDiv = document.getElementById("no-logs");
    const urlPopup = document.getElementById("url-popup");
    const popupUrlSpan = document.getElementById("popup-url");
    const copyUrlBtn = document.getElementById("copy-url-btn");
    const exportButton = document.getElementById("export-logs");
    const deleteButton = document.getElementById("delete-logs");

    let highlightedEmail = null; // Track the currently highlighted email

    // Fetch logs from storage
    chrome.storage.local.get({ emailLogs: [] }, (result) => {
        const logs = result.emailLogs;

        if (!logs || logs.length === 0) {
            noStatsDiv.style.display = "block";
            noLogsDiv.style.display = "block";
            return;
        }

        noStatsDiv.style.display = "none";
        noLogsDiv.style.display = "none";

        // Count email usage
        const emailUsage = {};
        logs.forEach((log) => {
            if (!emailUsage[log.email]) {
                emailUsage[log.email] = 0;
            }
            emailUsage[log.email]++;
        });

        // Populate the statistics table
        Object.keys(emailUsage).forEach((email) => {
            const row = document.createElement("tr");

            const emailCell = document.createElement("td");
            emailCell.textContent = email;
            row.appendChild(emailCell);

            const usageCell = document.createElement("td");
            usageCell.textContent = emailUsage[email];
            row.appendChild(usageCell);

            row.addEventListener("click", () => {
                if (highlightedEmail === email) {
                    // If already highlighted, remove highlights
                    highlightedEmail = null;
                    clearHighlights();
                } else {
                    // Highlight rows for this email
                    highlightedEmail = email;
                    highlightLogsByEmail(email);
                }
            });

            statsTableBody.appendChild(row);
        });

        // Populate the logs table
        logs.forEach((log) => {
            const row = document.createElement("tr");
            row.dataset.email = log.email; // Store email in a custom attribute for filtering

            const actionCell = document.createElement("td");
            actionCell.textContent = log.action || "Unknown";
            row.appendChild(actionCell);

            const emailCell = document.createElement("td");
            emailCell.textContent = log.email || "N/A";
            row.appendChild(emailCell);

            const urlCell = document.createElement("td");
            urlCell.textContent = log.sourceUrl || "Unknown URL";
            urlCell.className = "url-cell";
            row.appendChild(urlCell);

            const timestampCell = document.createElement("td");
            timestampCell.textContent = log.timestamp
                ? new Date(log.timestamp).toLocaleString()
                : "Unknown";
            row.appendChild(timestampCell);

            // Toggle URL popup
            urlCell.addEventListener("click", () => {
                if (urlPopup.style.display === "block" && popupUrlSpan.textContent === log.sourceUrl) {
                    urlPopup.style.display = "none";
                } else {
                    popupUrlSpan.textContent = log.sourceUrl || "Unknown URL";
                    urlPopup.style.display = "block";

                    // Set up copy functionality
                    copyUrlBtn.onclick = () => {
                        navigator.clipboard.writeText(log.sourceUrl || "");
                        alert("URL copied to clipboard!");
                    };
                }
            });

            logsTableBody.appendChild(row);
        });
    });

    // Highlight rows in the logs table by email
    function highlightLogsByEmail(email) {
        // Clear existing highlights
        clearHighlights();

        // Highlight matching rows
        const rows = logsTableBody.querySelectorAll("tr");
        rows.forEach((row) => {
            if (row.dataset.email === email) {
                row.classList.add("highlighted");
            }
        });
    }

    // Clear all highlights from the logs table
    function clearHighlights() {
        const rows = logsTableBody.querySelectorAll(".highlighted");
        rows.forEach((row) => {
            row.classList.remove("highlighted");
        });
    }

    // Export logs as JSON
    exportButton.addEventListener("click", () => {
        chrome.storage.local.get({ emailLogs: [] }, (result) => {
            const logs = result.emailLogs;

            if (logs.length === 0) {
                alert("No logs to export.");
                return;
            }

            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "email_logs.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Delete all logs
    deleteButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all logs?")) {
            chrome.storage.local.set({ emailLogs: [] }, () => {
                alert("All logs deleted.");
                location.reload();
            });
        }
    });
});
