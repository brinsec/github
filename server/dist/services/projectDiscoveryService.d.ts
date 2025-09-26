import { DiscoveredProject } from '../database';
export declare class ProjectDiscoveryService {
    private githubToken;
    constructor();
    /**
     * 自动发现新项目
     */
    discoverNewProjects(): Promise<DiscoveredProject[]>;
    /**
     * 发现最近创建的项目
     */
    private discoverRecentProjects;
    /**
     * 发现快速增长的项目
     */
    private discoverTrendingProjects;
    /**
     * 发现特定技术栈的新项目
     */
    private discoverTechStackProjects;
    /**
     * 搜索仓库
     */
    private searchRepositories;
    /**
     * 获取模拟数据
     */
    private getMockRepositories;
    /**
     * 映射为发现的项目
     */
    private mapToDiscoveredProject;
    /**
     * 计算增长率
     */
    private calculateGrowthRate;
    /**
     * 去重
     */
    private removeDuplicates;
    /**
     * 保存发现的项目
     */
    private saveDiscoveredProjects;
    /**
     * 记录项目变化
     */
    private recordProjectChange;
    /**
     * 获取发现的项目统计
     */
    getDiscoveryStats(): Promise<any>;
}
//# sourceMappingURL=projectDiscoveryService.d.ts.map