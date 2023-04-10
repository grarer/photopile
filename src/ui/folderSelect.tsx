import { dialog } from "electron";
import { windowFileManagerKey } from "../model";
import { FileAccessAPI } from "../model";

function getProxyFileManager(): FileAccessAPI {
    return (window as unknown as {[windowFileManagerKey]: FileAccessAPI}).fileManager; // TODO type safety
}

export function FolderSelectPage(): JSX.Element {

    async function UpdateSelectedDirectory(): Promise<void> {
        const response = await getProxyFileManager().getSelectedDirectoryAndExistingCategories();
        console.log(response);
    }

    function OnButtonClick() {
        console.log("button clicked, not implemented");
        UpdateSelectedDirectory(); // TODO handle errors
    }

    return (
        <div>
        <h1>Folder Select Page</h1>
        <button onClick={OnButtonClick} style={{height: 300, width: 800}}>Select folder</button>
        </div>
    );
}