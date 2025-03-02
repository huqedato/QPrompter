const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    transparent: true,
    resizable: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
    },
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.zoomFactor = 1.0;
  });
  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle file open
ipcMain.handle("open-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  if (!canceled) {
    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, "utf-8");
    return { filePath, content };
  }
  return null;
});

// Handle file save
ipcMain.handle("save-file", async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: "untitled.txt",
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });
  if (!canceled) {
    fs.writeFileSync(filePath, content);
    return filePath;
  }
  return null;
});

// Handle app quit
ipcMain.on("app-quit", () => {
  app.quit();
});
