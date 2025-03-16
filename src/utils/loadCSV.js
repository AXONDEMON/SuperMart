import Papa from "papaparse";

// Function to load CSV data
export const loadCSVData = (filePath, callback) => {
    fetch(filePath)
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                complete: function(result) {
                    callback(result.data);
                }
            });
        })
        .catch(error => console.error("Error loading CSV file:", error));
};