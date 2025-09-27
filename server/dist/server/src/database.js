"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.saveRepository = saveRepository;
exports.getAllRepositories = getAllRepositories;
exports.getAllCategories = getAllCategories;
exports.saveRepositoryClassification = saveRepositoryClassification;
exports.getRepositoryClassifications = getRepositoryClassifications;
exports.clearRepositoryClassifications = clearRepositoryClassifications;
exports.saveDiscoveredProject = saveDiscoveredProject;
exports.getAllDiscoveredProjects = getAllDiscoveredProjects;
exports.getDiscoveredProjectsByPeriod = getDiscoveredProjectsByPeriod;
exports.getNewProjects = getNewProjects;
exports.getProjectsBySource = getProjectsBySource;
exports.saveProjectChange = saveProjectChange;
exports.getAllProjectChanges = getAllProjectChanges;
exports.getProjectChangesByProject = getProjectChangesByProject;
exports.getProjectChangesByType = getProjectChangesByType;
exports.getRecentChanges = getRecentChanges;
exports.saveDailySearchRecord = saveDailySearchRecord;
exports.getDailySearchRecords = getDailySearchRecords;
exports.getDailySearchRecordByDate = getDailySearchRecordByDate;
exports.getSearchRecordsByDateRange = getSearchRecordsByDateRange;
exports.getMonthlySearchRecords = getMonthlySearchRecords;
exports.getYearlySearchRecords = getYearlySearchRecords;
exports.saveAggregatedSearchData = saveAggregatedSearchData;
exports.getAggregatedSearchData = getAggregatedSearchData;
exports.getAllSearchAggregations = getAllSearchAggregations;
exports.calculateMonthlyAggregations = calculateMonthlyAggregations;
exports.calculateYearlyAggregations = calculateYearlyAggregations;
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_PATH = process.env.DATABASE_PATH || './data/github_repos.json';
// 确保数据目录存在
const dbDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
// 初始化数据库
const adapter = new node_1.JSONFile(DB_PATH);
const defaultData = {
    repositories: [],
    categories: [],
    repositoryClassifications: [],
    discoveredProjects: [],
    projectChanges: [],
    dailySearchRecords: [],
    searchAggregations: {
        daily: {},
        monthly: {},
        yearly: {}
    },
};
exports.db = new lowdb_1.Low(adapter, defaultData);
async function initializeDatabase() {
    await exports.db.read();
    // 如果数据库为空，插入默认分类
    if (exports.db.data.categories.length === 0) {
        await insertDefaultCategories();
    }
}
async function insertDefaultCategories() {
    const defaultCategories = [
        {
            id: 'frontend',
            name: '前端开发',
            description: '前端框架、库和工具',
            color: '#3B82F6',
            criteria: {
                languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
                keywords: ['react', 'vue', 'angular', 'frontend', 'ui', 'component'],
                topics: ['frontend', 'javascript', 'typescript', 'react', 'vue', 'angular'],
            },
        },
        {
            id: 'backend',
            name: '后端开发',
            description: '后端框架、API和服务',
            color: '#10B981',
            criteria: {
                languages: ['Python', 'Java', 'Go', 'Node.js', 'C#', 'PHP', 'Ruby'],
                keywords: ['backend', 'api', 'server', 'framework', 'database'],
                topics: ['backend', 'api', 'server', 'framework'],
            },
        },
        {
            id: 'mobile',
            name: '移动开发',
            description: '移动应用开发框架和工具',
            color: '#F59E0B',
            criteria: {
                languages: ['Swift', 'Kotlin', 'Dart', 'Java', 'Objective-C'],
                keywords: ['mobile', 'ios', 'android', 'flutter', 'react-native'],
                topics: ['mobile', 'ios', 'android', 'flutter', 'react-native'],
            },
        },
        {
            id: 'devops',
            name: 'DevOps工具',
            description: '部署、监控和运维工具',
            color: '#8B5CF6',
            criteria: {
                keywords: ['docker', 'kubernetes', 'ci', 'cd', 'deploy', 'monitor'],
                topics: ['devops', 'docker', 'kubernetes', 'ci-cd', 'deployment'],
            },
        },
        {
            id: 'ai-ml',
            name: '人工智能/机器学习',
            description: 'AI/ML框架和算法',
            color: '#EF4444',
            criteria: {
                languages: ['Python', 'R', 'Julia'],
                keywords: ['ai', 'machine-learning', 'deep-learning', 'tensorflow', 'pytorch'],
                topics: ['machine-learning', 'deep-learning', 'ai', 'tensorflow', 'pytorch'],
            },
        },
        {
            id: 'game',
            name: '游戏开发',
            description: '游戏引擎和开发工具',
            color: '#EC4899',
            criteria: {
                languages: ['C++', 'C#', 'JavaScript', 'Lua'],
                keywords: ['game', 'unity', 'unreal', 'engine', 'gamedev'],
                topics: ['game', 'unity', 'unreal-engine', 'gamedev'],
            },
        },
        {
            id: 'learning',
            name: '学习资源',
            description: '教程、文档和示例代码',
            color: '#06B6D4',
            criteria: {
                keywords: ['tutorial', 'example', 'demo', 'learning', 'course'],
                topics: ['tutorial', 'example', 'learning', 'documentation'],
            },
        },
    ];
    exports.db.data.categories = defaultCategories;
    await exports.db.write();
}
async function saveRepository(repo) {
    await exports.db.read();
    const existingIndex = exports.db.data.repositories.findIndex(r => r.id === repo.id);
    if (existingIndex >= 0) {
        exports.db.data.repositories[existingIndex] = repo;
    }
    else {
        exports.db.data.repositories.push(repo);
    }
    await exports.db.write();
}
async function getAllRepositories() {
    await exports.db.read();
    return exports.db.data.repositories.sort((a, b) => b.stargazers_count - a.stargazers_count);
}
async function getAllCategories() {
    await exports.db.read();
    return exports.db.data.categories;
}
async function saveRepositoryClassification(classification) {
    await exports.db.read();
    const existingIndex = exports.db.data.repositoryClassifications.findIndex(rc => rc.repositoryId === classification.repositoryId && rc.categoryId === classification.categoryId);
    if (existingIndex >= 0) {
        exports.db.data.repositoryClassifications[existingIndex] = classification;
    }
    else {
        exports.db.data.repositoryClassifications.push(classification);
    }
    await exports.db.write();
}
async function getRepositoryClassifications() {
    await exports.db.read();
    return exports.db.data.repositoryClassifications;
}
async function clearRepositoryClassifications() {
    await exports.db.read();
    exports.db.data.repositoryClassifications = [];
    await exports.db.write();
}
// ==================== 发现项目相关操作 ====================
async function saveDiscoveredProject(project) {
    await exports.db.read();
    if (!exports.db.data) {
        throw new Error('数据库未初始化');
    }
    // 确保 discoveredProjects 数组存在
    if (!exports.db.data.discoveredProjects) {
        exports.db.data.discoveredProjects = [];
    }
    const existingIndex = exports.db.data.discoveredProjects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
        exports.db.data.discoveredProjects[existingIndex] = project;
    }
    else {
        exports.db.data.discoveredProjects.push(project);
    }
    await exports.db.write();
}
async function getAllDiscoveredProjects() {
    await exports.db.read();
    return exports.db.data?.discoveredProjects || [];
}
async function getDiscoveredProjectsByPeriod(period) {
    await exports.db.read();
    const projects = exports.db.data?.discoveredProjects || [];
    return projects.filter(p => p.discovery_period === period);
}
async function getNewProjects() {
    await exports.db.read();
    const projects = exports.db.data?.discoveredProjects || [];
    return projects.filter(p => p.is_new);
}
async function getProjectsBySource(source) {
    await exports.db.read();
    const projects = exports.db.data?.discoveredProjects || [];
    return projects.filter(p => p.discovery_source === source);
}
// ==================== 项目变化相关操作 ====================
async function saveProjectChange(change) {
    await exports.db.read();
    if (!exports.db.data) {
        throw new Error('数据库未初始化');
    }
    // 确保 projectChanges 数组存在
    if (!exports.db.data.projectChanges) {
        exports.db.data.projectChanges = [];
    }
    exports.db.data.projectChanges.push(change);
    await exports.db.write();
}
async function getAllProjectChanges() {
    await exports.db.read();
    return exports.db.data?.projectChanges || [];
}
async function getProjectChangesByProject(projectId) {
    await exports.db.read();
    const changes = exports.db.data?.projectChanges || [];
    return changes.filter(c => c.project_id === projectId);
}
async function getProjectChangesByType(changeType) {
    await exports.db.read();
    const changes = exports.db.data?.projectChanges || [];
    return changes.filter(c => c.change_type === changeType);
}
async function getRecentChanges(days = 7) {
    await exports.db.read();
    const changes = exports.db.data?.projectChanges || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return changes.filter(c => new Date(c.recorded_at) >= cutoffDate);
}
// === 每日搜索记录相关函数 ===
async function saveDailySearchRecord(record) {
    await exports.db.read();
    if (!exports.db.data.dailySearchRecords) {
        exports.db.data.dailySearchRecords = [];
    }
    exports.db.data.dailySearchRecords.push(record);
    await exports.db.write();
}
async function getDailySearchRecords(limit = 30) {
    const records = await exports.db.read().then(() => exports.db.data.dailySearchRecords || []);
    return records.sort((a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime())
        .slice(0, limit);
}
async function getDailySearchRecordByDate(date) {
    const records = await exports.db.read().then(() => exports.db.data.dailySearchRecords || []);
    return records.filter(record => record.searchDate === date);
}
async function getSearchRecordsByDateRange(startDate, endDate) {
    const records = await exports.db.read().then(() => exports.db.data.dailySearchRecords || []);
    return records.filter(record => record.searchDate >= startDate && record.searchDate <= endDate);
}
async function getMonthlySearchRecords(month) {
    const records = await exports.db.read().then(() => exports.db.data.dailySearchRecords || []);
    return records.filter(record => record.searchDate.startsWith(month));
}
async function getYearlySearchRecords(year) {
    const records = await exports.db.read().then(() => exports.db.data.dailySearchRecords || []);
    return records.filter(record => record.searchDate.startsWith(year));
}
// === 搜索聚合数据相关函数 ===
async function saveAggregatedSearchData(period, periodValue, aggregatedData) {
    await exports.db.read();
    if (!exports.db.data.searchAggregations) {
        exports.db.data.searchAggregations = { daily: {}, monthly: {}, yearly: {} };
    }
    exports.db.data.searchAggregations[period][periodValue] = aggregatedData;
    await exports.db.write();
}
async function getAggregatedSearchData(period, periodValue) {
    await exports.db.read();
    if (!exports.db.data.searchAggregations) {
        return null;
    }
    return exports.db.data.searchAggregations[period][periodValue] || null;
}
async function getAllSearchAggregations(period) {
    await exports.db.read();
    if (!exports.db.data.searchAggregations) {
        return [];
    }
    return Object.values(exports.db.data.searchAggregations[period]);
}
// 计算月度聚合数据
async function calculateMonthlyAggregations(yearMonth) {
    const records = await getMonthlySearchRecords(yearMonth);
    const stats = {
        totalSearches: records.length,
        totalProjectsFound: records.reduce((sum, record) => sum + record.stats.totalFound, 0),
        totalNewProjects: records.reduce((sum, record) => sum + record.stats.newlyDiscovered, 0),
        averageProjectsPerDay: records.length > 0 ? records.reduce((sum, record) => sum + record.stats.totalFound, 0) / records.length : 0,
        topLanguages: aggregateLanguages(records),
        growthTrend: calculateGrowthTrend(records)
    };
    return {
        period: 'monthly',
        periodValue: yearMonth,
        searchRecords: records,
        aggregatedStats: stats
    };
}
// 计算年度聚合数据
async function calculateYearlyAggregations(year) {
    const records = await getYearlySearchRecords(year);
    const stats = {
        totalSearches: records.length,
        totalProjectsFound: records.reduce((sum, record) => sum + record.stats.totalFound, 0),
        totalNewProjects: records.reduce((sum, record) => sum + record.stats.newlyDiscovered, 0),
        averageProjectsPerDay: records.length > 0 ? records.reduce((sum, record) => sum + record.stats.totalFound, 0) / records.length : 0,
        topLanguages: aggregateLanguages(records),
        growthTrend: calculateGrowthTrend(records)
    };
    return {
        period: 'yearly',
        periodValue: year,
        searchRecords: records,
        aggregatedStats: stats
    };
}
function aggregateLanguages(records) {
    const languageMap = {};
    records.forEach(record => {
        record.stats.topLanguages.forEach(lang => {
            if (!languageMap[lang.name]) {
                languageMap[lang.name] = { totalCount: 0, stars: [] };
            }
            languageMap[lang.name].totalCount += lang.count;
            // 计算平均stars（这里简化处理）
            const repos = record.results.filter(repo => repo.language === lang.name);
            repos.forEach(repo => {
                languageMap[lang.name].stars.push(repo.stargazers_count);
            });
        });
    });
    return Object.entries(languageMap)
        .map(([name, data]) => ({
        name,
        totalCount: data.totalCount,
        averageStars: data.stars.length > 0 ? data.stars.reduce((sum, stars) => sum + stars, 0) / data.stars.length : 0
    }))
        .sort((a, b) => b.totalCount - a.totalCount);
}
function calculateGrowthTrend(records) {
    return records.map(record => ({
        period: record.searchDate,
        projects: record.stats.totalFound,
        newProjects: record.stats.newlyDiscovered,
        stars: record.stats.averageStars * record.stats.totalFound
    }));
}
//# sourceMappingURL=database.js.map