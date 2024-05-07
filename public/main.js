const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  Notification,
} = require("electron");
const path = require("path");
const { setup: setupPushReceiver } = require("electron-push-receiver");
const log = require("electron-log");
let appIcon = path.join(__dirname, "images", "icon.ico");
// Function to create the Electron window

var iconPath = path.join(__dirname, "images", "icon.ico");
if (process.platform === "darwin") {
  iconPath = path.join(__dirname, "images", "icon.icns");
}
const createWindow = async () => {
  const { default: isDev } = await import("electron-is-dev"); // Use dynamic import for ESM compatibility
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  const appUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;
  mainWindow.loadURL(appUrl);

  setupPushReceiver(mainWindow.webContents); // Set up push receiver for FCM

  app.setAppUserModelId("MrxBet");

  ipcMain.on("send-notification", (event, arg) => {
    const notification = new Notification({
      title: arg?.notification.title,
      body: arg?.notification.body,
      data: arg.data,
      silent: false,
      requireInteraction: true,
      // timestamp: data.timestamp,
      timeoutType: "default",
      type: "info",
      sound: "Default",
      icon: appIcon,
    });
    log.log("send-notification");
    log.info("notification");
    log.log(arg);
    log.info(arg);

    notification.show();
  });

  // Handle external links in the Electron app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" }; // Prevents creating new Electron windows/tabs
  });

  return mainWindow;
};

// Function to set up IPC handlers for FCM token management
const setupIPC = async () => {
  const Store = (await import("electron-store")).default; // Dynamic import
  const store = new Store(); // Initialize `electron-store`
  ipcMain.on("storeFCMToken", (event, token) => {
    store.set("fcm_token", token); // Store FCM token in Electron Store
  });

  ipcMain.on("getFCMToken", (event) => {
    const token = store.get("fcm_token"); // Retrieve FCM token from Electron Store
    event.sender.send("getFCMToken", token); // Send token back to the renderer process
  });
};

// Function to set up the Electron app
const setupApp = async () => {
  await app.whenReady(); // Ensure Electron is ready
  await createWindow(); // Create the main Electron window
  setupIPC(); // Set up IPC handlers for communication

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(); // Create a new window if none exist
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit(); // Quit the app except on macOS
    }
  });
};

// Call setupApp to start the Electron app
setupApp();
