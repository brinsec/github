import { Low } from 'lowdb';
import { GitHubRepository, Category, RepositoryClassification } from '../../shared/types';
export interface DailySearchRecord {
    id: string;
    searchDate: string;
    searchQuery: string;
    results: GitHubRepository[];
    stats: SearchStats;
    createdAt: string;
    reportPath?: string;
}
export interface SearchStats {
    totalFound: number;
    newlyDiscovered: number;
    averageStars: number;
    topLanguages: Array<{
        name: string;
        count: number;
    }>;
    totalWatchers: number;
    topTopics: Array<{
        name: string;
        count: number;
    }>;
}
export interface AggregatedSearchData {
    period: 'daily' | 'monthly' | 'yearly';
    periodValue: string;
    searchRecords: DailySearchRecord[];
    aggregatedStats: {
        totalSearches: number;
        totalProjectsFound: number;
        totalNewProjects: number;
        averageProjectsPerDay: number;
        topLanguages: Array<{
            name: string;
            totalCount: number;
            averageStars: number;
        }>;
        growthTrend: GrowthTrend[];
    };
}
export interface GrowthTrend {
    period: string;
    projects: number;
    newProjects: number;
    stars: number;
}
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
interface DatabaseSchema {
    repositories: GitHubRepository[];
    categories: Category[];
    repositoryClassifications: RepositoryClassification[];
    discoveredProjects: DiscoveredProject[];
    projectChanges: ProjectChange[];
    dailySearchRecords: DailySearchRecord[];
    searchAggregations: {
        daily: {
            [date: string]: AggregatedSearchData;
        };
        monthly: {
            [month: string]: AggregatedSearchData;
        };
        yearly: {
            [year: string]: AggregatedSearchData;
        };
    };
}
export declare const db: Low<DatabaseSchema>;
export declare function initializeDatabase(): Promise<void>;
export declare function saveRepository(repo: GitHubRepository): Promise<void>;
export declare function getAllRepositories(): Promise<GitHubRepository[]>;
export declare function getAllCategories(): Promise<Category[]>;
export declare function saveRepositoryClassification(classification: RepositoryClassification): Promise<void>;
export declare function getRepositoryClassifications(): Promise<RepositoryClassification[]>;
export declare function clearRepositoryClassifications(): Promise<void>;
export declare function saveDiscoveredProject(project: DiscoveredProject): Promise<void>;
export declare function getAllDiscoveredProjects(): Promise<DiscoveredProject[]>;
export declare function getDiscoveredProjectsByPeriod(period: 'weekly' | 'monthly' | 'quarterly'): Promise<DiscoveredProject[]>;
export declare function getNewProjects(): Promise<DiscoveredProject[]>;
export declare function getProjectsBySource(source: 'trending' | 'search' | 'recommendation'): Promise<DiscoveredProject[]>;
export declare function saveProjectChange(change: ProjectChange): Promise<void>;
export declare function getAllProjectChanges(): Promise<ProjectChange[]>;
export declare function getProjectChangesByProject(projectId: string): Promise<ProjectChange[]>;
export declare function getProjectChangesByType(changeType: string): Promise<ProjectChange[]>;
export declare function getRecentChanges(days?: number): Promise<ProjectChange[]>;
export declare function saveDailySearchRecord(record: DailySearchRecord): Promise<void>;
export declare function getDailySearchRecords(limit?: number): Promise<DailySearchRecord[]>;
export declare function getDailySearchRecordByDate(date: string): Promise<DailySearchRecord[]>;
export declare function getSearchRecordsByDateRange(startDate: string, endDate: string): Promise<DailySearchRecord[]>;
export declare function getMonthlySearchRecords(month: string): Promise<DailySearchRecord[]>;
export declare function getYearlySearchRecords(year: string): Promise<DailySearchRecord[]>;
export declare function saveAggregatedSearchData(period: 'daily' | 'monthly' | 'yearly', periodValue: string, aggregatedData: AggregatedSearchData): Promise<void>;
export declare function getAggregatedSearchData(period: 'daily' | 'monthly' | 'yearly', periodValue: string): Promise<AggregatedSearchData | null>;
export declare function getAllSearchAggregations(period: 'daily' | 'monthly' | 'yearly'): Promise<AggregatedSearchData[]>;
export declare function calculateMonthlyAggregations(yearMonth: string): Promise<AggregatedSearchData>;
export declare function calculateYearlyAggregations(year: string): Promise<AggregatedSearchData>;
export {};
//# sourceMappingURL=database.d.ts.map