import { useState, useEffect } from 'react';
import { 
    Star, 
    GitFork, 
    ExternalLink, 
    Search, 
    Calendar,
    Code,
} from 'lucide-react';
import { GitHubRepository, ApiResponse } from '../../../shared/types';
import api from '../services/api';
import { format } from 'date-fns';

export default function Repositories() {
    const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated'>('stars');

    useEffect(() => {
        loadRepositories();
    }, []);

    const loadRepositories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            try {
                // 首先尝试真实API
                const response = await api.get<ApiResponse<GitHubRepository[]>>('/repositories');
                if (response.data.success && response.data.data) {
                    setRepositories(response.data.data);
                    return;
                }
            } catch (apiError) {
                console.error('API请求失败，回退到模拟数据:', apiError);
            }
            
            // 回退到模拟数据
            try {
                // 模拟当地开发仓库数据
                const mockRepos: GitHubRepository[] = [
                    {
                        id: 1,
                        name: 'sample-project',
                        full_name: 'user/sample-project',
                        description: '示例项目描述',
                        html_url: 'https://github.com/user/sample-project',
                        clone_url: 'https://github.com/user/sample-project.git',
                        language: 'JavaScript',
                        stargazers_count: 25,
                        forks_count: 5,
                        watchers_count: 25,
                        size: 15000,
                        pushed_at: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        topics: ['javascript', 'demo'],
                        default_branch: 'main',
                        open_issues_count: 3,
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
                        owner: {
                            login: 'user',
                            id: 1,
                            avatar_url: 'https://github.com/user.png',
                            html_url: 'https://github.com/user'
                        }
                    },
                    {
                        id: 2,
                        name: 'another-project',
                        full_name: 'user/another-project',
                        description: '另一个项目',
                        html_url: 'https://github.com/user/another-project',
                        clone_url: 'https://github.com/user/another-project.git',
                        language: 'TypeScript',
                        stargazers_count: 50,
                        forks_count: 10,
                        watchers_count: 50,
                        size: 25000,
                        pushed_at: new Date(Date.now() - 86400000).toISOString(),
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        updated_at: new Date().toISOString(),
                        topics: ['typescript', 'example'],
                        default_branch: 'main',
                        open_issues_count: 7,
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
                        owner: {
                            login: 'user',
                            id: 1,
                            avatar_url: 'https://github.com/user.png',
                            html_url: 'https://github.com/user'
                        }
                    }
                ];
                setRepositories(mockRepos);
                console.log('✅ 已加载模拟仓库数据');
            } catch (mockError) {
                console.error('模拟数据加载失败:', mockError);
                setError('无法连接到服务器，模拟数据加载失败');
            }
        } catch (err: any) {
            console.error('获取仓库列表完全失败:', err);
            setError('系统暂时不可用');
        } finally {
            setLoading(false);
        }
    };

    const filteredRepositories = repositories
        .filter(repo => {
            const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                repo.full_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLanguage = !languageFilter || repo.language === languageFilter;
            return matchesSearch && matchesLanguage;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'stars':
                    return b.stargazers_count - a.stargazers_count;
                case 'forks':
                    return b.forks_count - a.forks_count;
                case 'updated':
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                default:
                    return 0;
            }
        });

    const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))].sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">仓库管理</h1>
                <p className="mt-1 text-sm text-gray-500">管理你的GitHub starred仓库</p>
            </div>

            {/* 搜索和筛选 */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索仓库名称或描述..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="input"
                        >
                            <option value="">所有语言</option>
                            {languages.map(lang => (
                                <option key={lang} value={lang || ''}>{lang}</option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="input"
                        >
                            <option value="stars">按Stars排序</option>
                            <option value="forks">按Forks排序</option>
                            <option value="updated">按更新时间排序</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 仓库列表 */}
            <div className="space-y-4">
                {filteredRepositories.length === 0 ? (
                    <div className="text-center py-12">
                        <Code className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到仓库</h3>
                        <p className="mt-1 text-sm text-gray-500">尝试调整搜索条件或同步更多仓库</p>
                    </div>
                ) : (
                    filteredRepositories.map((repo) => (
                        <div key={repo.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {repo.name}
                                        </h3>
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {repo.full_name}
                                    </p>
                                    {repo.description && (
                                        <p className="text-gray-600 mt-2">{repo.description}</p>
                                    )}
                                    
                                    <div className="flex items-center space-x-6 mt-4">
                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                            <Star className="h-4 w-4" />
                                            <span>{repo.stargazers_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                            <GitFork className="h-4 w-4" />
                                            <span>{repo.forks_count.toLocaleString()}</span>
                                        </div>
                                        {repo.language && (
                                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span>{repo.language}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>更新于 {format(new Date(repo.updated_at), 'yyyy-MM-dd')}</span>
                                        </div>
                                    </div>

                                    {repo.topics && repo.topics.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {repo.topics.slice(0, 5).map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                            {repo.topics.length > 5 && (
                                                <span className="text-xs text-gray-500">
                                                    +{repo.topics.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 统计信息 */}
            <div className="text-sm text-gray-500 text-center">
                显示 {filteredRepositories.length} / {repositories.length} 个仓库
            </div>
        </div>
    );
}
