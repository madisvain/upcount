import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

let mainWindow = BrowserWindow | null;
let printerWindow = BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 800,
    width: process.env.NODE_ENV === 'development' ? 1400 : 900,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  printerWindow = new BrowserWindow({
    height: 900,
    width: 900,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  printerWindow.hide();

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8000/#/');
    mainWindow.webContents.openDevTools();
    printerWindow.loadURL('http://localhost:8000/#/');
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
    printerWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Autoupdate
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('updateAvailable');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('updateDownloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// PDF rendering
ipcMain.on('printInvoicePDF', (event, id) => {
  printerWindow.webContents.send('printInvoicePDF', id);
});

ipcMain.on('readyToPrint', (event, data) => {
  const options = {
    filters: [
      {
        name: 'All',
        extensions: ['pdf'],
      },
    ],
  };

  printerWindow.webContents
    .printToPDF({
      marginsType: 1,
    })
    .then(data => {
      dialog
        .showSaveDialog(options)
        .then(({ filePath }) => {
          if (!filePath) {
            event.sender.send('wrotePDF');
            return;
          }

          fs.writeFile(filePath, data, function(error) {
            if (error) {
              event.sender.send('wrotePDF');
            }
            shell.openItem(filePath);
            event.sender.send('wrotePDF');
          });
        })
        .catch(err => {
          event.sender.send('wrotePDF');
        });
    })
    .catch(err => {
      throw err;
    });
});
