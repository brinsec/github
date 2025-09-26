import axios, { AxiosResponse } from 'axios';
import { 
    getLowdbDatabase, 
    saveDailySearchRecord, 
    DailySearchRecord, 
    SearchStats,
    calculateMonthlyAggregations,
    calculateYearlyAggregations,
    AggregatedSearchData 
} from '../database';
import fs from 'fs/promises';
import path from 'path';

export interface DailySearchResult {
    id: string;
    searchDate: string;
    searchQuery: string;
    results: GitHubRepository[];
    stats: {
        totalFound: number;
        newlyDiscovered: number;
        averageStars: number;
        topLanguages: Array<{ name: string; count: number }>;
    };
    reportPath?: string;
}

interface GitHubApiResponse {
    items: GitHubRepository[];
    total_count: number;
    incomplete_results: boolean;
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

export class DailySearchService {
    private baseURL = 'https://api.github.com';
    private token: string;

    constructor() {
        this.token = process.env.GITHUB_TOKEN || '';
        console.log('🔍 每日搜索服务初始化');
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Daily-Search-System',
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        return headers;
    }

    /**
     * 每日搜索流行项目和发现新项目
     */
    async performDailySearch(): Promise<DailySearchResult[]> {
        console.log('🚀 开始每日自动搜索...');
        
        const searchQueries = this.getSearchQueries();
        const results: DailySearchResult[] = [];

        for (const query of searchQueries) {
            try {
                console.log(`🔍 搜索查询: ${query}`);
                const result = await this.searchRepositories(query);
                results.push(result);
                
                // 避免API限制，添加延迟
                await this.delay(2000);
            } catch (error) {
                console.error(`❌ 搜索查询失败: ${query}`, error);
            }
        }

        // 生成每日报告
        await this.generateDailyReport(results);
        
        // 保存结果到数据库
        await this.saveSearchResults(results);

        console.log('✅ 每日搜索完成');
        return results;
    }

    /**
     * 获取每日搜索查询列表
     */
    private getSearchQueries(): string[] {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        return [
            // 流行项目搜索
            `stars:>1000 created:${dateStr.split('-')[0]}-${String(today.getMonth() + 1).padStart(2, '0')}`,
            // 今日新创建项目
            `created:>=${dateStr} language:javascript`,
            `created:>=${dateStr} language:typescript`,
            `created:>=${dateStr} language:python`,
            // AI/ML 相关
            `stars:>50 created:>=${dateStr} topic:ai`,
            `stars:>50 created:>=${dateStr} topic:machine-learning`,
            // Web 开发
            `stars:>100 created:>=${dateStr} topic:frontend`,
            `stars:>100 created:>=${dateStr} topic:react`,
            // 开发者工具
            `stars:>200 created:>=${dateStr} topic:devtools`,
            // 新兴技术
            `stars:>10 created:>=${dateStr} "web3"`,
            `stars:>10 created:>=${dateStr} "blockchain"`
        ];
    }

    /**
     * 搜索仓库
     */
    private async searchRepositories(query: string): Promise<DailySearchResult> {
        const db = await getLowdbDatabase();
        const today = new Date().toISOString().split('T')[0];
        const searchDate = `${today}T00:00:00Z`;
        
        console.log(`🔎 执行搜索: ${query}`);
        
        try {
            const response: AxiosResponse<GitHubApiResponse> = await axios.get(
                `${this.baseURL}/search/repositories`,
                {
                    headers: this.getHeaders(),
                    params: {
                        q: query,
                        sort: 'stars',
                        order: 'desc',
                        per_page: 100 // GitHub API限制每页最多100个
                    }
                }
            );

            const repositories = response.data.items || [];
            
            // 检查哪些是真正新发现的
            const existingRepos = await db.get('searchResults').value();
            const knownRepos = new Set(existingRepos?.map((r: DailySearchResult) => r.results.map(repo => repo.id)).flat() || []);
            const newlyDiscovered = repositories.filter(repo => !knownRepos.has(repo.id));
            
            // 统计信息
            const stats = {
                totalFound: repositories.length,
                newlyDiscovered: newlyDiscovered.length,
                averageStars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repositories.length || 0,
                topLanguages: this.getLanguageStats(repositories)
            };

            const result: DailySearchResult = {
                id: `search_${Date.now()}`,
                searchDate,
                searchQuery: query,
                results: repositories,
                stats
            };

            return result;
        } catch (error: any) {
            console.error('GitHub搜索API错误:', error.message);
            throw error;
        }
    }

    /**
     * 获取语言统计
     */
    private getLanguageStats(repositories: GitHubRepository[]): Array<{ name: string; count: number }> {
        const languages: Record<string, number> = {};
        
        repositories.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        return Object.entries(languages)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    /**
     * 生成每日搜索报告
     */
    private async generateDailyReport(results: DailySearchResult[]): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const reportDir = path.join(process.cwd(), 'reports');
        const reportFile = path.join(reportDir, `daily_search_${today}.md`);

        try {
            await fs.mkdir(reportDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        const reportContent = this.generateReportMarkdown(results);
        
        try {
            await fs.writeFile(reportFile, reportContent, 'utf8');
            console.log(`📄 每日报告已生成: ${reportFile}`);
            
            // 更新结果中的报告路径
            results.forEach(result => {
                result.reportPath = reportFile;
            });
        } catch (error) {
            console.error('报告文件写入错误:', error);
        }
    }

    /**
     * 生成Markdown报告内容
     */
    private generateReportMarkdown(results: DailySearchResult[]): string {
        const today = new Date().toISOString().split('T')[0];
        
        let markdown = `# 每日GitHub项目发现报告 - ${today}\n\n`;
        
        markdown += `## 🔍 搜索概览\n\n`;
        markdown += `- **搜索次数**: ${results.length}\n`;
        
        const totalProjects = results.reduce((sum, result) => sum + result.stats.totalFound, 0);
        const totalNew = results.reduce((sum, result) => sum + result.stats.newlyDiscovered, 0);
        
        markdown += `- **发现项目总数**: ${totalProjects}\n`;
        markdown += `- **新发现项目**: ${totalNew}\n`;
        markdown += `- **发现率**: ${((totalNew / totalProjects) * 100).toFixed(1)}%\n\n`;

        markdown += `## 🔎 搜索详情\n\n`;

        results.forEach((result, index) => {
            markdown += `### ${index + 1}. ${result.searchQuery}\n\n`;
            markdown += `- **结果数量**: ${result.stats.totalFound}\n`;
            markdown += `- **新发现**: ${result.stats.newlyDiscovered}\n`;
            markdown += `- **平均Stars**: ${result.stats.averageStars.toFixed(1)}\n\n`;

            if (result.stats.topLanguages.length > 0) {
                markdown += `**热门语言分布**:\n`;
                result.stats.topLanguages.slice(0, 5).forEach(lang => {
                    markdown += `- ${lang.name}: ${lang.count}个项目\n`;
                });
                markdown += '\n';
            }

            // 展示top 5 项目
            markdown += `**🔥 热门项目 Top 5**:\n\n`;
            result.results.slice(0, 5).forEach((repo, idx) => {
                markdown += `${idx + 1}. **[${repo.name}](${repo.html_url})**\n`;
                markdown += `   - ${repo.description || '无描述'}\n`;
                markdown += `   - ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 💻 ${repo.language || 'Unknown'}\n`;
                if (repo.topics && repo.topics.length > 0) {
                    markdown += `   - 标签: ${repo.topics.slice(0, 5).join(', ')}\n`;
                }
                markdown += '\n';
            });

            markdown += '---\n\n';
        });

        markdown += `## 📊 总结\n\n`;
        markdown += `本次搜索发现了多个有潜力的新项目，涉及AI、机器学习、前端、区块链等多个技术领域。`;
        markdown += `建议关注这些项目的后续发展动态。\n\n`;
        markdown += `---\n\n*报告生成时间: ${new Date().toLocaleString()}*`;

        return markdown;
    }

    /**
     * 保存搜索结果到数据库
     */
    private async saveSearchResults(results: DailySearchResult[]): Promise<void> {
        const db = await getLowdbDatabase();
        
        try {
            const existingResults = db.get('searchResults').value() || [];
            const newResults = [...existingResults, ...results];
            
            db.set('searchResults', newResults).write();
            console.log(`💾 保存搜索结果: ${results.length}个新建`);
        } catch (error) {
            console.error('保存搜索结果失败:', error);
        }
    }

    /**
     * 延迟方法
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取历史搜索结果
     */
    async getSearchHistory(limit = 10): Promise<DailySearchResult[]> {
        const db = await getLowdbDatabase();
        const results = db.get('searchResults').value() || [];
        return results.slice(-limit);
    }
}
