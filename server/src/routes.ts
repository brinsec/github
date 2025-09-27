import { Express, Request, Response } from 'express';
import { GitHubService } from './services/githubService';
import { ClassificationService } from './services/classificationService';
import { StatisticsService } from './services/statisticsService';
import { TrendingService } from './services/trendingService';
import { SchedulerService } from './services/schedulerService';
import { ProjectDiscoveryService } from './services/projectDiscoveryService';
import { DailySearchService } from './services/dailySearchService';
import { getAllRepositories, getAllCategories, getAllDiscoveredProjects, getNewProjects, getProjectsBySource } from './database';
import { 
    getDailySearchRecords, 
    getDailySearchRecordByDate, 
    getSearchRecordsByDateRange,
    getMonthlySearchRecords,
    getYearlySearchRecords,
    getAggregatedSearchData,
    getAllSearchAggregations
} from './database';
import { ApiResponse } from '../../shared/types';

export function setupRoutes(app: any): void {
    const githubService = new GitHubService();
    const classificationService = new ClassificationService();
    const statisticsService = new StatisticsService();
    const trendingService = new TrendingService();
    const schedulerService = new SchedulerService();
    const projectDiscoveryService = new ProjectDiscoveryService();
    const dailySearchService = new DailySearchService();

    // 路由级别的CORS处理（简化版）
    app.use((req: any, res: any, next: any) => {
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
    app.get('/api/health', (req: Request, res: Response) => {
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
    app.post('/api/sync/:username', async (req: Request, res: Response) => {
        try {
            const { username } = req.params;
            console.log(`🔄 开始同步用户 ${username} 的starred仓库...`);
            
            const count = await githubService.syncStarredRepositories(username);
            
            const response: ApiResponse<{ count: number }> = {
                success: true,
                data: { count },
                message: `成功同步 ${count} 个仓库`,
            };
            
            res.json(response);
        } catch (error: any) {
            console.error('同步失败:', error.message);
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取所有仓库
    app.get('/api/repositories', async (req: Request, res: Response) => {
        try {
            const repositories = await getAllRepositories();
            const response: ApiResponse<typeof repositories> = {
                success: true,
                data: repositories,
            };
            res.json(response);
        } catch (error: any) {
            console.error('获取仓库列表失败:', error.message);
            const response: ApiResponse<null> = {
                success: false,
                error: error.message || '获取仓库列表失败，数据库连接异常',
            };
            res.status(200).json(response); // 返回200状态码但success: false，前端可处理降级
        }
    });

    // 获取所有分类
    app.get('/api/categories', async (req: Request, res: Response) => {
        try {
            const categories = await getAllCategories();
            const response: ApiResponse<typeof categories> = {
                success: true,
                data: categories,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 执行自动分类
    app.post('/api/classify', async (req: Request, res: Response) => {
        try {
            console.log('🤖 开始执行自动分类...');
            await classificationService.classifyAllRepositories();
            
            const response: ApiResponse<null> = {
                success: true,
                message: '分类完成',
            };
            res.json(response);
        } catch (error: any) {
            console.error('分类失败:', error.message);
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取统计信息  
    app.get('/api/statistics', async (req: Request, res: Response) => {
        try {
            const statistics = await statisticsService.getStatistics();
            const response: ApiResponse<typeof statistics> = {
                success: true,
                data: statistics,
            };
            res.json(response);
        } catch (error: any) {
            console.error('获取统计信息失败:', error.message);
            // 优雅降级到模拟数据或错误
            const response: ApiResponse<null> = {
                success: false,
                error: error.message || '获取统计信息失败，可能GitHub Token未正确配置',
            };
            res.status(200).json(response); // 改为200以避免401错误，前端会检测success字段
        }
    });

    // 获取分类详情
    app.get('/api/categories/:categoryId', async (req: Request, res: Response) => {
        try {
            const { categoryId } = req.params;
            const details = await statisticsService.getCategoryDetails(categoryId);
            const response: ApiResponse<typeof details> = {
                success: true,
                data: details,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取语言统计
    app.get('/api/statistics/languages', async (req: Request, res: Response) => {
        try {
            const languageStats = await statisticsService.getLanguageStats();
            const response: ApiResponse<typeof languageStats> = {
                success: true,
                data: languageStats,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取热门仓库
    app.get('/api/repositories/top', async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const topRepos = await statisticsService.getTopRepositories(limit);
            const response: ApiResponse<typeof topRepos> = {
                success: true,
                data: topRepos,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 搜索仓库
    app.get('/api/search', async (req: Request, res: Response) => {
        try {
            const { q, sort = 'stars' } = req.query;
            if (!q) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '搜索关键词不能为空',
                };
                res.status(400).json(response);
                return;
            }

            const repositories = await githubService.searchRepositories(q as string, sort as string);
            const response: ApiResponse<typeof repositories> = {
                success: true,
                data: repositories,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取用户信息
    app.get('/api/user/:username', async (req: Request, res: Response) => {
        try {
            const { username } = req.params;
            const userInfo = await githubService.getUserInfo(username);
            const response: ApiResponse<typeof userInfo> = {
                success: true,
                data: userInfo,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // ==================== 热门项目相关API ====================

    // 发现周度热门项目
    app.get('/api/trending/weekly', async (req: Request, res: Response) => {
        try {
            const trendingRepos = await trendingService.discoverWeeklyTrending();
            const response: ApiResponse<typeof trendingRepos> = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个周度热门项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 发现月度热门项目
    app.get('/api/trending/monthly', async (req: Request, res: Response) => {
        try {
            const trendingRepos = await trendingService.discoverMonthlyTrending();
            const response: ApiResponse<typeof trendingRepos> = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个月度热门项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 发现季度热门项目
    app.get('/api/trending/quarterly', async (req: Request, res: Response) => {
        try {
            const trendingRepos = await trendingService.discoverQuarterlyTrending();
            const response: ApiResponse<typeof trendingRepos> = {
                success: true,
                data: trendingRepos,
                message: `发现 ${trendingRepos.length} 个季度热门项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取总榜
    app.get('/api/trending/overall', async (req: Request, res: Response) => {
        try {
            const overallRanking = await trendingService.getOverallRanking();
            const response: ApiResponse<typeof overallRanking> = {
                success: true,
                data: overallRanking,
                message: `总榜生成完成，共 ${overallRanking.length} 个项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 自动发现并star热门项目
    app.post('/api/trending/auto-discover/:period', async (req: Request, res: Response) => {
        try {
            const { period } = req.params;
            if (!['weekly', 'monthly', 'quarterly'].includes(period)) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '无效的时间周期，支持: weekly, monthly, quarterly',
                };
                res.status(400).json(response);
                return;
            }

            console.log(`🚀 开始自动发现并star ${period} 热门项目...`);
            const result = await trendingService.autoDiscoverAndStar(period as 'weekly' | 'monthly' | 'quarterly');
            
            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
                message: `自动发现完成: 发现${result.discovered}个，star${result.starred}个，分类${result.classified}个`,
            };
            res.json(response);
        } catch (error: any) {
            console.error('自动发现失败:', error.message);
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 手动star仓库
    app.post('/api/star/:owner/:repo', async (req: Request, res: Response) => {
        try {
            const { owner, repo } = req.params;
            const fullName = `${owner}/${repo}`;
            
            // 先获取仓库信息
            const repoInfo = await githubService.getRepository(fullName);
            if (!repoInfo) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '仓库不存在',
                };
                res.status(404).json(response);
                return;
            }

            // 自动star
            const starred = await trendingService.autoStarRepository(repoInfo);
            
            if (starred) {
                const response: ApiResponse<{ starred: boolean }> = {
                    success: true,
                    data: { starred: true },
                    message: `成功star仓库: ${fullName}`,
                };
                res.json(response);
            } else {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Star仓库失败',
                };
                res.status(500).json(response);
            }
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 启动定时任务
    app.post('/api/scheduler/start', async (req: Request, res: Response) => {
        try {
            schedulerService.startScheduler();
            const response: ApiResponse<null> = {
                success: true,
                message: '定时任务已启动',
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 停止定时任务
    app.post('/api/scheduler/stop', async (req: Request, res: Response) => {
        try {
            schedulerService.stopScheduler();
            const response: ApiResponse<null> = {
                success: true,
                message: '定时任务已停止',
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取调度器状态
    app.get('/api/scheduler/status', async (req: Request, res: Response) => {
        try {
            const status = schedulerService.getStatus();
            const response: ApiResponse<typeof status> = {
                success: true,
                data: status,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 手动执行定时任务
    app.post('/api/scheduler/run/:task', async (req: Request, res: Response) => {
        try {
            const { task } = req.params;
            let result: any = null;

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
                    const response: ApiResponse<null> = {
                        success: false,
                        error: '无效的任务类型',
                    };
                    res.status(400).json(response);
                    return;
            }

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // ==================== 项目发现相关API ====================

    // 获取所有发现的项目
    app.get('/api/discovery/projects', async (req: Request, res: Response) => {
        try {
            const projects = await getAllDiscoveredProjects();
            const response: ApiResponse<typeof projects> = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个发现的项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取新项目
    app.get('/api/discovery/projects/new', async (req: Request, res: Response) => {
        try {
            const projects = await getNewProjects();
            const response: ApiResponse<typeof projects> = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个新项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 根据来源获取项目
    app.get('/api/discovery/projects/source/:source', async (req: Request, res: Response) => {
        try {
            const { source } = req.params;
            const projects = await getProjectsBySource(source as any);
            const response: ApiResponse<typeof projects> = {
                success: true,
                data: projects,
                message: `获取到 ${projects.length} 个${source}项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取发现统计
    app.get('/api/discovery/stats', async (req: Request, res: Response) => {
        try {
            const stats = await projectDiscoveryService.getDiscoveryStats();
            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 开始发现新项目
    app.post('/api/discovery/start', async (req: Request, res: Response) => {
        try {
            const projects = await projectDiscoveryService.discoverNewProjects();
            const response: ApiResponse<typeof projects> = {
                success: true,
                data: projects,
                message: `发现 ${projects.length} 个新项目`,
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // === 搜索数据库相关API ===

    // 获取所有搜索记录
    app.get('/api/search/records', async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 30;
            const records = await getDailySearchRecords(limit);
            
            const response: ApiResponse<typeof records> = {
                success: true,
                data: records
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取某日的搜索记录
    app.get('/api/search/daily/:date', async (req: Request, res: Response) => {
        try {
            const { date } = req.params;
            const records = await getDailySearchRecordByDate(date);
            
            const response: ApiResponse<typeof records> = {
                success: true,
                data: records
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取日期范围搜索记录
    app.get('/api/search/range/:startDate/:endDate', async (req: Request, res: Response) => {
        try {
            const { startDate, endDate } = req.params;
            const records = await getSearchRecordsByDateRange(startDate, endDate);
            
            const response: ApiResponse<typeof records> = {
                success: true,
                data: records
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取月度搜索记录
    app.get('/api/search/monthly/:month', async (req: Request, res: Response) => {
        try {
            const { month } = req.params; // YYYY-MM format
            const records = await getMonthlySearchRecords(month);
            
            const response: ApiResponse<typeof records> = {
                success: true,
                data: records
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取年度搜索记录
    app.get('/api/search/yearly/:year', async (req: Request, res: Response) => {
        try {
            const { year } = req.params; // YYYY format
            const records = await getYearlySearchRecords(year);
            
            const response: ApiResponse<typeof records> = {
                success: true,
                data: records
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取聚合数据 - 按时间维度
    app.get('/api/search/aggregate/:period/:periodValue', async (req: Request, res: Response) => {
        try {
            const { period, periodValue } = req.params as { period: 'daily' | 'monthly' | 'yearly', periodValue: string };
            const aggregatedData = await getAggregatedSearchData(period, periodValue);
            
            const response: ApiResponse<typeof aggregatedData> = {
                success: true,
                data: aggregatedData
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 获取所有聚合数据
    app.get('/api/search/aggregate-all/:period', async (req: Request, res: Response) => {
        try {
            const { period } = req.params as { period: 'daily' | 'monthly' | 'yearly' };
            const aggregatedData = await getAllSearchAggregations(period);
            
            const response: ApiResponse<typeof aggregatedData> = {
                success: true,
                data: aggregatedData
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // === 手动触发搜索相关API ===

    // 手动启动每日搜索
    app.post('/api/search/daily', async (req: Request, res: Response) => {
        try {
            console.log('🚀 手动触发每日搜索...');
            const results = await dailySearchService.performDailySearch();
            
            const response: ApiResponse<typeof results> = {
                success: true,
                data: results,
                message: `成功执行每日搜索，共发现${results.length}个搜索结果`
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });

    // 手动执行特定查询的搜索
    app.post('/api/search/query', async (req: Request, res: Response) => {
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
            
            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
                message: `查询"${query}"完成，找到${result.stats.totalFound}个项目`
            };
            res.json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    });
}
