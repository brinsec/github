import { GitHubRepository } from '../../shared/types';
export declare class TrendingService {
    private githubService;
    private classificationService;
    private mockService;
    constructor();
    /**
     * 发现一周内上升最快的项目
     */
    discoverWeeklyTrending(): Promise<GitHubRepository[]>;
    /**
     * 发现一个月内上升最快的项目
     */
    discoverMonthlyTrending(): Promise<GitHubRepository[]>;
    /**
     * 发现一个季度内上升最快的项目
     */
    discoverQuarterlyTrending(): Promise<GitHubRepository[]>;
    /**
     * 获取总榜 - 综合所有时间段的热门项目
     */
    getOverallRanking(): Promise<GitHubRepository[]>;
    /**
     * 搜索热门仓库
     */
    private searchTrendingRepositories;
    /**
     * 自动star仓库
     */
    autoStarRepository(repo: GitHubRepository): Promise<boolean>;
    /**
     * 自动发现并star热门项目
     */
    autoDiscoverAndStar(period: 'weekly' | 'monthly' | 'quarterly'): Promise<{
        discovered: number;
        starred: number;
        classified: number;
        repositories: GitHubRepository[];
    }>;
    /**
     * 将GitHub API响应映射为GitHubRepository对象
     */
    private mapToGitHubRepository;
    /**
     * 去重仓库
     */
    private removeDuplicates;
}
//# sourceMappingURL=trendingService.d.ts.map