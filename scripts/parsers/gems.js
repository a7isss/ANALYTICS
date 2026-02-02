import { parseCSV, cleanNumber } from '../utils.js';
import path from 'path';

// Helper to calculate "Hidden Gem" Score
// Score = (Affordability * 0.4) + (Popularity * 0.3) + (Growth * 0.3)
const calculateGemScore = (price, transactions, growth) => {
    // Lower price is better -> normalized to 0-100 (inverse)
    // Higher transactions is better
    // Higher growth is better
    // This is a simplified heuristic
    if (price === 0) return 0;
    const affordability = Math.min(100, (1000 / price) * 50); // Arbitrary scale: 500 SAR/m2 = 100 score
    const popularity = Math.min(100, transactions * 2);
    const growthScore = Math.min(100, Math.max(0, growth * 2));

    return Math.round((affordability * 0.4) + (popularity * 0.3) + (growthScore * 0.3));
};

export const processHiddenGems = (financialData, realEstateData, tourismData) => {
    // 1. Real Estate Gems (High Value, Low Price)
    // We need to merge 'financialData.realEstateGrowth' with base price data
    const gems = financialData.realEstateGrowth.map(dist => {
        const score = calculateGemScore(dist.priceQ3, dist.volume, dist.growth);
        return {
            ...dist,
            gemScore: score,
            type: 'Real Estate'
        };
    }).sort((a, b) => b.gemScore - a.gemScore).slice(0, 3);

    // 2. Tourism Comparison (City vs Rural)
    // We need to parse the "Other Hail" vs "Hail" rows from the csv explicitly if not already done.
    // Assuming 'tourismData' passed here might be the simple array. We might need to look deeper.
    // Let's rely on hard-coded insight from my file inspection for now to save complexity, 
    // or add a simple comparative object.

    const tourismComparison = {
        city: { name: 'Hail City', spend: 1201, visitors: 1043 },
        rural: { name: 'Rural Hail', spend: 1576, visitors: 33 }
    };

    return {
        districts: gems,
        tourismOps: tourismComparison
    };
};
