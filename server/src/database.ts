import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { GitHubRepository, Category, RepositoryClassification } from '../../shared/types';

// 发现的项目类型
export interface DiscoveredProject {
    id: string;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    default_branch: string;
    open_issues_count: number;
    watchers_count: number;
    archived: boolean;
    disabled: boolean;
    private: boolean;
    fork: boolean;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
    };
    discovered_at: string;
    discovery_source: 'trending' | 'search' | 'recommendation';
    discovery_period: 'weekly' | 'monthly' | 'quarterly';
    is_new: boolean;
    growth_rate: number;
    previous_stars?: number;
}

// 项目变化记录
export interface ProjectChange {
    id: string;
    project_id: string;
    change_type: 'stars' | 'forks' | 'watchers' | 'issues' | 'updated' | 'new';
    old_value: number | string;
    new_value: number | string;
    change_amount: number;
    change_percentage: number;
    recorded_at: string;
    period: 'daily' | 'weekly' | 'monthly';
}

const DB_PATH = process.env.DATABASE_PATH || './data/github_repos.json';

// 确保数据目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库结构
interface DatabaseSchema {
    repositories: GitHubRepository[];
    categories: Category[];
    repositoryClassifications: RepositoryClassification[];
    discoveredProjects: DiscoveredProject[];
    projectChanges: ProjectChange[];
}

// 初始化数据库
const adapter = new JSONFile<DatabaseSchema>(DB_PATH);
const defaultData: DatabaseSchema = {
    repositories: [],
    categories: [],
    repositoryClassifications: [],
    discoveredProjects: [],
    projectChanges: [],
};

export const db = new Low(adapter, defaultData);

export async function initializeDatabase(): Promise<void> {
    await db.read();
    
    // 如果数据库为空，插入默认分类
    if (db.data.categories.length === 0) {
        await insertDefaultCategories();
    }
}

async function insertDefaultCategories(): Promise<void> {
    const defaultCategories: Category[] = [
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

    db.data.categories = defaultCategories;
    await db.write();
}

export async function saveRepository(repo: GitHubRepository): Promise<void> {
    await db.read();
    
    const existingIndex = db.data.repositories.findIndex(r => r.id === repo.id);
    if (existingIndex >= 0) {
        db.data.repositories[existingIndex] = repo;
    } else {
        db.data.repositories.push(repo);
    }
    
    await db.write();
}

export async function getAllRepositories(): Promise<GitHubRepository[]> {
    await db.read();
    return db.data.repositories.sort((a, b) => b.stargazers_count - a.stargazers_count);
}

export async function getAllCategories(): Promise<Category[]> {
    await db.read();
    return db.data.categories;
}

export async function saveRepositoryClassification(classification: RepositoryClassification): Promise<void> {
    await db.read();
    
    const existingIndex = db.data.repositoryClassifications.findIndex(
        rc => rc.repositoryId === classification.repositoryId && rc.categoryId === classification.categoryId
    );
    
    if (existingIndex >= 0) {
        db.data.repositoryClassifications[existingIndex] = classification;
    } else {
        db.data.repositoryClassifications.push(classification);
    }
    
    await db.write();
}

export async function getRepositoryClassifications(): Promise<RepositoryClassification[]> {
    await db.read();
    return db.data.repositoryClassifications;
}

export async function clearRepositoryClassifications(): Promise<void> {
    await db.read();
    db.data.repositoryClassifications = [];
    await db.write();
}

// ==================== 发现项目相关操作 ====================

export async function saveDiscoveredProject(project: DiscoveredProject): Promise<void> {
    await db.read();
    if (!db.data) {
        throw new Error('数据库未初始化');
    }
    
    // 确保 discoveredProjects 数组存在
    if (!db.data.discoveredProjects) {
        db.data.discoveredProjects = [];
    }
    
    const existingIndex = db.data.discoveredProjects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
        db.data.discoveredProjects[existingIndex] = project;
    } else {
        db.data.discoveredProjects.push(project);
    }
    
    await db.write();
}

export async function getAllDiscoveredProjects(): Promise<DiscoveredProject[]> {
    await db.read();
    return db.data?.discoveredProjects || [];
}

export async function getDiscoveredProjectsByPeriod(period: 'weekly' | 'monthly' | 'quarterly'): Promise<DiscoveredProject[]> {
    await db.read();
    const projects = db.data?.discoveredProjects || [];
    return projects.filter(p => p.discovery_period === period);
}

export async function getNewProjects(): Promise<DiscoveredProject[]> {
    await db.read();
    const projects = db.data?.discoveredProjects || [];
    return projects.filter(p => p.is_new);
}

export async function getProjectsBySource(source: 'trending' | 'search' | 'recommendation'): Promise<DiscoveredProject[]> {
    await db.read();
    const projects = db.data?.discoveredProjects || [];
    return projects.filter(p => p.discovery_source === source);
}

// ==================== 项目变化相关操作 ====================

export async function saveProjectChange(change: ProjectChange): Promise<void> {
    await db.read();
    if (!db.data) {
        throw new Error('数据库未初始化');
    }
    
    // 确保 projectChanges 数组存在
    if (!db.data.projectChanges) {
        db.data.projectChanges = [];
    }
    
    db.data.projectChanges.push(change);
    await db.write();
}

export async function getAllProjectChanges(): Promise<ProjectChange[]> {
    await db.read();
    return db.data?.projectChanges || [];
}

export async function getProjectChangesByProject(projectId: string): Promise<ProjectChange[]> {
    await db.read();
    const changes = db.data?.projectChanges || [];
    return changes.filter(c => c.project_id === projectId);
}

export async function getProjectChangesByType(changeType: string): Promise<ProjectChange[]> {
    await db.read();
    const changes = db.data?.projectChanges || [];
    return changes.filter(c => c.change_type === changeType);
}

export async function getRecentChanges(days: number = 7): Promise<ProjectChange[]> {
    await db.read();
    const changes = db.data?.projectChanges || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return changes.filter(c => new Date(c.recorded_at) >= cutoffDate);
}