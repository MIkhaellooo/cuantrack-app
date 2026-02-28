import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      SendData:(pack:any) => {},
      fetchData:() => Promise<any[]>,
      takeBalance:(pack:any) => Promise<number>
      getGraphData: () => Promise<any[]>;
      deleteData:(data) => {}
    }
  }
}
