import { FileAccessAPI } from './model';

export interface IElectronAPI {
    fileManager: FileAccessAPI
  }
  
  declare global {
    interface Window {
      electronAPI: IElectronAPI
    }
  }