"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const trendingService_1 = require("./trendingService");
const projectDiscoveryService_1 = require("./projectDiscoveryService");
const dailySearchService_1 = require("./dailySearchService");
class SchedulerService {
    constructor() {
        this.isRunning = false;
        this.trendingService = new trendingService_1.TrendingService();
        this.projectDiscoveryService = new projectDiscoveryService_1.ProjectDiscoveryService();
        this.dailySearchService = new dailySearchService_1.DailySearchService();
    }
    /**
     * 启动定时任务
     */
    startScheduler() {
        console.log('⏰ 启动定时任务调度器...');
        // 每天凌晨2点执行周度热门项目发现
        node_cron_1.default.schedule('0 2 * * *', async () => {
            console.log('🕐 执行每日热门项目发现任务...');
            await this.runDailyTrendingDiscovery();
        });
        // 每周一凌晨3点执行周度热门项目发现
        node_cron_1.default.schedule('0 3 * * 1', async () => {
            console.log('🕐 执行周度热门项目发现任务...');
            await this.runWeeklyTrendingDiscovery();
        });
        // 每月1号凌晨4点执行月度热门项目发现
        node_cron_1.default.schedule('0 4 1 * *', async () => {
            console.log('🕐 执行月度热门项目发现任务...');
            await this.runMonthlyTrendingDiscovery();
        });
        // 每季度第一天凌晨5点执行季度热门项目发现
        node_cron_1.default.schedule('0 5 1 1,4,7,10 *', async () => {
            console.log('🕐 执行季度热门项目发现任务...');
            await this.runQuarterlyTrendingDiscovery();
        });
        // 每天6点执行每日搜索任务
        node_cron_1.default.schedule('0 6 * * *', async () => {
            console.log('🕐 执行每日搜索任务...');
            await this.runDailySearch();
        });
        // 每6小时执行一次新项目发现
        node_cron_1.default.schedule('0 */6 * * *', async () => {
            console.log('🕐 执行新项目发现任务...');
            await this.runNewProjectDiscovery();
        });
        // 每天上午10点执行深度项目发现
        node_cron_1.default.schedule('0 10 * * *', async () => {
            console.log('🕐 执行深度项目发现任务...');
            await this.runDeepProjectDiscovery();
        });
        console.log('✅ 定时任务调度器已启动');
    }
    /**
     * 停止定时任务
     */
    stopScheduler() {
        console.log('⏹️ 停止定时任务调度器...');
        node_cron_1.default.getTasks().forEach(task => task.stop());
        this.isRunning = false;
        console.log('✅ 定时任务调度器已停止');
    }
    /**
     * 手动执行每日热门项目发现
     */
    async runDailyTrendingDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行每日热门项目发现...');
            const result = await this.trendingService.autoDiscoverAndStar('weekly');
            console.log('✅ 每日热门项目发现完成:', result);
        }
        catch (error) {
            console.error('❌ 每日热门项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 手动执行周度热门项目发现
     */
    async runWeeklyTrendingDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行周度热门项目发现...');
            const result = await this.trendingService.autoDiscoverAndStar('weekly');
            console.log('✅ 周度热门项目发现完成:', result);
        }
        catch (error) {
            console.error('❌ 周度热门项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 手动执行月度热门项目发现
     */
    async runMonthlyTrendingDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行月度热门项目发现...');
            const result = await this.trendingService.autoDiscoverAndStar('monthly');
            console.log('✅ 月度热门项目发现完成:', result);
        }
        catch (error) {
            console.error('❌ 月度热门项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 手动执行季度热门项目发现
     */
    async runQuarterlyTrendingDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行季度热门项目发现...');
            const result = await this.trendingService.autoDiscoverAndStar('quarterly');
            console.log('✅ 季度热门项目发现完成:', result);
        }
        catch (error) {
            console.error('❌ 季度热门项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 手动执行新项目发现
     */
    async runNewProjectDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行新项目发现...');
            const result = await this.projectDiscoveryService.discoverNewProjects();
            console.log('✅ 新项目发现完成:', result.length, '个项目');
        }
        catch (error) {
            console.error('❌ 新项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 手动执行深度项目发现
     */
    async runDeepProjectDiscovery() {
        if (this.isRunning) {
            console.log('⏳ 任务正在运行中，跳过本次执行');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行深度项目发现...');
            const result = await this.projectDiscoveryService.discoverNewProjects();
            console.log('✅ 深度项目发现完成:', result.length, '个项目');
        }
        catch (error) {
            console.error('❌ 深度项目发现失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 执行每日搜索任务
     */
    async runDailySearch() {
        if (this.isRunning) {
            console.log('📋 其他任务正在进行中，跳过本次每日搜索');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 开始执行每日搜索...');
            const results = await this.dailySearchService.performDailySearch();
            console.log('✅ 每日搜索完成:', results.length, '个搜索结果');
        }
        catch (error) {
            console.error('❌ 每日搜索失败:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * 获取调度器状态
     */
    getStatus() {
        const tasks = node_cron_1.default.getTasks();
        return {
            isRunning: this.isRunning,
            tasks: Array.from(tasks.keys()),
        };
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=schedulerService.js.map