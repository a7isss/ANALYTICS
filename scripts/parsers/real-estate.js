import { parseCSV, cleanNumber } from '../utils.js';
import path from 'path';

export const processRealEstate = (sourceDir) => {
    const q3File = path.join(sourceDir, 'Sales transaction indicators in Hail 3rd Q 2025.csv');
    const rawData = parseCSV(q3File);

    const districtStats = {};

    // Helper to find key efficiently
    const getKey = (row, partial) => Object.keys(row).find(k => k.includes(partial));

    rawData.forEach(row => {
        // Find keys dynamically for each row (or detect once, but this is safe)
        const cityKey = getKey(row, 'المدينة');
        const districtKey = getKey(row, 'الحي');
        const valueKey = getKey(row, 'قيمة الصفقات');
        const areaKey = getKey(row, 'المساحة M2');
        const countKey = getKey(row, 'عدد الصكوك');

        if (!row[cityKey] || row[cityKey].trim() !== 'حائل') return;

        const district = row[districtKey]?.trim();
        if (!district) return;

        if (!districtStats[district]) {
            districtStats[district] = {
                name: district,
                totalValue: 0,
                totalArea: 0,
                transactions: 0
            };
        }

        districtStats[district].totalValue += cleanNumber(row[valueKey]);
        districtStats[district].totalArea += cleanNumber(row[areaKey]);
        districtStats[district].transactions += cleanNumber(row[countKey]);
    });

    return Object.values(districtStats)
        .map(d => {
            const avgPrice = d.totalArea > 0 ? d.totalValue / d.totalArea : 0;
            return {
                name: d.name,
                avgPriceM2: Math.round(avgPrice),
                transactionCount: d.transactions,
                totalVolume: d.totalValue,
                tier: avgPrice > 2000 ? 'Elite' : avgPrice > 1200 ? 'High' : avgPrice > 600 ? 'Medium' : 'Emerging'
            };
        })
        .filter(d => d.transactionCount > 0)
        .sort((a, b) => b.avgPriceM2 - a.avgPriceM2);
};
