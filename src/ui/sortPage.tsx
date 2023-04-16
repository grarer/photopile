import { useEffect, useState } from "react";
import { MoveInput } from "./moveInput";
import { Button, LinearProgress, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Category, ErrorHandler, IFileManager, SelectedDirectoryResponse } from "../model";

type CurrentImageState = {
    state: "loading",
    categories: Category[]
} | {
    state: "loaded"
    sourceFileName: string,
    fileAbsolutePath: string,
    categories: Category[],
    totalUnsortedFiles: number,
} | {
    state: "none"
}

function createCategory(workingDirectory: SelectedDirectoryResponse, categoryPath: string): Category {
    // TODO throw for paths starting or ending in slashes
    // normalize the path
    var normalizedPath = categoryPath.replace(/\\/g, "/").split("/").filter(p => p !== "").join("/");
    var categoryAbsolutePath = workingDirectory.workingDirectoryAbsolutePath + "/" + normalizedPath;
    return { name: categoryPath, absolutePath: categoryAbsolutePath };
}


export function SortPage(props: {
    workingDirectory: SelectedDirectoryResponse,
    fileManager: IFileManager,
    handleError: ErrorHandler,
    goHome: () => void}): JSX.Element {
    var [currentImageState, setCurrentImageState] = useState<CurrentImageState>({state: "loading", categories: props.workingDirectory.existingCategories});
    var [filesMovedCount, setFilesMovedCount] = useState<number>(0);

    // effect to load next image
    useEffect(() => {
        async function readNextFile() {
            if (currentImageState.state !== "loading") {
                return;
            }

            var nextFileResponse = await props.fileManager.getNextFileAndFileCount(props.workingDirectory.workingDirectoryAbsolutePath);

            if (nextFileResponse.nextFile === null) {
                setCurrentImageState({state: "none"});
                return;
            }

            var newState = {state: "loaded" as const, sourceFileName: nextFileResponse.nextFile.originalName,categories: currentImageState.categories, fileAbsolutePath: nextFileResponse.nextFile.absolutePath, totalUnsortedFiles: nextFileResponse.totalFileCount};
            setCurrentImageState(newState);
        }

        readNextFile().catch(props.handleError);

    }, [currentImageState]);

    if (currentImageState.state === "loading") {
        return <LinearProgress />
    } else if (currentImageState.state == "none") {
        return <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "10px"}}>
            <Typography variant="subtitle1">No files remaining.</Typography>
            <Button variant="contained" size="large" endIcon={<ArrowBackIcon />} onClick={() => props.goHome()}>Back To Home</Button>
        </div>
    }

    function moveCurrentFile(args: {newFileName: string, categoryPath: string}): void {
        async function doMove(): Promise<void> {
            if (currentImageState.state != "loaded") {
                console.error("tried to move file but current state is not a loaded file");
                return;
            }

            // see if there's already a matching category
            var existingMatchingCategory = currentImageState.categories.find(c => c.name === args.categoryPath);
            var isNewCategory = existingMatchingCategory === undefined;
            
            var category: Category = existingMatchingCategory ?? createCategory(props.workingDirectory, args.categoryPath);
            
            await props.fileManager.moveFile({workingDirectoryAbsolutePath: props.workingDirectory.workingDirectoryAbsolutePath, oldFileName:currentImageState.sourceFileName, category: category, newFileName: args.newFileName});

            var newCategoryList: Category[] = isNewCategory ? [...currentImageState.categories, category] : currentImageState.categories;

            setFilesMovedCount((prev) => prev + 1);
            setCurrentImageState({state: "loading", categories: newCategoryList}); // reset state to load the next image
        }

        doMove().catch(props.handleError);
    }

    return (<>
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <div>
            <MoveInput initialFileName={currentImageState.sourceFileName}
            categories={currentImageState.categories}
            totalUnsortedFiles={currentImageState.totalUnsortedFiles}
            filesMovedCount={filesMovedCount}
            onMove={moveCurrentFile}
            handleError={props.handleError}/>
            </div>
            <div style={{width: "calc(100% - 20px)", height: "calc(100% - 130px)", margin: "auto", marginTop: "0px", marginBottom: "10px"}}>
                <img src={`atom://${currentImageState.fileAbsolutePath}`} style={{objectFit: "contain", width: "100%", height: "100%",}}></img>
            </div>
        </div>
    </>);
}