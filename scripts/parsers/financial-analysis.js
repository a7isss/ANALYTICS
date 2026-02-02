import { parseCSV, cleanNumber } from '../utils.js';
import path from 'path';
import fs from 'fs';

// Reusing logic to parse a specific Quarter file
const parseRealEstateFile = (filePath) => {
    const rawData = parseCSV(filePath);
    const districtStats = {};

    const getKey = (row, partial) => Object.keys(row).find(k => k.includes(partial));

    rawData.forEach(row => {
        const cityKey = getKey(row, 'المدينة');
        const districtKey = getKey(row, 'الحي');
        const valueKey = getKey(row, 'قيمة الصفقات');
        const areaKey = getKey(row, 'المساحة M2');
        const countKey = getKey(row, 'عدد الصكوك');

        // Validation based on file content inspection
        if (!row[cityKey] || row[cityKey].trim() !== 'حائل') return;
        const district = row[districtKey]?.trim();
        if (!district) return;

        if (!districtStats[district]) {
            districtStats[district] = {
                totalValue: 0,
                totalArea: 0,
                transactions: 0
            };
        }

        districtStats[district].totalValue += cleanNumber(row[valueKey]);
        districtStats[district].totalArea += cleanNumber(row[areaKey]);
        districtStats[district].transactions += cleanNumber(row[countKey]);
    });

    // Calculate Averages
    const results = {};
    Object.keys(districtStats).forEach(dist => {
        const d = districtStats[dist];
        if (d.totalArea > 0 && d.transactions > 0) {
            results[dist] = {
                pricePerM2: Math.round(d.totalValue / d.totalArea),
                volume: d.totalValue,
                count: d.transactions
            };
        }
    });

    return results;
};

export const processFinancials = (cleanDataDir) => {
    // 1. Real Estate Growth Analysis
    // Note: filenames based on Inventory
    const q2File = path.join(cleanDataDir, 'Real_Estate/Transactions_Q2_2025.csv');
    const q3File = path.join(cleanDataDir, 'Real_Estate/Transactions_Q3_2025.csv');

    const q2Data = parseRealEstateFile(q2File);
    const q3Data = parseRealEstateFile(q3File);

    const growthMetrics = [];

    Object.keys(q3Data).forEach(district => {
        const cur = q3Data[district];
        const prev = q2Data[district];

        if (prev) {
            // Calculate Growth
            const priceGrowth = ((cur.pricePerM2 - prev.pricePerM2) / prev.pricePerM2) * 100;
            const volGrowth = ((cur.volume - prev.volume) / prev.volume) * 100;

            // Filter for significant data (ignore single transaction anomalies if possible, 
            // but for now take all to show data)
            growthMetrics.push({
                name: district,
                priceQ3: cur.pricePerM2,
                priceQ2: prev.pricePerM2,
                growth: parseFloat(priceGrowth.toFixed(1)),
                volume: cur.volume,
                isHotspot: priceGrowth > 5, // 5% growth threshold
                isOpportunity: priceGrowth < 0 && cur.count > 5 // Price drop but high activity
            });
        }
    });

    // Sort by largest Price Growth
    const topGrowth = growthMetrics.sort((a, b) => b.growth - a.growth).slice(0, 10);

    // 2. Tourism Yield Analysis (Historical)
    const tourismFile = path.join(cleanDataDir, 'Tourism/Domestic_Tourism_H1_2025.csv');
    const tourismContent = fs.readFileSync(tourismFile, 'utf-8');
    // Simple manual parse for specific known columns based on previous `view_file`
    // Destination,Year,Tourists(000),Overnight,Spending(Mn),AvgStay,AvgSpendPerTrip,AvgSpendPerNight

    // We want to extract [Year, AvgSpendPerTrip] for "Hail Province" rows
    const tourismLines = tourismContent.split('\n');
    const tourismTrends = [];

    tourismLines.forEach(line => {
        const cols = line.split(',');
        if (cols.length < 8) return;
        if (cols[0].includes('Hail Province') && !cols[1].includes('YEARS')) {
            const year = cols[1].trim();
            const spendPerTrip = parseFloat(cols[6]); // Column 7 is Index 6
            if (!isNaN(spendPerTrip)) {
                tourismTrends.push({ name: year, value: spendPerTrip });
            }
        }
    });

    return {
        realEstateGrowth: topGrowth,
        tourismYield: tourismTrends
    };
};
