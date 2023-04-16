export type Category = {
    name: string,
    absolutePath: string,
}

export type SelectedDirectoryResponse = {
    workingDirectoryAbsolutePath: string,
    existingCategories: Category[],
}

// TODO include a way to display the file contents
export type FileReference = {
    originalName: string,
    absolutePath: string,
}

export type NextFileResponse = {
    nextFile: FileReference,
    totalFileCount: number,
} | {
    nextFile: null,
    totalFileCount: 0,
}

export type MoveFileRequest = {
    workingDirectoryAbsolutePath: string,
    oldFileName: string,
    newFileName: string,
    category: Category,
}

export interface IFileManager {
    getSelectedDirectoryAndExistingCategories(): Promise<SelectedDirectoryResponse>,
    getNextFileAndFileCount(workingDirectoryAbsolutePath: string): Promise<NextFileResponse>
    moveFile(request: MoveFileRequest): Promise<void>,
}

export const ChannelNames = {
    getSelectedDirectoryAndExistingCategories: "fileManager:getSelectedDirectoryAndExistingCategories",
    getNextFileAndFileCount: "fileManager:getNextFileAndFileCount",
    moveFile: "fileManager:moveFile",
}

export const windowFileManagerKey = "fileManager" as const;

export type ErrorHandler = (error: unknown) => void