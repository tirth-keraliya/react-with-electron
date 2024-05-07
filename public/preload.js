// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose functions to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  openLink: (url) => ipcRenderer.send("open-link", url),
});

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,
  getFCMToken: (channel, func) => {
    ipcRenderer.once(channel, func);
    ipcRenderer.send("getFCMToken");
  },
});

// Start FCM service with your sender ID
const senderId = "546843854180"; // Replace with your FCM sender ID
ipcRenderer.send("PUSH_RECEIVER:::START_NOTIFICATION_SERVICE", senderId);

// Handle the start of the notification service
ipcRenderer.on("PUSH_RECEIVER:::NOTIFICATION_SERVICE_STARTED", (_, token) => {
  ipcRenderer.send("storeFCMToken", token);
});

// Handle incoming notifications and extract key information
ipcRenderer.on("PUSH_RECEIVER:::NOTIFICATION_RECEIVED", (_, notification) => {
  // Log the full notification content for debugging
  console.log("Full Notification Content:", JSON.stringify(notification));

  // Send a local notification with extracted information
  ipcRenderer.send("send-notification", notification);
});

// Handle token updates
ipcRenderer.on("PUSH_RECEIVER:::TOKEN_UPDATED", (_, token) => {
  ipcRenderer.send("storeFCMToken", token);
});
