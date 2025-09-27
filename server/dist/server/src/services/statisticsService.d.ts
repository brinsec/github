import { Statistics } from '../../../shared/types';
export declare class StatisticsService {
    getStatistics(): Promise<Statistics>;
    private processActivityStats;
    getCategoryDetails(categoryId: string): Promise<any>;
    getLanguageStats(): Promise<any[]>;
    getTopRepositories(limit?: number): Promise<any[]>;
}
//# sourceMappingURL=statisticsService.d.ts.map