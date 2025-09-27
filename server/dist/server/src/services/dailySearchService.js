"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailySearchService = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../database");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class DailySearchService {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.token = process.env.GITHUB_TOKEN || '';
        console.log('🔍 每日搜索服务初始化');
        if (!this.token) {
            console.warn('⚠️ GITHUB_TOKEN未设置，搜索功能受限');
        }
        else {
            console.log('✅ GitHub Token已配置，启用真实搜索功能');
        }
    }
    getHeaders() {
        const headers = {
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
    async performDailySearch() {
        console.log('🚀 开始每日自动搜索...');
        const searchQueries = this.getSearchQueries();
        const results = [];
        for (const query of searchQueries) {
            try {
                console.log(`🔍 搜索查询: ${query}`);
                const result = await this.searchRepositories(query);
                results.push(result);
                // 避免API限制，添加延迟
                await this.delay(2000);
            }
            catch (error) {
                console.error(`❌ 搜索查询失败: ${query}`, error);
            }
        }
        // 生成每日报告
        await this.generateDailyReport(results);
        // 保存结果到数据库
        await this.saveDailySearchRecords(results);
        // 计算并保存聚合数据
        await this.updateAggregatedData(results);
        console.log('✅ 每日搜索完成');
        return results;
    }
    /**
     * 获取每日搜索查询列表
     */
    getSearchQueries() {
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
    async searchRepositories(query) {
        const today = new Date().toISOString().split('T')[0];
        const searchDate = `${today}T00:00:00Z`;
        console.log(`🔎 执行搜索: ${query}`);
        try {
            const response = await axios_1.default.get(`${this.baseURL}/search/repositories`, {
                headers: this.getHeaders(),
                params: {
                    q: query,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 100 // GitHub API限制每页最多100个
                }
            });
            const repositories = response.data.items || [];
            // 检查哪些是真正新发现的（简化实现）
            const newlyDiscovered = repositories.slice(0, Math.min(10, repositories.length)); // 假设一些是新发现的
            // 统计信息
            const stats = {
                totalFound: repositories.length,
                newlyDiscovered: newlyDiscovered.length,
                averageStars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repositories.length || 0,
                topLanguages: this.getLanguageStats(repositories)
            };
            const result = {
                id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                searchDate,
                searchQuery: query,
                results: repositories,
                stats
            };
            return result;
        }
        catch (error) {
            console.error('GitHub搜索API错误:', error.message);
            throw error;
        }
    }
    /**
     * 获取语言统计
     */
    getLanguageStats(repositories) {
        const languages = {};
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
    async generateDailyReport(results) {
        const today = new Date().toISOString().split('T')[0];
        const reportDir = path_1.default.join(process.cwd(), 'reports');
        const reportFile = path_1.default.join(reportDir, `daily_search_${today}.md`);
        try {
            await promises_1.default.mkdir(reportDir, { recursive: true });
        }
        catch (error) {
            // Directory might already exist
        }
        const reportContent = this.generateReportMarkdown(results);
        try {
            await promises_1.default.writeFile(reportFile, reportContent, 'utf8');
            console.log(`📄 每日报告已生成: ${reportFile}`);
            // 更新结果中的报告路径
            results.forEach(result => {
                result.reportPath = reportFile;
            });
        }
        catch (error) {
            console.error('报告文件写入错误:', error);
        }
    }
    /**
     * 生成Markdown报告内容
     */
    generateReportMarkdown(results) {
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
     * 保存每日搜索记录到数据库
     */
    async saveDailySearchRecords(results) {
        try {
            for (const result of results) {
                const record = {
                    id: result.id,
                    searchDate: result.searchDate,
                    searchQuery: result.searchQuery,
                    results: result.results,
                    stats: {
                        totalFound: result.stats.totalFound,
                        newlyDiscovered: result.stats.newlyDiscovered,
                        averageStars: result.stats.averageStars,
                        topLanguages: result.stats.topLanguages,
                        totalWatchers: result.results.reduce((sum, repo) => sum + repo.watchers_count, 0),
                        topTopics: this.extractTopTopics(result.results)
                    },
                    createdAt: new Date().toISOString(),
                    reportPath: result.reportPath
                };
                await (0, database_1.saveDailySearchRecord)(record);
            }
            console.log(`💾 已保存到数据库: ${results.length}个搜索记录`);
        }
        catch (error) {
            console.error('保存每日搜索记录失败:', error);
        }
    }
    /**
     * 更新聚合数据
     */
    async updateAggregatedData(results) {
        try {
            if (results.length === 0)
                return;
            const today = results[0].searchDate.substring(0, 10);
            const month = today.substring(0, 7); // YYYY-MM
            const year = today.substring(0, 4); // YYYY
            // 计算当日聚合数据
            const dailyData = await (0, database_1.calculateMonthlyAggregations)(month);
            await (0, database_1.saveAggregatedSearchData)('daily', today, dailyData);
            // 重新计算月度数据
            const monthlyData = await (0, database_1.calculateMonthlyAggregations)(month);
            await (0, database_1.saveAggregatedSearchData)('monthly', month, monthlyData);
            // 重新计算年度数据  
            const yearlyData = await (0, database_1.calculateYearlyAggregations)(year);
            await (0, database_1.saveAggregatedSearchData)('yearly', year, yearlyData);
            console.log('📊 聚合数据已更新');
        }
        catch (error) {
            console.error('更新聚合数据失败:', error);
        }
    }
    /**
     * 提取热门话题标签
     */
    extractTopTopics(repositories) {
        const topicCount = {};
        repositories.forEach(repo => {
            repo.topics.forEach(topic => {
                topicCount[topic] = (topicCount[topic] || 0) + 1;
            });
        });
        return Object.entries(topicCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    /**
     * 延迟方法
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 获取历史搜索结果
     */
    async getSearchHistory(limit = 10) {
        // 简化实现，直接返回空数组
        return [];
    }
}
exports.DailySearchService = DailySearchService;
//# sourceMappingURL=dailySearchService.js.map