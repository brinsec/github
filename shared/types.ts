// GitHub仓库信息类型定义
export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    clone_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    size: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    topics: string[];
    default_branch: string;
    open_issues_count: number;
    archived: boolean;
    disabled: boolean;
    private: boolean;
    fork: boolean;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
    } | null;
    owner: {
        login: string;
        id: number;
        avatar_url: string;
        html_url: string;
    };
}

// 分类信息类型
export interface Category {
    id: string;
    name: string;
    description: string;
    color: string;
    criteria: CategoryCriteria;
}

// 分类标准
export interface CategoryCriteria {
    languages?: string[];
    keywords?: string[];
    topics?: string[];
    minStars?: number;
    maxStars?: number;
    minForks?: number;
    maxForks?: number;
    dateRange?: {
        start: string;
        end: string;
    };
}

// 仓库分类结果
export interface RepositoryClassification {
    repositoryId: number;
    categoryId: string;
    confidence: number;
    reasons: string[];
}

// 统计数据
export interface Statistics {
    totalRepositories: number;
    totalStars: number;
    totalForks: number;
    categoryDistribution: {
        categoryId: string;
        categoryName: string;
        count: number;
        percentage: number;
    }[];
    languageDistribution: {
        language: string;
        count: number;
        percentage: number;
    }[];
    activityStats: {
        period: string;
        repositoriesAdded: number;
        repositoriesUpdated: number;
    }[];
}

// API响应类型
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
