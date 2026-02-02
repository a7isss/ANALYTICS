import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export const parseCSV = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_quotes: true,
            trim: true
        });
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }
};

export const cleanNumber = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Remove commas, spaces, and non-numeric chars except dot
    return parseFloat(str.replace(/[^\d.-]/g, '')) || 0;
};
