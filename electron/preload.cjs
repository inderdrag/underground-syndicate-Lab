const { contextBridge } = require('electron');

// Expose safe Electron APIs if needed in the future
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
