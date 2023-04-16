import { dialog } from "electron";
import { Category, IFileManager, FileReference, MoveFileRequest, NextFileResponse, SelectedDirectoryResponse } from "../model";
import * as fs from 'node:fs/promises';
import * as fsExtra from 'fs-extra';

export class FileManager implements IFileManager {

    private lastOpenedDirectoryPath: string | undefined = undefined;

    public isInOpenedDirectory(absolutePath: string): boolean {
        return this.lastOpenedDirectoryPath !== undefined && absolutePath.startsWith(this.lastOpenedDirectoryPath);
    }

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
        this.lastOpenedDirectoryPath = directoryAbsolutePath;
        var categories = await this.readCategories(directoryAbsolutePath);

        return { workingDirectoryAbsolutePath: directoryAbsolutePath, existingCategories: categories };

    }
    public async getNextFileAndFileCount(workingDirectoryAbsolutePath: string): Promise<NextFileResponse> {
        try {
            var files = await this.getFiles(workingDirectoryAbsolutePath);
            if (files.length === 0) {
                return { nextFile: null, totalFileCount: 0 };
            }
            return { nextFile: files[0], totalFileCount: files.length };
        } catch (e) {
            throw new Error(`Error reading files in directory ${workingDirectoryAbsolutePath}: e.message`);
        }
    }

    public async moveFile(request: MoveFileRequest): Promise<void> {
        const oldAbsolutePath = request.workingDirectoryAbsolutePath + "/" + request.oldFileName;
        const destinationFolder = request.category.absolutePath;
        const newAbsolutePath = destinationFolder + "/" + request.newFileName;

        // validate source and destination are in the allowed directory
        if (!this.isInOpenedDirectory(oldAbsolutePath)) {
            throw new Error(`Source file path ${oldAbsolutePath} is not in the opened directory ${this.lastOpenedDirectoryPath}`);
        } else if (!this.isInOpenedDirectory(newAbsolutePath)) {
            throw new Error(`Destination file path ${newAbsolutePath} is not in the opened directory ${this.lastOpenedDirectoryPath}`);
        }

        try {
            // create the destination directory if it doesn't exist
            await fs.mkdir(destinationFolder, { recursive: true });
        } catch (e) {
            console.error("Error creating destination directory");
            console.error(e);
            throw new Error(`Error: unable to create destination directory ${destinationFolder}`);
        }

        try {
            await fsExtra.move(oldAbsolutePath, newAbsolutePath, { overwrite: false });
        } catch (e) {
            console.error("Error renaming file");
            console.error(e);
            if (e instanceof Error && e.message.includes("dest already exists")) {
                throw new Error(`File named "${request.newFileName}" already exists in category "${request.category.name}"`);
            }
            
            throw new Error(`Error: unable to move file to ${newAbsolutePath}}`);
        }
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