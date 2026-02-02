import XLSX from 'xlsx';
import path from 'path';

const filePath = String.raw`F:\0- Future\11- THE DATA ANALYST TRANSFER\Sources 2\alot of stuff here in the sheets.xlsx`;

try {
    const workbook = XLSX.readFile(filePath);
    console.log("Sheet Names:", workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Print first 5 rows
        data.slice(0, 5).forEach(row => console.log(JSON.stringify(row)));
    });
} catch (error) {
    console.error("Error reading file:", error.message);
    console.error(error);
}
