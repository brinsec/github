import { GitHubRepository } from '../../shared/types';
export declare class MockTrendingService {
    /**
     * 获取模拟的周度热门项目
     */
    getWeeklyTrending(): GitHubRepository[];
    /**
     * 获取模拟的月度热门项目
     */
    getMonthlyTrending(): GitHubRepository[];
    /**
     * 获取模拟的季度热门项目
     */
    getQuarterlyTrending(): GitHubRepository[];
    /**
     * 获取模拟的总榜数据
     */
    getOverallRanking(): GitHubRepository[];
}
//# sourceMappingURL=mockTrendingService.d.ts.map