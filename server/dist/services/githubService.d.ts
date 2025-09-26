import { GitHubRepository } from '../../../shared/types';
export declare class GitHubService {
    private baseURL;
    private token;
    constructor();
    private getHeaders;
    getStarredRepositories(username: string): Promise<GitHubRepository[]>;
    getUserInfo(username: string): Promise<any>;
    searchRepositories(query: string, sort?: string): Promise<GitHubRepository[]>;
    syncStarredRepositories(username: string): Promise<number>;
}
//# sourceMappingURL=githubService.d.ts.map