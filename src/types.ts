export interface RealEstateDistrict {
    name: string;
    avgPriceM2: number;
    transactionCount: number;
    totalVolume: number;
    tier: 'Elite' | 'High' | 'Medium' | 'Emerging';
}

export interface InfrastructurePlan {
    name: string;
    value: number;
    fill: string;
}

export interface TourismMetric {
    name: string;
    value: number;
    fill: string;
    type: 'International' | 'Domestic';
}

export interface VillageServiceStats {
    totalVillages: number;
    services: {
        water: { available: number; notAvailable: number };
        electricity: { available: number; notAvailable: number };
        internet: { available: number; notAvailable: number };
    };
    villages: Array<{ name: string, water: string, electricity: string }>;
}

export interface ServiceTrend {
    legacy2017: { waterDeficit: number; elecDeficit: number };
    current2024: { generalDeficit: number };
}

export interface RealEstateGrowth {
    name: string;
    priceQ3: number;
    priceQ2: number;
    growth: number;
    volume: number;
    isHotspot: boolean;
    isOpportunity: boolean;
}

export interface TourismYield {
    name: string;
    value: number;
}


export interface GemDistrict extends RealEstateGrowth {
    gemScore: number;
    type: string;
}

export interface TourismComparison {
    city: { name: string; spend: number; visitors: number };
    rural: { name: string; spend: number; visitors: number };
}

export interface GeneratedInsights {
    realEstate: RealEstateDistrict[];
    infrastructure: InfrastructurePlan[];
    tourism: TourismMetric[];
    financials: {
        realEstateGrowth: RealEstateGrowth[];
        tourismYield: TourismYield[];
    };
    gems: {
        districts: GemDistrict[];
        tourismOps: TourismComparison;
    };
    legacyAnalysis: {
        villageStats: VillageServiceStats;
        trend: ServiceTrend;
    };
    meta: {
        generatedAt: string;
        dataSource: string;
    };
}
