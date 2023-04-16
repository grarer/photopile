import { useState } from "react";
import { IFileManager, SelectedDirectoryResponse, windowFileManagerKey } from "../model";
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { ThemeProvider } from "@emotion/react";
import { Paper, createTheme } from "@mui/material";
import { SortPage } from "./sortPage";
import { StartPage } from "./startPage";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const proxyFileManager: IFileManager = (window as unknown as {[windowFileManagerKey]: IFileManager}).fileManager;

export function RootWrapper(): JSX.Element {
  return (
      <RootPage/>
  );
}

export function RootPage(): JSX.Element {
  var [directorySelection, setDirectorySelection] = useState<SelectedDirectoryResponse | undefined>();

  console.log(directorySelection);

  // TODO error popup should use sans-serif font
  function showErrorMessage(error: unknown): void {
    console.error(error);
    var message = error instanceof Error ? error.message : `${error}`;

    if (message.startsWith("Error invoking remote method")) {
      const errorMarker = "Error: ";
      var startIndex = message.indexOf(errorMarker) + errorMarker.length;
      message = message.substring(startIndex);
    }
    enqueueSnackbar({message, variant: "error", anchorOrigin: {vertical: "top", horizontal: "center"}, autoHideDuration: 2000});
  }

  return (
    <ThemeProvider theme={darkTheme}>
        <SnackbarProvider/>
          <Paper style={{ height: "100vh", borderRadius: 0 }}>
            {(directorySelection === undefined
              ? (<StartPage onDirectorySelected={setDirectorySelection} handleError={showErrorMessage} fileManager={proxyFileManager}/>)
              : <SortPage workingDirectory={directorySelection} handleError={showErrorMessage} goHome={() => setDirectorySelection(undefined)} fileManager={proxyFileManager}></SortPage>)}
          </Paper>
      </ThemeProvider>
  );
}