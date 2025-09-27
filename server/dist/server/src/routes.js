"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const githubService_1 = require("./services/githubService");
const classificationService_1 = require("./services/classificationService");
const statisticsService_1 = require("./services/statisticsService");
const trendingService_1 = require("./services/trendingService");
const schedulerService_1 = require("./services/schedulerService");
const projectDiscoveryService_1 = require("./services/projectDiscoveryService");
const dailySearchService_1 = require("./services/dailySearchService");
const database_1 = require("./database");
const database_2 = require("./database");
function setupRoutes(app) {
    const githubService = new githubService_1.GitHubService();
    const classificationService = new classificationService_1.ClassificationService();
    const statisticsService = new statisticsService_1.StatisticsService();
    const trendingService = new trendingService_1.TrendingService();
    const schedulerService = new schedulerService_1.SchedulerService();
    const projectDiscoveryService = new projectDiscoveryService_1.ProjectDiscoveryService();
    const dailySearchService = new dailySearchService_1.DailySearchService();
    // 路由级别的CORS处理（简化版）
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        // 确保CORS头部设置
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'false');
        if (req.method === 'OPTIONS') {
            return res.status(200).json({ success: true });
        }
        next();
    });
    // 简化的响应中间件（移除复杂的拦截器）
    // 健康检查端点
    app.get('/api/health', (req, res) => {
        const origin = req.headers.origin;
        console.log('🏥 健康检查请求:', origin);
        const responseData = {
            success: true,
            message: 'GitHub自动化系统运行正常',
            origin: origin,
            cors_enabled: true,
            vercel_env: !!process.env.VERCEL,
            github_token_set: !!process.env.GITHUB_TOKEN,
            timestamp: new Date().toISOString(),
            api_status: 'online'
        };
        res.status(200).json(responseData);
    });
    // 同步用户starred仓库
    app.post('/api/sync/:username', async (req, res) => {
        try {
            const { username } = req.params;
            console.log(`🔄 开始同步用户 ${username} 的starred仓库...`);
            const count = await githubService.syncStarredRepositories(username);
            const response = {
                success: true,
                data: { count },
                message: `成功同步 ${count} 个仓库`,
            };
            res.json(response);
        }
        catch (error) {
            console.error('同步失败:', error.message);
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取所有仓库
    app.get('/api/repositories', async (req, res) => {
        try {
            const repositories = await (0, database_1.getAllRepositories)();
            const response = {
                success: true,
                data: repositories,
            };
            res.json(response);
        }
        catch (error) {
            console.error('获取仓库列表失败:', error.message);
            const response = {
                success: false,
                error: error.message || '获取仓库列表失败，数据库连接异常',
            };
            res.status(200).json(response); // 返回200状态码但success: false，前端可处理降级
        }
    });
    // 获取所有分类
    app.get('/api/categories', async (req, res) => {
        try {
            const categories = await (0, database_1.getAllCategories)();
            const response = {
                success: true,
                data: categories,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 执行自动分类
    app.post('/api/classify', async (req, res) => {
        try {
            console.log('🤖 开始执行自动分类...');
            await classificationService.classifyAllRepositories();
            const response = {
                success: true,
                message: '分类完成',
            };
            res.json(response);
        }
        catch (error) {
            console.error('分类失败:', error.message);
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取统计信息  
    app.get('/api/statistics', async (req, res) => {
        try {
            const statistics = await statisticsService.getStatistics();
            const response = {
                success: true,
                data: statistics,
            };
            res.json(response);
        }
        catch (error) {
            console.error('获取统计信息失败:', error.message);
            // 优雅降级到模拟数据或错误
            const response = {
                success: false,
                error: error.message || '获取统计信息失败，可能GitHub Token未正确配置',
            };
            res.status(200).json(response); // 改为200以避免401错误，前端会检测success字段
        }
    });
    // 获取分类详情
    app.get('/api/categories/:categoryId', async (req, res) => {
        try {
            const { categoryId } = req.params;
            const details = await statisticsService.getCategoryDetails(categoryId);
            const response = {
                success: true,
                data: details,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取语言统计
    app.get('/api/statistics/languages', async (req, res) => {
        try {
            const languageStats = await statisticsService.getLanguageStats();
            const response = {
                success: true,
                data: languageStats,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取热门仓库
    app.get('/api/repositories/top', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const topRepos = await statisticsService.getTopRepositories(limit);
            const response = {
                success: true,
                data: topRepos,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 搜索仓库
    app.get('/api/search', async (req, res) => {
        try {
            const { q, sort = 'stars' } = req.query;
            if (!q) {
                const response = {
                    success: false,
                    error: '搜索关键词不能为空',
                };
                res.status(400).json(response);
                return;
            }
            const repositories = await githubService.searchRepositories(q, sort);
            const response = {
                success: true,
                data: repositories,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取用户信息
    app.get('/api/user/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const userInfo = await githubService.getUserInfo(username);
            const response = {
                success: true,
                data: userInfo,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // ==================== 热门项目相关API ====================
    // 发现周度热门项目
    app.get('/api/trending/weekly', async (req, res) => {
        try {
            const trendingRepos = await trendingService.discoverWeeklyTrending();
            const response = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个周度热门项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 发现月度热门项目
    app.get('/api/trending/monthly', async (req, res) => {
        try {
            const trendingRepos = await trendingService.discoverMonthlyTrending();
            const response = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个月度热门项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 发现季度热门项目
    app.get('/api/trending/quarterly', async (req, res) => {
        try {
            const trendingRepos = await trendingService.discoverQuarterlyTrending();
            const response = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个季度热门项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取总榜
    app.get('/api/trending/overall', async (req, res) => {
        try {
            const overallRanking = await trendingService.getOverallRanking();
            const response = {
                success: true,
                data: overallRanking,
                message: `总榜生成完成，共 ${overallRanking.length} 个项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 自动发现并star热门项目
    app.post('/api/trending/auto-discover/:period', async (req, res) => {
        try {
            const { period } = req.params;
            if (!['weekly', 'monthly', 'quarterly'].includes(period)) {
                const response = {
                    success: false,
                    error: '无效的时间周期，支持: weekly, monthly, quarterly',
                };
                res.status(400).json(response);
                return;
            }
            console.log(`🚀 开始自动发现并star ${period} 热门项目...`);
            const result = await trendingService.autoDiscoverAndStar(period);
            const response = {
                success: true,
                data: result,
                message: `自动发现完成: 发现${result.discovered}个，star${result.starred}个，分类${result.classified}个`,
            };
            res.json(response);
        }
        catch (error) {
            console.error('自动发现失败:', error.message);
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 手动star仓库
    app.post('/api/star/:owner/:repo', async (req, res) => {
        try {
            const { owner, repo } = req.params;
            const fullName = `${owner}/${repo}`;
            // 先获取仓库信息
            const repoInfo = await githubService.getRepository(fullName);
            if (!repoInfo) {
                const response = {
                    success: false,
                    error: '仓库不存在',
                };
                res.status(404).json(response);
                return;
            }
            // 自动star
            const starred = await trendingService.autoStarRepository(repoInfo);
            if (starred) {
                const response = {
                    success: true,
                    data: { starred: true },
                    message: `成功star仓库: ${fullName}`,
                };
                res.json(response);
            }
            else {
                const response = {
                    success: false,
                    error: 'Star仓库失败',
                };
                res.status(500).json(response);
            }
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 启动定时任务
    app.post('/api/scheduler/start', async (req, res) => {
        try {
            schedulerService.startScheduler();
            const response = {
                success: true,
                message: '定时任务已启动',
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 停止定时任务
    app.post('/api/scheduler/stop', async (req, res) => {
        try {
            schedulerService.stopScheduler();
            const response = {
                success: true,
                message: '定时任务已停止',
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取调度器状态
    app.get('/api/scheduler/status', async (req, res) => {
        try {
            const status = schedulerService.getStatus();
            const response = {
                success: true,
                data: status,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 手动执行定时任务
    app.post('/api/scheduler/run/:task', async (req, res) => {
        try {
            const { task } = req.params;
            let result = null;
            switch (task) {
                case 'daily':
                    await schedulerService.runDailyTrendingDiscovery();
                    result = { task: 'daily', message: '每日热门项目发现任务已执行' };
                    break;
                case 'weekly':
                    await schedulerService.runWeeklyTrendingDiscovery();
                    result = { task: 'weekly', message: '周度热门项目发现任务已执行' };
                    break;
                case 'monthly':
                    await schedulerService.runMonthlyTrendingDiscovery();
                    result = { task: 'monthly', message: '月度热门项目发现任务已执行' };
                    break;
                case 'quarterly':
                    await schedulerService.runQuarterlyTrendingDiscovery();
                    result = { task: 'quarterly', message: '季度热门项目发现任务已执行' };
                    break;
                default:
                    const response = {
                        success: false,
                        error: '无效的任务类型',
                    };
                    res.status(400).json(response);
                    return;
            }
            const response = {
                success: true,
                data: result,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // ==================== 项目发现相关API ====================
    // 获取所有发现的项目
    app.get('/api/discovery/projects', async (req, res) => {
        try {
            const projects = await (0, database_1.getAllDiscoveredProjects)();
            const response = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个发现的项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取新项目
    app.get('/api/discovery/projects/new', async (req, res) => {
        try {
            const projects = await (0, database_1.getNewProjects)();
            const response = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个新项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 根据来源获取项目
    app.get('/api/discovery/projects/source/:source', async (req, res) => {
        try {
            const { source } = req.params;
            const projects = await (0, database_1.getProjectsBySource)(source);
            const response = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个${source}项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取发现统计
    app.get('/api/discovery/stats', async (req, res) => {
        try {
            const stats = await projectDiscoveryService.getDiscoveryStats();
            const response = {
                success: true,
                data: stats,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 开始发现新项目
    app.post('/api/discovery/start', async (req, res) => {
        try {
            const projects = await projectDiscoveryService.discoverNewProjects();
            const response = {
                success: true,
                data: projects,
                message: `发现 ${projects.length} 个新项目`,
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // === 搜索数据库相关API ===
    // 获取所有搜索记录
    app.get('/api/search/records', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 30;
            const records = await (0, database_2.getDailySearchRecords)(limit);
            const response = {
                success: true,
                data: records
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取某日的搜索记录
    app.get('/api/search/daily/:date', async (req, res) => {
        try {
            const { date } = req.params;
            const records = await (0, database_2.getDailySearchRecordByDate)(date);
            const response = {
                success: true,
                data: records
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取日期范围搜索记录
    app.get('/api/search/range/:startDate/:endDate', async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const records = await (0, database_2.getSearchRecordsByDateRange)(startDate, endDate);
            const response = {
                success: true,
                data: records
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取月度搜索记录
    app.get('/api/search/monthly/:month', async (req, res) => {
        try {
            const { month } = req.params; // YYYY-MM format
            const records = await (0, database_2.getMonthlySearchRecords)(month);
            const response = {
                success: true,
                data: records
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取年度搜索记录
    app.get('/api/search/yearly/:year', async (req, res) => {
        try {
            const { year } = req.params; // YYYY format
            const records = await (0, database_2.getYearlySearchRecords)(year);
            const response = {
                success: true,
                data: records
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取聚合数据 - 按时间维度
    app.get('/api/search/aggregate/:period/:periodValue', async (req, res) => {
        try {
            const { period, periodValue } = req.params;
            const aggregatedData = await (0, database_2.getAggregatedSearchData)(period, periodValue);
            const response = {
                success: true,
                data: aggregatedData
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 获取所有聚合数据
    app.get('/api/search/aggregate-all/:period', async (req, res) => {
        try {
            const { period } = req.params;
            const aggregatedData = await (0, database_2.getAllSearchAggregations)(period);
            const response = {
                success: true,
                data: aggregatedData
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // === 手动触发搜索相关API ===
    // 手动启动每日搜索
    app.post('/api/search/daily', async (req, res) => {
        try {
            console.log('🚀 手动触发每日搜索...');
            const results = await dailySearchService.performDailySearch();
            const response = {
                success: true,
                data: results,
                message: `成功执行每日搜索，共发现${results.length}个搜索结果`
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
    // 手动执行特定查询的搜索
    app.post('/api/search/query', async (req, res) => {
        try {
            const { query } = req.body;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: '请提供搜索查询'
                });
            }
            // 执行单次搜索查询
            const result = await dailySearchService.searchRepositories(query);
            const response = {
                success: true,
                data: result,
                message: `查询"${query}"完成，找到${result.stats.totalFound}个项目`
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
}
//# sourceMappingURL=routes.js.map