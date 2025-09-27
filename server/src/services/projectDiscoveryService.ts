import axios from 'axios';
import { GitHubRepository } from '../../../shared/types';
import { DiscoveredProject, ProjectChange } from '../database';
import { 
    saveDiscoveredProject, 
    getAllDiscoveredProjects, 
    saveProjectChange,
    getProjectChangesByProject 
} from '../database';

export class ProjectDiscoveryService {
    private githubToken: string;

    constructor() {
        this.githubToken = process.env.GITHUB_TOKEN || '';
        if (!this.githubToken) {
            console.warn('⚠️ GITHUB_TOKEN未设置，将使用模拟数据');
        }
    }

    /**
     * 自动发现新项目
     */
    async discoverNewProjects(): Promise<DiscoveredProject[]> {
        try {
            console.log('🔍 开始自动发现新项目...');
            
            const discoveredProjects: DiscoveredProject[] = [];
            
            // 1. 发现最近创建的项目
            const recentProjects = await this.discoverRecentProjects();
            discoveredProjects.push(...recentProjects);
            
            // 2. 发现快速增长的项目
            const trendingProjects = await this.discoverTrendingProjects();
            discoveredProjects.push(...trendingProjects);
            
            // 3. 发现特定技术栈的新项目
            const techStackProjects = await this.discoverTechStackProjects();
            discoveredProjects.push(...techStackProjects);
            
            // 去重并保存到数据库
            const uniqueProjects = this.removeDuplicates(discoveredProjects);
            await this.saveDiscoveredProjects(uniqueProjects);
            
            console.log(`📈 发现 ${uniqueProjects.length} 个新项目`);
            return uniqueProjects;
            
        } catch (error) {
            console.error('❌ 发现新项目失败:', error);
            throw error;
        }
    }

    /**
     * 发现最近创建的项目
     */
    private async discoverRecentProjects(): Promise<DiscoveredProject[]> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const sinceStr = oneWeekAgo.toISOString().split('T')[0];
            
            const response = await this.searchRepositories({
                q: `created:>${sinceStr} stars:>10`,
                sort: 'created',
                order: 'desc',
                per_page: 30
            });
            
            return response.map(repo => this.mapToDiscoveredProject(repo, 'search', 'weekly'));
        } catch (error) {
            console.warn('发现最近项目失败:', error);
            return [];
        }
    }

    /**
     * 发现快速增长的项目
     */
    private async discoverTrendingProjects(): Promise<DiscoveredProject[]> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const sinceStr = oneWeekAgo.toISOString().split('T')[0];
            
            const response = await this.searchRepositories({
                q: `pushed:>${sinceStr} stars:>50`,
                sort: 'stars',
                order: 'desc',
                per_page: 30
            });
            
            return response.map(repo => this.mapToDiscoveredProject(repo, 'trending', 'weekly'));
        } catch (error) {
            console.warn('发现热门项目失败:', error);
            return [];
        }
    }

    /**
     * 发现特定技术栈的新项目
     */
    private async discoverTechStackProjects(): Promise<DiscoveredProject[]> {
        const techStacks = [
            { language: 'JavaScript', keywords: ['react', 'vue', 'angular', 'node'] },
            { language: 'Python', keywords: ['django', 'flask', 'fastapi', 'tensorflow'] },
            { language: 'TypeScript', keywords: ['typescript', 'ts', 'next', 'nuxt'] },
            { language: 'Go', keywords: ['golang', 'go', 'gin', 'echo'] },
            { language: 'Rust', keywords: ['rust', 'actix', 'tokio', 'serde'] },
        ];
        
        const allProjects: DiscoveredProject[] = [];
        
        for (const stack of techStacks) {
            try {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const sinceStr = oneWeekAgo.toISOString().split('T')[0];
                
                const response = await this.searchRepositories({
                    q: `language:${stack.language} created:>${sinceStr} stars:>5`,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 10
                });
                
                const projects = response.map(repo => 
                    this.mapToDiscoveredProject(repo, 'recommendation', 'weekly')
                );
                allProjects.push(...projects);
                
                // 避免API限制
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.warn(`发现${stack.language}项目失败:`, error);
            }
        }
        
        return allProjects;
    }

    /**
     * 搜索仓库
     */
    private async searchRepositories(params: any): Promise<GitHubRepository[]> {
        if (!this.githubToken) {
            // 返回模拟数据
            return this.getMockRepositories();
        }
        
        try {
            const response = await axios.get('https://api.github.com/search/repositories', {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                params
            });
            
            return response.data.items || [];
        } catch (error) {
            console.warn('GitHub API搜索失败:', error);
            return this.getMockRepositories();
        }
    }

    /**
     * 获取模拟数据
     */
    private getMockRepositories(): GitHubRepository[] {
        return [
            {
                id: Math.floor(Math.random() * 1000000),
                name: 'awesome-new-project',
                full_name: 'developer/awesome-new-project',
                description: 'A brand new awesome project that just got created',
                html_url: 'https://github.com/developer/awesome-new-project',
                language: 'JavaScript',
                stargazers_count: Math.floor(Math.random() * 100) + 10,
                forks_count: Math.floor(Math.random() * 50),
                topics: ['javascript', 'awesome', 'new'],
                created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
                pushed_at: new Date().toISOString(),
                size: Math.floor(Math.random() * 10000),
                default_branch: 'main',
                open_issues_count: Math.floor(Math.random() * 20),
                watchers_count: Math.floor(Math.random() * 100) + 10,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
            }
        ];
    }

    /**
     * 映射为发现的项目
     */
    private mapToDiscoveredProject(
        repo: GitHubRepository, 
        source: 'trending' | 'search' | 'recommendation',
        period: 'weekly' | 'monthly' | 'quarterly'
    ): DiscoveredProject {
        const now = new Date();
        const createdDate = new Date(repo.created_at);
        const isNew = (now.getTime() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7天内创建
        
        return {
            id: repo.id.toString(),
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || '',
            html_url: repo.html_url,
            language: repo.language || '',
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            topics: repo.topics,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            size: repo.size,
            default_branch: repo.default_branch,
            open_issues_count: repo.open_issues_count,
            watchers_count: repo.watchers_count,
            archived: repo.archived,
            disabled: repo.disabled,
            private: repo.private,
            fork: repo.fork,
            license: repo.license || { key: 'none', name: 'No License', spdx_id: 'none', url: '' },
            discovered_at: now.toISOString(),
            discovery_source: source,
            discovery_period: period,
            is_new: isNew,
            growth_rate: this.calculateGrowthRate(repo),
        };
    }

    /**
     * 计算增长率
     */
    private calculateGrowthRate(repo: GitHubRepository): number {
        const createdDate = new Date(repo.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCreation < 1) return 0;
        return Math.round((repo.stargazers_count / daysSinceCreation) * 100) / 100;
    }

    /**
     * 去重
     */
    private removeDuplicates(projects: DiscoveredProject[]): DiscoveredProject[] {
        const seen = new Set<string>();
        return projects.filter(project => {
            if (seen.has(project.full_name)) {
                return false;
            }
            seen.add(project.full_name);
            return true;
        });
    }

    /**
     * 保存发现的项目
     */
    private async saveDiscoveredProjects(projects: DiscoveredProject[]): Promise<void> {
        for (const project of projects) {
            try {
                await saveDiscoveredProject(project);
                
                // 记录项目变化
                await this.recordProjectChange(project);
            } catch (error) {
                console.error(`保存项目失败 ${project.full_name}:`, error);
            }
        }
    }

    /**
     * 记录项目变化
     */
    private async recordProjectChange(project: DiscoveredProject): Promise<void> {
        const change: ProjectChange = {
            id: `${project.id}_${Date.now()}`,
            project_id: project.id,
            change_type: 'new',
            old_value: 0,
            new_value: project.stargazers_count,
            change_amount: project.stargazers_count,
            change_percentage: 100,
            recorded_at: new Date().toISOString(),
            period: 'daily',
        };
        
        await saveProjectChange(change);
    }

    /**
     * 获取发现的项目统计
     */
    async getDiscoveryStats(): Promise<any> {
        try {
            const allProjects = await getAllDiscoveredProjects();
            const newProjects = allProjects.filter(p => p.is_new);
            const recentChanges = await getProjectChangesByProject('all');
            
            return {
                totalDiscovered: allProjects.length,
                newProjects: newProjects.length,
                recentChanges: recentChanges.length,
                bySource: {
                    trending: allProjects.filter(p => p.discovery_source === 'trending').length,
                    search: allProjects.filter(p => p.discovery_source === 'search').length,
                    recommendation: allProjects.filter(p => p.discovery_source === 'recommendation').length,
                },
                byPeriod: {
                    weekly: allProjects.filter(p => p.discovery_period === 'weekly').length,
                    monthly: allProjects.filter(p => p.discovery_period === 'monthly').length,
                    quarterly: allProjects.filter(p => p.discovery_period === 'quarterly').length,
                }
            };
        } catch (error) {
            console.error('获取发现统计失败:', error);
            throw error;
        }
    }
}
