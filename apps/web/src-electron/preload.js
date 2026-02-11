const { contextBridge, ipcRenderer } = require("electron");

// 将来的にメインプロセスとの通信が必要になった場合、ここにAPIを追加
contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  versions: process.versions,
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
});

console.log("[Electron Preload] 初期化完了");
