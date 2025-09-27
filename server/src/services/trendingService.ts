import axios from 'axios';
import { GitHubRepository } from '../../../shared/types';
import { saveRepository } from '../database';
import { ClassificationService } from './classificationService';
import { MockTrendingService } from './mockTrendingService';

export class TrendingService {
    private githubService: any;
    private classificationService: ClassificationService;
    private mockService: MockTrendingService;

    constructor() {
        this.classificationService = new ClassificationService();
        this.mockService = new MockTrendingService();
    }

    /**
     * 发现一周内上升最快的项目
     */
    async discoverWeeklyTrending(): Promise<GitHubRepository[]> {
        try {
            console.log('🔍 开始发现一周内热门项目...');
            
            // 获取一周前的时间
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            // 搜索最近一周创建或更新的项目，按stars排序
            const trendingRepos = await this.searchTrendingRepositories(oneWeekAgo);
            
            // 如果API限制或没有数据，使用模拟数据
            if (trendingRepos.length === 0) {
                console.log('📊 使用模拟数据展示周度热门项目');
                return this.mockService.getWeeklyTrending();
            }
            
            console.log(`📈 发现 ${trendingRepos.length} 个热门项目`);
            return trendingRepos;
        } catch (error) {
            console.error('❌ 发现热门项目失败，使用模拟数据:', error);
            return this.mockService.getWeeklyTrending();
        }
    }

    /**
     * 发现一个月内上升最快的项目
     */
    async discoverMonthlyTrending(): Promise<GitHubRepository[]> {
        try {
            console.log('🔍 开始发现一个月内热门项目...');
            
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            const trendingRepos = await this.searchTrendingRepositories(oneMonthAgo);
            
            // 如果API限制或没有数据，使用模拟数据
            if (trendingRepos.length === 0) {
                console.log('📊 使用模拟数据展示月度热门项目');
                return this.mockService.getMonthlyTrending();
            }
            
            console.log(`📈 发现 ${trendingRepos.length} 个月度热门项目`);
            return trendingRepos;
        } catch (error) {
            console.error('❌ 发现月度热门项目失败，使用模拟数据:', error);
            return this.mockService.getMonthlyTrending();
        }
    }

    /**
     * 发现一个季度内上升最快的项目
     */
    async discoverQuarterlyTrending(): Promise<GitHubRepository[]> {
        try {
            console.log('🔍 开始发现一个季度内热门项目...');
            
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            const trendingRepos = await this.searchTrendingRepositories(threeMonthsAgo);
            
            // 如果API限制或没有数据，使用模拟数据
            if (trendingRepos.length === 0) {
                console.log('📊 使用模拟数据展示季度热门项目');
                return this.mockService.getQuarterlyTrending();
            }
            
            console.log(`📈 发现 ${trendingRepos.length} 个季度热门项目`);
            return trendingRepos;
        } catch (error) {
            console.error('❌ 发现季度热门项目失败，使用模拟数据:', error);
            return this.mockService.getQuarterlyTrending();
        }
    }

    /**
     * 获取总榜 - 综合所有时间段的热门项目
     */
    async getOverallRanking(): Promise<GitHubRepository[]> {
        try {
            console.log('🏆 开始生成总榜...');
            
            // 获取所有时间段的数据
            const [weekly, monthly, quarterly] = await Promise.all([
                this.discoverWeeklyTrending(),
                this.discoverMonthlyTrending(),
                this.discoverQuarterlyTrending()
            ]);

            // 合并所有项目
            const allRepos = [...weekly, ...monthly, ...quarterly];
            
            // 去重并按stars排序
            const uniqueRepos = this.removeDuplicates(allRepos);
            const sortedRepos = uniqueRepos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 100); // 返回前100个

            console.log(`🏆 总榜生成完成，共 ${sortedRepos.length} 个项目`);
            return sortedRepos;
        } catch (error) {
            console.error('❌ 生成总榜失败，使用模拟数据:', error);
            // 如果出错，返回模拟的总榜数据
            return this.mockService.getOverallRanking();
        }
    }

    /**
     * 搜索热门仓库
     */
    private async searchTrendingRepositories(since: Date): Promise<GitHubRepository[]> {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GitHub Token未设置');
        }

        const sinceStr = since.toISOString().split('T')[0];
        const trendingRepos: GitHubRepository[] = [];

        try {
            // 减少搜索查询数量，避免API限制
            const searchQueries = [
                'stars:>100 created:>' + sinceStr,
                'stars:>50 pushed:>' + sinceStr,
            ];

            for (const query of searchQueries) {
                try {
                    const response = await axios.get('https://api.github.com/search/repositories', {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                        },
                        params: {
                            q: query,
                            sort: 'stars',
                            order: 'desc',
                            per_page: 50, // 增加每页数量，减少请求次数
                        },
                    });

                    if (response.data && response.data.items) {
                        const repos = response.data.items.map((item: any) => this.mapToGitHubRepository(item));
                        trendingRepos.push(...repos);
                    }

                    // 增加延迟，避免API限制
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    console.warn(`搜索查询失败: ${query}`, error);
                    // 如果遇到API限制，返回空数组而不是抛出错误
                    if ((error as any).response && (error as any).response.status === 403) {
                        console.log('GitHub API速率限制，返回空结果');
                        return [];
                    }
                }
            }

            // 去重并按stars排序
            const uniqueRepos = this.removeDuplicates(trendingRepos);
            return uniqueRepos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 50); // 返回前50个

        } catch (error) {
            console.error('搜索热门仓库失败:', error);
            // 如果遇到API限制，返回空数组而不是抛出错误
            if ((error as any).response && (error as any).response.status === 403) {
                console.log('GitHub API速率限制，返回空结果');
                return [];
            }
            throw error;
        }
    }

    /**
     * 自动star仓库
     */
    async autoStarRepository(repo: GitHubRepository): Promise<boolean> {
        try {
            const token = process.env.GITHUB_TOKEN;
            if (!token) {
                throw new Error('GitHub Token未设置');
            }

            console.log(`⭐ 正在star仓库: ${repo.full_name}`);

            const response = await axios.put(
                `https://api.github.com/user/starred/${repo.full_name}`,
                {},
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                }
            );

            if (response.status === 204) {
                console.log(`✅ 成功star仓库: ${repo.full_name}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`❌ Star仓库失败: ${repo.full_name}`, error);
            return false;
        }
    }

    /**
     * 自动发现并star热门项目
     */
    async autoDiscoverAndStar(period: 'weekly' | 'monthly' | 'quarterly'): Promise<{
        discovered: number;
        starred: number;
        classified: number;
        repositories: GitHubRepository[];
    }> {
        try {
            console.log(`🚀 开始自动发现并star ${period} 热门项目...`);

            let trendingRepos: GitHubRepository[];
            switch (period) {
                case 'weekly':
                    trendingRepos = await this.discoverWeeklyTrending();
                    break;
                case 'monthly':
                    trendingRepos = await this.discoverMonthlyTrending();
                    break;
                case 'quarterly':
                    trendingRepos = await this.discoverQuarterlyTrending();
                    break;
                default:
                    throw new Error('无效的时间周期');
            }

            let starredCount = 0;
            let classifiedCount = 0;

            // 自动star前20个最热门的项目
            const topRepos = trendingRepos.slice(0, 20);
            
            for (const repo of topRepos) {
                try {
                    // 保存仓库信息
                    await saveRepository(repo);
                    
                    // 自动star
                    const starred = await this.autoStarRepository(repo);
                    if (starred) {
                        starredCount++;
                    }

                    // 自动分类
                    try {
                        const categories = await import('../database').then(m => m.getAllCategories());
                        await this.classificationService.classifyRepository(repo, categories);
                        classifiedCount++;
                    } catch (error) {
                        console.warn(`分类失败: ${repo.full_name}`, error);
                    }

                    // 避免API限制
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    console.error(`处理仓库失败: ${repo.full_name}`, error);
                }
            }

            console.log(`✅ 自动发现完成: 发现${trendingRepos.length}个，star${starredCount}个，分类${classifiedCount}个`);

            return {
                discovered: trendingRepos.length,
                starred: starredCount,
                classified: classifiedCount,
                repositories: topRepos,
            };
        } catch (error) {
            console.error('❌ 自动发现并star失败:', error);
            throw error;
        }
    }

    /**
     * 将GitHub API响应映射为GitHubRepository对象
     */
    private mapToGitHubRepository(item: any): GitHubRepository {
        return {
            id: item.id,
            name: item.name,
            full_name: item.full_name,
            description: item.description || '',
            html_url: item.html_url,
            language: item.language,
            stargazers_count: item.stargazers_count,
            forks_count: item.forks_count,
            topics: item.topics || [],
            created_at: item.created_at,
            updated_at: item.updated_at,
            pushed_at: item.pushed_at,
            size: item.size,
            default_branch: item.default_branch,
            open_issues_count: item.open_issues_count,
            watchers_count: item.watchers_count,
            archived: item.archived,
            disabled: item.disabled,
            private: item.private,
            fork: item.fork,
            license: item.license ? {
                key: item.license.key,
                name: item.license.name,
                spdx_id: item.license.spdx_id,
                url: item.license.url,
            } : null,
        };
    }

    /**
     * 去重仓库
     */
    private removeDuplicates(repos: GitHubRepository[]): GitHubRepository[] {
        const seen = new Set<number>();
        return repos.filter(repo => {
            if (seen.has(repo.id)) {
                return false;
            }
            seen.add(repo.id);
            return true;
        });
    }
}
