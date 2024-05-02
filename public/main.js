// main.js (Main Process)
const {
  ipcMain,
  Notification,
  app,
  BrowserWindow,
  shell,
} = require("electron");
const path = require("path");
const log = require("electron-log");
const pushReceiver = require("electron-push-receiver");

// Replace with your OneSignal App ID and REST API key
const oneSignalAppId = "606da364-5f95-426a-a279-27b9c5d7717d";
const oneSignalRestApiKey = "ZDMwYWQ2NjEtZThjYy00NWY2LWJkZDktMWZhZGUyMmU1ZmRk";

const createWindow = async () => {
  log.info("App starting...");
  const { default: isDev } = await import("electron-is-dev");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      protocol: "file",
      slashes: true,
      contextIsolation: true, // This should be true
      nodeIntegration: false, // This should be false
      // preload: path.join(__dirname, "preload.js"), // This will be useful for inter-process communication
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open links in the system default browser when they are clicked in the Electron app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" }; // Prevent the Electron window from opening a new tab
  });
  //   mainWindow.setMenuBarVisibility(false);
};

function handlePushNotification(data) {
  // Parse notification data and create a custom notification
  const title = data.title;
  const body = data.body;
  const notification = new Notification({ title, body });
  notification.show();
}

app.whenReady().then(() => {
  log.info("app whenReady");
  createWindow();
  log.info("app LOADED");

  // Initialize electron-push-receiver
  pushReceiver.init({ projectNumber: "546843854180" });
  // Handle FCM token retrieval
  pushReceiver.on("token", (token) => {
    // Send FCM token to OneSignal using REST API
    fetch(`https://onesignal.com/api/v1/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${oneSignalAppId}:${oneSignalRestApiKey}`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        headings: { en: "Notification Title" }, // Placeholder title
        contents: { en: "Notification Body" }, // Placeholder body
        data: { message: data }, // Pass notification data
        include_player_ids: [token], // Include retrieved FCM token
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        log.info("OneSignal notification sent:");
      })
      .catch((error) => {
        log.info("Error sending OneSignal notification:");
      });
  });

  // Handle incoming push notifications
  pushReceiver.on("notification", handlePushNotification);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
