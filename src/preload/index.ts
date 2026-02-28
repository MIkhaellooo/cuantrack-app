import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  SendData: (pack:any) => {
    ipcRenderer.send('channel-1', pack)
  },
  fetchData: () => 
    ipcRenderer.invoke('take-data'),

  takeBalance: (pack:any) => ipcRenderer.invoke('take-balance', pack),

  getGraphData: (range:any) => ipcRenderer.invoke('get-graph-data', range),

  deleteData: (data:any) => ipcRenderer.invoke('delete-data', data)
 }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
