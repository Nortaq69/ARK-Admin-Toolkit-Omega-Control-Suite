const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  loadFile: () => ipcRenderer.invoke('load-file'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getHWID: () => ipcRenderer.invoke('get-hwid'),
  validateSecurity: () => ipcRenderer.invoke('validate-security')
}); 