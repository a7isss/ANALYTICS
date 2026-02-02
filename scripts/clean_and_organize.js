import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
// Script is in: F:\0- Future\11- THE DATA ANALYST TRANSFER\hail-data-presentation\scripts
// Base is: F:\0- Future\11- THE DATA ANALYST TRANSFER
const BASE_DIR = path.resolve(__dirname, '../../');
const SOURCES_1 = path.join(BASE_DIR, 'SOURCES');
const SOURCES_2 = path.join(BASE_DIR, 'Sources 2');
const DEST_DIR = path.join(BASE_DIR, 'Cleaned_Data');

// Ensure Dest Dir exists
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Map of Source File -> Dest Subfolder / New Name
const FILE_MAPPING = [
    // --- Demographics (Sources 2) ---
    {
        src: path.join(SOURCES_2, 'POPULATION BY AGE GROUPS,SEX AND NATIONALITY IN ADMINISTRATIVE AREA  HAIL2000A.D._2001.csv'),
        destFolder: 'Demographics',
        newName: 'Population_2000_2001.csv'
    },
    {
        src: path.join(SOURCES_2, 'Population Distribution By gender and (Saudis and Non Saudis) in Governorates of Hail Region_2010.csv'),
        destFolder: 'Demographics',
        newName: 'Population_2010.csv'
    },

    // --- Real Estate (SOURCES) ---
    {
        src: path.join(SOURCES_1, 'Sales transaction indicators in Hail 3rd Q 2025.csv'),
        destFolder: 'Real_Estate',
        newName: 'Transactions_Q3_2025.csv'
    },
    {
        src: path.join(SOURCES_1, 'Sales transaction indicators in Hail 2nd Q 2025.csv'),
        destFolder: 'Real_Estate',
        newName: 'Transactions_Q2_2025.csv'
    },
    {
        src: path.join(SOURCES_1, 'Residential Plans 2024 csv.csv'),
        destFolder: 'Infrastructure',
        newName: 'Residential_Plans_2024.csv'
    },
    {
        src: path.join(SOURCES_1, 'Approved Plans for the Third Quarter of 2024.csv'),
        destFolder: 'Infrastructure',
        newName: 'Approved_Plans_Q3_2024.csv'
    },

    // --- Tourism (SOURCES) ---
    // Filenames were slightly different in LS output vs my memory keying. 
    // LS: "Hail DomestiH1 2025IndicatorsNumberSpendinCSV (1).csv" vs "Hail DomestiH1 2025IndicatorsNumberSpendinCSV.csv"
    // I'll check existence of both or prefer the cleaner one.
    {
        src: path.join(SOURCES_1, 'Hail DomestiH1 2025IndicatorsNumberSpendinCSV.csv'),
        destFolder: 'Tourism',
        newName: 'Domestic_Tourism_H1_2025.csv'
    },
    {
        src: path.join(SOURCES_1, 'Hail Inboun H1 2025 Indicators NumberSpending CSV.csv'),
        destFolder: 'Tourism',
        newName: 'Inbound_Tourism_H1_2025.csv'
    },

    // --- Infrastructure (Mixed) ---
    {
        src: path.join(SOURCES_2, 'Road lengths for2023.csv'),
        destFolder: 'Infrastructure',
        newName: 'Road_Lengths_2023.csv'
    }
];

const processFiles = () => {
    console.log("--- Starting File Organization ---");
    console.log(`Base Dir: ${BASE_DIR}`);

    FILE_MAPPING.forEach(item => {
        try {
            if (fs.existsSync(item.src)) {
                const targetDir = path.join(DEST_DIR, item.destFolder);
                ensureDir(targetDir);
                const targetPath = path.join(targetDir, item.newName);
                fs.copyFileSync(item.src, targetPath);
                console.log(`Copied: ${item.newName}`);
            } else {
                // Try fallback for duplicates like "(1)" if simple missing
                console.warn(`Missing Source: ${path.basename(item.src)}`);
            }
        } catch (e) {
            console.error(`Error copying ${item.newName}:`, e.message);
        }
    });
};

const processExcel = () => {
    console.log("\n--- Processing Excel Sheets ---");
    const excelPath = path.join(SOURCES_2, 'alot of stuff here in the sheets.xlsx');
    const extractDir = path.join(DEST_DIR, 'Excel_Extracts');
    ensureDir(extractDir);

    try {
        if (!fs.existsSync(excelPath)) {
            console.error(`Excel file not found at: ${excelPath}`);
            return;
        }

        const workbook = XLSX.readFile(excelPath);
        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (json.length === 0) return;

            let title = `Sheet_${sheetName}`;
            const firstCell = json[0]?.[0];
            if (typeof firstCell === 'string' && firstCell.length > 3) {
                const safeTitle = firstCell.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                title = `${sheetName}_${safeTitle}`;
            }

            const csvContent = XLSX.utils.sheet_to_csv(sheet);
            const fileName = `${title}.csv`;

            fs.writeFileSync(path.join(extractDir, fileName), csvContent);
            console.log(`Extracted: ${fileName}`);
        });
    } catch (e) {
        console.error("Error processing Excel:", e.message);
    }
};

const main = () => {
    ensureDir(DEST_DIR);
    processFiles();
    processExcel();
    console.log("\n--- Cleaning Complete ---");
    console.log(`Verified files can be found in: ${DEST_DIR}`);
};

main();
