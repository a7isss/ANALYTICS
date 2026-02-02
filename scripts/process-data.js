import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Corrected imports to match the Exported Names in parsers/*.js
import { processRealEstate as parseRealEstate } from './parsers/real-estate.js';
import { processInfrastructure as parseInfrastructure } from './parsers/infrastructure.js';
import { processTourism as parseTourism } from './parsers/tourism.js';
import { parseVillageServices } from './parsers/village-services.js';
import { processFinancials } from './parsers/financial-analysis.js';
import { processHiddenGems } from './parsers/gems.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BASE_DIR = path.resolve(__dirname, '../../');
const SOURCES_DIR = path.join(BASE_DIR, 'SOURCES');
// NOTE: previous parsers (real-estate, infrastructure) expect the 'sourceDir' to contain the *original* filenames
// because they hardcode strings like 'Residential Plans 2024 csv.csv' inside them.
// We effectively have a mix: 
// - New logic uses 'Cleaned_Data'
// - Old logic uses 'SOURCES'
// To avoid rewriting all old parsers right now, I will point them to the old SOURCES dir for now, 
// and use CLEAN_DATA_DIR for the new Village logic.

const CLEAN_DATA_DIR = path.join(BASE_DIR, 'Cleaned_Data');
const OUTPUT_FILE = path.join(BASE_DIR, 'hail-data-presentation/src/data/generated_insights.json');

const readFile = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.warn(`Warning: Could not read file ${filePath}`);
        return null;
    }
};

const main = () => {
    console.log("--- Starting Analysis Pipeline V2 ---");

    // 1. Ingest Real Estate (Existing Parser -> expects SOURCES)
    // We pass SOURCES_DIR, and it looks for 'Sales transaction indicators in Hail 3rd Q 2025.csv'
    let realEstateData = [];
    try {
        realEstateData = parseRealEstate(SOURCES_DIR);
    } catch (e) { console.error("Error parsing Real Estate:", e.message); }

    // 2. Ingest Infrastructure (Existing Parser -> expects SOURCES)
    let infraData = [];
    try {
        infraData = parseInfrastructure(SOURCES_DIR);
    } catch (e) { console.error("Error parsing Infrastructure:", e.message); }

    // 3. Ingest Tourism (Existing Parser -> expects SOURCES)
    let tourismData = [];
    try {
        tourismData = parseTourism(SOURCES_DIR);
    } catch (e) { console.error("Error parsing Tourism:", e.message); }

    // 4. Ingest Village Services (Legacy)
    const villageFile = path.join(CLEAN_DATA_DIR, 'Excel_Extracts/Village_Services_Census_2017.csv');
    const villageContent = readFile(villageFile);
    const villageData = villageContent ? parseVillageServices(villageContent) : null;

    // 5. Ingest Financials (New Module)
    // Note: processFinancials expects the Cleaned_Data directory root
    let financialData = { realEstateGrowth: [], tourismYield: [] };
    try {
        financialData = processFinancials(CLEAN_DATA_DIR);
    } catch (e) { console.error("Error processing Financials:", e.message); }

    // 6. Hidden Gems & Benchmarks (New Module)
    let gemData = { districts: [], tourismOps: {} };
    try {
        gemData = processHiddenGems(financialData, realEstateData, tourismData);
    } catch (e) { console.error("Error processing Hidden Gems:", e.message); }

    // --- DERIVED INSIGHTS ---

    // Insight: Service Deficiency Trend
    // 2017: % of Villages with No Water
    // 2024: % of Plans with No Service
    let serviceTrend = {
        legacy2017: { waterDeficit: 0, elecDeficit: 0 },
        current2024: { generalDeficit: 0 }
    };

    if (villageData && villageData.totalVillages > 0) {
        serviceTrend.legacy2017.waterDeficit = Math.round((villageData.services.water.notAvailable / villageData.totalVillages) * 100);
        serviceTrend.legacy2017.elecDeficit = Math.round((villageData.services.electricity.notAvailable / villageData.totalVillages) * 100);
    }

    if (infraData.length > 0) {
        const unservicedPlans = infraData.filter(p => p.name === 'Unserviced').reduce((acc, curr) => acc + curr.value, 0);
        const totalPlans = infraData.reduce((acc, curr) => acc + curr.value, 0);
        serviceTrend.current2024.generalDeficit = Math.round((unservicedPlans / totalPlans) * 100);
    }

    const finalOutput = {
        realEstate: realEstateData,
        infrastructure: infraData,
        tourism: tourismData,
        financials: financialData,
        gems: gemData,
        legacyAnalysis: {
            villageStats: villageData,
            trend: serviceTrend
        },
        meta: {
            generatedAt: new Date().toISOString(),
            dataSource: "Cleaned_Data Repository & Sources"
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalOutput, null, 2));
    console.log(`Insights generated at: ${OUTPUT_FILE}`);
    console.log(`Legacy Water Deficit: ${serviceTrend.legacy2017.waterDeficit}%`);
    console.log(`Current Plan Deficit: ${serviceTrend.current2024.generalDeficit}%`);
};

main();
