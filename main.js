// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');

let tray = null;
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

function ready() {
  tray = new Tray('keyboard-icon-dark.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Close', type: 'normal' }
  ]);
  tray.setToolTip('Это мое приложение.');
  tray.setContextMenu(contextMenu);
  tray.addListener('click', () => {
    createWindow()
  });
  createWindow();
}
app.on('ready', ready);

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

