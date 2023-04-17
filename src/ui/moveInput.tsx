import { Autocomplete, Button, InputAdornment, LinearProgress, Paper, TextField, Typography, createFilterOptions } from "@mui/material";
import { useState } from "react";
import * as matchSorter from "match-sorter"
import { Category, ErrorHandler } from "../model";

interface OptionType {
    inputValue?: string;
    title: string;
}

function separateFileNameFromExtension(fileName: string): [string, string] {
    var lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex == -1) {
        return [fileName, ""];
    }

    return [fileName.substring(0, lastDotIndex), fileName.substring(lastDotIndex)];
}

export function MoveInput(props: {
    initialFileName: string,
    categories: Category[],
    filesMovedCount: number,
    totalUnsortedFiles: number,
    onMove: (args: { newFileName: string, categoryPath: string }) => void,
    handleError: ErrorHandler }): JSX.Element {

    const existingOptions: OptionType[] = props.categories.map(c => ({ title: c.name }));

    const [initialFileLabel, extension] = separateFileNameFromExtension(props.initialFileName);
    const [name, setName] = useState<string>(initialFileLabel);
    const [autocompleteSelection, setAutocompleteSelection] = useState<OptionType | null>(null);
    const [autocompleteRawInput, setAutocompleteRawInput] = useState<string>("");
    const [highlight, setHighlight] = useState<OptionType | null>(null);

    var currentFileNumber = props.filesMovedCount + 1;
    var totalFileCount = props.filesMovedCount + props.totalUnsortedFiles;
    const progressLabel: string = `${currentFileNumber}/${totalFileCount}`;
    const progressValue: number = (props.filesMovedCount / totalFileCount) * 100;

    const canComplete: boolean = !!(name && autocompleteSelection?.title);

    function complete(): void {
        var selectedCategoryPath = autocompleteSelection?.title;

        if (!name) {
            props.handleError("File name cannot be blank");
            return;
        } else if (!selectedCategoryPath) {
            props.handleError("You must select a category path");
            return;
        }

        props.onMove({ newFileName: name + extension, categoryPath: selectedCategoryPath });
    }

    function getSuggestions(inputValue: string, options: OptionType[]): OptionType[] {
        //const filtered = filter(options, params);
        var filtered = matchSorter.matchSorter<OptionType>(options, inputValue, { keys: ["title"] });
        filtered.sort();
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.title);
        if (inputValue !== '' && !isExisting) {
            filtered.push({
                inputValue,
                title: `Add "${inputValue}"`,
            });
        }
        return filtered;
    }

    const selectAllOnFocus = (event: { target: { select: () => void; }; }) => event.target.select();

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Paper style={{ margin: "5px", padding: "10px", paddingTop: 0, display: "flex", flexDirection: "column" }} elevation={5}>
            <Typography variant="caption" style={{color: "#5b5b5b"}}>File {progressLabel}: {props.initialFileName}</Typography>
            <LinearProgress variant="determinate" value={progressValue}/>
            <div style={{ display: "flex", flexDirection: "row", paddingTop: "10px" }}>
                <TextField id="label-name" label="Rename" variant="outlined" autoFocus onFocus={selectAllOnFocus}
                    value={name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{extension}</InputAdornment>,
                    }}
                />
                <Autocomplete
                    style={{ marginLeft: "5px", marginRight: "5px" }}
                    value={autocompleteSelection}
                    onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                            setAutocompleteSelection({
                                title: newValue,
                            });
                        } else if (newValue && newValue.inputValue) {
                            // Create a new value from the user input
                            setAutocompleteSelection({
                                title: newValue.inputValue,
                            });
                        } else {
                            setAutocompleteSelection(newValue);
                        }
                    }}

                    filterOptions={(_, params) => getSuggestions(params.inputValue, existingOptions)}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    id="category"
                    options={existingOptions}
                    getOptionLabel={(option) => {
                        // Value selected with enter, right from the input
                        if (typeof option === 'string') {
                            return option;
                        }
                        // Add "xxx" option created dynamically
                        if (option.inputValue) {
                            return option.inputValue;
                        }
                        // Regular option
                        return option.title;
                    }}
                    renderOption={(props, option) => <li {...props}>{option.title}</li>}
                    sx={{ width: 300 }}
                    freeSolo
                    onInputChange={(event, newInputValue) => { setAutocompleteRawInput(newInputValue) }}
                    onHighlightChange={(event, newHighlight) => setHighlight(newHighlight)}
                    renderInput={(params) => (
                        <TextField {...params} label="Move To Category Folder"
                            onKeyDown={(event) => {
                                if (event.key === "Tab" && autocompleteRawInput) {
                                    if (highlight) {
                                        var selectedCategory = highlight.inputValue ? { title: highlight.inputValue } : highlight;
                                        setAutocompleteSelection(selectedCategory);
                                        return;
                                    } else {
                                        var matchingOptions = getSuggestions(autocompleteRawInput, existingOptions);
                                        var nonAddMatchingOptions = matchingOptions.filter(o => o.inputValue == null);
                                        var topLevelOptions = nonAddMatchingOptions.filter(o => o.title.indexOf("/") == -1);
                                        var addOption = matchingOptions.find(o => o.inputValue != null);
                                        if (nonAddMatchingOptions.length === 1) {
                                            setAutocompleteSelection(nonAddMatchingOptions[0]);
                                            return;
                                        } else if (matchingOptions.length === 1 && addOption != null && addOption.inputValue != null) {
                                            setAutocompleteSelection({title: addOption.inputValue});
                                            return;
                                        } else if (topLevelOptions.length === 1) {
                                            setAutocompleteSelection(topLevelOptions[0]);
                                            return;
                                        }
                                    }
                                }
                            }} />
                    )}
                />

                <Button variant="outlined" onClick={complete} disabled={!canComplete}>Enter</Button>
            </div>
        </Paper>
    </div>
}
