// 模拟API服务，用于GitHub Pages环境
export const mockApi = {
    // 模拟统计数据
    getStatistics: () => Promise.resolve({
        data: {
            success: true,
            data: {
                totalRepositories: 25,
                totalCategories: 5,
                totalStars: 1250,
                categoryDistribution: [
                    { name: '前端开发', count: 8 },
                    { name: '后端开发', count: 6 },
                    { name: '工具库', count: 5 },
                    { name: '学习项目', count: 4 },
                    { name: '其他', count: 2 }
                ],
                languageStats: [
                    { name: 'JavaScript', count: 12 },
                    { name: 'TypeScript', count: 8 },
                    { name: 'Python', count: 3 },
                    { name: 'Go', count: 2 }
                ],
                topRepositories: [
                    {
                        id: 1,
                        name: 'awesome-project',
                        full_name: 'user/awesome-project',
                        description: '一个很棒的项目',
                        stargazers_count: 150,
                        forks_count: 25,
                        language: 'JavaScript',
                        html_url: 'https://github.com/user/awesome-project'
                    }
                ]
            }
        }
    }),

    // 模拟定时任务状态
    getSchedulerStatus: () => Promise.resolve({
        data: {
            success: true,
            data: {
                isRunning: false,
                lastRun: new Date().toISOString(),
                nextRun: new Date(Date.now() + 3600000).toISOString(),
                tasks: [
                    { name: 'trending-discovery', enabled: true, schedule: '0 */6 * * *' },
                    { name: 'new-project-discovery', enabled: true, schedule: '0 10 * * *' }
                ]
            }
        }
    }),

    // 模拟热门项目数据
    getTrendingRepositories: (_period: string) => Promise.resolve({
        data: {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'trending-project',
                    full_name: 'user/trending-project',
                    description: '当前热门的项目',
                    stargazers_count: 500,
                    forks_count: 50,
                    language: 'TypeScript',
                    html_url: 'https://github.com/user/trending-project',
                    topics: ['typescript', 'react', 'frontend']
                }
            ]
        }
    }),

    // 模拟项目发现数据
    getDiscoveredProjects: () => Promise.resolve({
        data: {
            success: true,
            data: [
                {
                    id: '1',
                    name: 'new-project',
                    full_name: 'user/new-project',
                    description: '新发现的项目',
                    stargazers_count: 100,
                    forks_count: 10,
                    language: 'JavaScript',
                    html_url: 'https://github.com/user/new-project',
                    topics: ['javascript', 'nodejs'],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    pushed_at: new Date().toISOString(),
                    size: 15000,
                    default_branch: 'main',
                    open_issues_count: 5,
                    watchers_count: 100,
                    archived: false,
                    disabled: false,
                    private: false,
                    fork: false,
                    license: {
                        key: 'mit',
                        name: 'MIT License',
                        spdx_id: 'MIT',
                        url: 'https://api.github.com/licenses/mit'
                    },
                    discovered_at: new Date().toISOString(),
                    discovery_source: 'trending' as const,
                    discovery_period: 'weekly' as const,
                    is_new: true,
                    growth_rate: 25.5,
                    previous_stars: 80
                },
                {
                    id: '2',
                    name: 'another-project',
                    full_name: 'user/another-project',
                    description: '另一个新发现的项目',
                    stargazers_count: 250,
                    forks_count: 30,
                    language: 'TypeScript',
                    html_url: 'https://github.com/user/another-project',
                    topics: ['typescript', 'react'],
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    updated_at: new Date().toISOString(),
                    pushed_at: new Date().toISOString(),
                    size: 25000,
                    default_branch: 'main',
                    open_issues_count: 12,
                    watchers_count: 250,
                    archived: false,
                    disabled: false,
                    private: false,
                    fork: false,
                    license: {
                        key: 'mit',
                        name: 'MIT License',
                        spdx_id: 'MIT',
                        url: 'https://api.github.com/licenses/mit'
                    },
                    discovered_at: new Date().toISOString(),
                    discovery_source: 'search' as const,
                    discovery_period: 'monthly' as const,
                    is_new: false,
                    growth_rate: 15.2,
                    previous_stars: 200
                }
            ]
        }
    })
};
