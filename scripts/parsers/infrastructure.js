import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export const processInfrastructure = (sourceDir) => {
    const plansFile = path.join(sourceDir, 'Residential Plans 2024 csv.csv');
    const fileContent = fs.readFileSync(plansFile, 'utf-8');

    // Parse as Arrays, skipping first 2 lines (Header rows)
    const records = parse(fileContent, {
        relax_quotes: true,
        trim: true,
        skip_empty_lines: true,
        from_line: 3 // Skip the complex headers
    });

    const stats = {
        fullyServiced: 0,
        electricityOnly: 0,
        unserviced: 0,
        totalPlans: 0
    };

    records.forEach(row => {
        // Using Indexes based on inspection:
        // 9: Electricity, 10: Water
        const eleVal = row[9]?.trim();
        const waterVal = row[10]?.trim();

        // Normalize 'Yes' / 'Availability' Check
        const hasElec = eleVal === 'نعم' || eleVal === 'يوجد';
        const hasWater = waterVal === 'نعم' || waterVal === 'يوجد';

        stats.totalPlans++;

        if (hasElec && hasWater) {
            stats.fullyServiced++;
        } else if (hasElec && !hasWater) {
            stats.electricityOnly++;
        } else {
            stats.unserviced++;
        }
    });

    return [
        { name: 'Fully Serviced', value: stats.fullyServiced, fill: '#10b981' },
        { name: 'Electricity Only (No Water)', value: stats.electricityOnly, fill: '#f59e0b' },
        { name: 'Unserviced', value: stats.unserviced, fill: '#ef4444' }
    ];
};
