import { useState } from "react";
import { IFileManager, SelectedDirectoryResponse, windowFileManagerKey } from "../model";
import { ThemeProvider } from "@emotion/react";
import { Paper, createTheme } from "@mui/material";
import { SortPage } from "./sortPage";
import { StartPage } from "./startPage";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  function showErrorMessage(error: unknown): void {
    console.error(error);
    var message = error instanceof Error ? error.message : `${error}`;

    if (message.startsWith("Error invoking remote method")) {
      const errorMarker = "Error: ";
      var startIndex = message.indexOf(errorMarker) + errorMarker.length;
      message = message.substring(startIndex);
    }

    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      });
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <ToastContainer/>
      <Paper style={{ height: "100vh", borderRadius: 0 }}>
        {(directorySelection === undefined
          ? (<StartPage onDirectorySelected={setDirectorySelection} handleError={showErrorMessage} fileManager={proxyFileManager}/>)
          : <SortPage workingDirectory={directorySelection} handleError={showErrorMessage} goHome={() => setDirectorySelection(undefined)} fileManager={proxyFileManager}></SortPage>)}
      </Paper>
    </ThemeProvider>
  );
}