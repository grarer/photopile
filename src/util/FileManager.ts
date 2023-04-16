import { dialog } from "electron";
import { Category, IFileManager, FileReference, MoveFileRequest, NextFileResponse, SelectedDirectoryResponse } from "../model";
import * as fs from 'node:fs/promises';

export class FileManager implements IFileManager {
    public async getSelectedDirectoryAndExistingCategories(): Promise<SelectedDirectoryResponse> {

        // get the user's selected directory
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        console.log(result);
        if (result.filePaths.length === 0) {
            throw new Error("No directory selected");
        }
        const directoryAbsolutePath = result.filePaths[0];
        var categories = await this.readCategories(directoryAbsolutePath);



        return {workingDirectoryAbsolutePath: directoryAbsolutePath, existingCategories: categories};

    }
    public async getNextFileAndFileCount(workingDirectoryAbsolutePath: string): Promise<NextFileResponse> {
        var files = await this.getFiles(workingDirectoryAbsolutePath);
        if (files.length === 0) {
            return {nextFile: null, totalFileCount: 0};
        }
        return {nextFile: files[0], totalFileCount: files.length};
    }

    public async moveFile(request: MoveFileRequest): Promise<void> {
        const oldAbsolutePath = request.workingDirectoryAbsolutePath + "/" + request.oldFileName;
        const newAbsolutePath = request.category.absolutePath + "/" + request.newFileName;
        await fs.rename(oldAbsolutePath, newAbsolutePath);
    }

    private async readCategories(workingDirectoryAbsolutePath: string, maxRecursionDepth = 3): Promise<Category[]> {
        const results: Category[] = [];
        const entries = await fs.readdir(workingDirectoryAbsolutePath);
        for (const entryName of entries) {
            const entryAbsolutePath = workingDirectoryAbsolutePath + "/" + entryName;
            // TODO parallelize this?
            if ((await fs.stat(entryAbsolutePath)).isDirectory()) {
                results.push({
                    name: entryName,
                    absolutePath: entryAbsolutePath,
                });
                if (maxRecursionDepth > 0) {
                    const subcategories = await this.readCategories(entryAbsolutePath, maxRecursionDepth - 1);
                    results.push(...subcategories.map(c => ({ name: entryName + "/" + c.name, absolutePath: c.absolutePath })));
                }
            }
        }

        return results;
    }

    private async getFiles(workingDirectoryAbsolutePath: string): Promise<FileReference[]> {
        const results: FileReference[] = [];
        const entries = await fs.readdir(workingDirectoryAbsolutePath);
        for (const entryName of entries) {
            const entryAbsolutePath = workingDirectoryAbsolutePath + "/" + entryName;
            // TODO parallelize this?
            if ((await fs.stat(entryAbsolutePath)).isFile()) {
                results.push({
                    originalName: entryName,
                    absolutePath: entryAbsolutePath,
                });
            }
        }

        return results;
    }
}