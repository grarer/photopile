import { ErrorHandler, IFileManager, SelectedDirectoryResponse } from "../model";
import { Button } from "@mui/material";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export function StartPage(props: {
    fileManager: IFileManager,
    onDirectorySelected: (selection: SelectedDirectoryResponse) => void,
    handleError: ErrorHandler}
): JSX.Element {
    async function start (): Promise<void> {
        try {
            var selectedDirectoryResponse = await props.fileManager.getSelectedDirectoryAndExistingCategories();
            props.onDirectorySelected(selectedDirectoryResponse);
        } catch (err) {
            props.handleError(err);
        }
        
    }

    return (<>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "20px"}}>
            <Button variant="contained" size="large" endIcon={<FolderOpenIcon />} onClick={() => start()}>Select Folder</Button>
            <img src={`atom://C:/Users/grace/Desktop/testimages/wagawghwrah.png`} style={{objectFit: "contain", width: "100%", height: "100%",}}></img>
        </div>
    </>);
}