import { ErrorHandler, IFileManager, SelectedDirectoryResponse } from "../model";
import { Button, Paper, Typography } from "@mui/material";
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
            <Paper elevation={7} style={{margin: "20px", padding: "20px", maxWidth: "5in"}}>
                <Typography variant="body1">PhotoPile helps you organize a folder of images into sub-folders based on categories. Select a folder to get started.</Typography>
            </Paper>
        </div>
    </>);
}