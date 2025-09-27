export declare class SchedulerService {
    private trendingService;
    private projectDiscoveryService;
    private dailySearchService;
    private isRunning;
    constructor();
    /**
     * 启动定时任务
     */
    startScheduler(): void;
    /**
     * 停止定时任务
     */
    stopScheduler(): void;
    /**
     * 手动执行每日热门项目发现
     */
    runDailyTrendingDiscovery(): Promise<void>;
    /**
     * 手动执行周度热门项目发现
     */
    runWeeklyTrendingDiscovery(): Promise<void>;
    /**
     * 手动执行月度热门项目发现
     */
    runMonthlyTrendingDiscovery(): Promise<void>;
    /**
     * 手动执行季度热门项目发现
     */
    runQuarterlyTrendingDiscovery(): Promise<void>;
    /**
     * 手动执行新项目发现
     */
    runNewProjectDiscovery(): Promise<void>;
    /**
     * 手动执行深度项目发现
     */
    runDeepProjectDiscovery(): Promise<void>;
    /**
     * 执行每日搜索任务
     */
    runDailySearch(): Promise<void>;
    /**
     * 获取调度器状态
     */
    getStatus(): {
        isRunning: boolean;
        tasks: string[];
    };
}
//# sourceMappingURL=schedulerService.d.ts.map