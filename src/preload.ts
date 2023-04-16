// See the Electron documentation for details on how to use preload scripts:
import { ChannelNames, IFileManager, MoveFileRequest, NextFileResponse, SelectedDirectoryResponse, windowFileManagerKey } from './model';
import { FileManager } from './util/FileManager';




// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

const proxyFileManager: IFileManager = {
    getSelectedDirectoryAndExistingCategories: () => ipcRenderer.invoke(ChannelNames.getSelectedDirectoryAndExistingCategories),
    getNextFileAndFileCount: (workingDirectoryAbsolutePath: string) => ipcRenderer.invoke(ChannelNames.getNextFileAndFileCount, workingDirectoryAbsolutePath),
    moveFile: (request: MoveFileRequest) => ipcRenderer.invoke(ChannelNames.moveFile, request),
}

contextBridge.exposeInMainWorld(windowFileManagerKey, proxyFileManager);