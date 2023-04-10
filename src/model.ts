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

export interface FileAccessAPI {
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