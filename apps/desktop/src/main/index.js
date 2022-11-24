const { app, BrowserWindow } = require('electron');
const path = require("path");
const isDev = require('electron-is-dev');

const { waitFor } = require("./utils/time");

const RELOAD_TIME = 2000;
const MAX_RETRY_COUNT = 5;

async function loadApp(window) {
  const appUrl = isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../../dist/index.html")}`;

  const loadWindowUrl = () => window.loadURL(
    appUrl    
  );

  let currentRetryCount = 0;
  while(currentRetryCount <= MAX_RETRY_COUNT) {
    try {
      await loadWindowUrl();
      return true;
    } catch (e) {
      ++currentRetryCount;
      await waitFor(RELOAD_TIME);
    }
  }

  // If the app failed to load after max retries, throw error.
  throw new Error(`Could not load the app. URL: ${appUrl} .`);
}

function createWindow () {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  loadApp(mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.maximize();
  mainWindow.show();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
