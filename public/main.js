// main.js (Main Process)
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const createWindow = async () => {
  const { default: isDev } = await import("electron-is-dev");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // This should be true
      nodeIntegration: false, // This should be false
      preload: path.join(__dirname, "preload.js"), // This will be useful for inter-process communication
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
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
