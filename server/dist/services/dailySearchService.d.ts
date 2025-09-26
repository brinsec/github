export interface DailySearchResult {
    id: string;
    searchDate: string;
    searchQuery: string;
    results: GitHubRepository[];
    stats: {
        totalFound: number;
        newlyDiscovered: number;
        averageStars: number;
        topLanguages: Array<{
            name: string;
            count: number;
        }>;
    };
    reportPath?: string;
}
interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
    topics: string[];
    size: number;
    watchers_count: number;
    open_issues_count: number;
}
export declare class DailySearchService {
    private baseURL;
    private token;
    constructor();
    private getHeaders;
    /**
     * 每日搜索流行项目和发现新项目
     */
    performDailySearch(): Promise<DailySearchResult[]>;
    /**
     * 获取每日搜索查询列表
     */
    private getSearchQueries;
    /**
     * 搜索仓库
     */
    private searchRepositories;
    /**
     * 获取语言统计
     */
    private getLanguageStats;
    /**
     * 生成每日搜索报告
     */
    private generateDailyReport;
    /**
     * 生成Markdown报告内容
     */
    private generateReportMarkdown;
    /**
     * 保存每日搜索记录到数据库
     */
    private saveDailySearchRecords;
    /**
     * 更新聚合数据
     */
    private updateAggregatedData;
    /**
     * 提取热门话题标签
     */
    private extractTopTopics;
    /**
     * 延迟方法
     */
    private delay;
    /**
     * 获取历史搜索结果
     */
    getSearchHistory(limit?: number): Promise<DailySearchResult[]>;
}
export {};
//# sourceMappingURL=dailySearchService.d.ts.map