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
export interface Category {
    id: string;
    name: string;
    description: string;
    color: string;
    criteria: CategoryCriteria;
}
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
export interface RepositoryClassification {
    repositoryId: number;
    categoryId: string;
    confidence: number;
    reasons: string[];
}
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
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=types.d.ts.map