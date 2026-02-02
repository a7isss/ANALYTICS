import { parse } from 'csv-parse/sync';

export const parseVillageServices = (fileContent) => {
    // skip_empty_lines is true by default in sync mode usually, but explicit is good
    const records = parse(fileContent, {
        columns: false, // We'll handle columns manually due to multi-line header
        skip_empty_lines: true,
        from_line: 7 // Data effectively starts around line 7 based on inspection
    });

    // Based on inspection of Sheet_56 (Village_Services_Census_2017.csv)
    // Col 6 (Index 5): Commercial bank
    // Col 21 (Index 20): Agricultural branch
    // Col 23 (Index 22): Populated area (Name)
    // The "Available"/"Not Available" cols are earlier.
    // Index 1 (Col 2): Internet
    // Index 2 (Col 3): Cell Phone
    // Index 3 (Col 4): Telephone
    // Index 4 (Col 5): Water network
    // Index 5 (Col 6): Electricity

    const stats = {
        totalVillages: 0,
        services: {
            water: { available: 0, notAvailable: 0 },
            electricity: { available: 0, notAvailable: 0 },
            internet: { available: 0, notAvailable: 0 },
            cellPhone: { available: 0, notAvailable: 0 }
        },
        villages: []
    };

    records.forEach(row => {
        // Basic validation: ensure we have a village name
        const villageName = row[22];
        if (!villageName) return;

        stats.totalVillages++;

        const checkAvailability = (val) => {
            if (!val) return 'Unknown';
            return val.toLowerCase().includes('not available') ? 'No' : 'Yes';
        };

        const waterStatus = checkAvailability(row[4]);
        const elecStatus = checkAvailability(row[5]);
        const internetStatus = checkAvailability(row[1]);
        const cellStatus = checkAvailability(row[2]);

        if (waterStatus === 'Yes') stats.services.water.available++;
        else if (waterStatus === 'No') stats.services.water.notAvailable++;

        if (elecStatus === 'Yes') stats.services.electricity.available++;
        else if (elecStatus === 'No') stats.services.electricity.notAvailable++;

        if (internetStatus === 'Yes') stats.services.internet.available++;
        else if (internetStatus === 'No') stats.services.internet.notAvailable++;

        stats.villages.push({
            name: villageName,
            water: waterStatus,
            electricity: elecStatus
        });
    });

    return stats;
};
