import { useState, useEffect } from 'react';
import { 
    Github, 
    Star, 
    GitFork, 
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Statistics, ApiResponse } from '../../../shared/types';
import api from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

export default function Dashboard() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<ApiResponse<Statistics>>('/statistics');
            if (response.data.success && response.data.data) {
                setStatistics(response.data.data);
            } else {
                setError(response.data.error || '获取统计信息失败');
            }
        } catch (err: any) {
            setError(err.message || '获取统计信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!username.trim()) {
            setError('请输入GitHub用户名');
            return;
        }

        try {
            setSyncing(true);
            setError(null);
            const response = await api.post<ApiResponse<{ count: number }>>(`/sync/${username}`);
            
            if (response.data.success) {
                // 同步完成后执行分类
                await api.post<ApiResponse<null>>('/classify');
                // 重新加载统计信息
                await loadStatistics();
                alert(`成功同步 ${response.data.data?.count || 0} 个仓库并完成分类！`);
            } else {
                setError(response.data.error || '同步失败');
            }
        } catch (err: any) {
            setError(err.message || '同步失败');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">加载中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">错误</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
                    <p className="mt-1 text-sm text-gray-500">GitHub自动化系统概览</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="GitHub用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input w-48"
                    />
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="btn btn-primary flex items-center"
                    >
                        {syncing ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Github className="h-4 w-4 mr-2" />
                        )}
                        {syncing ? '同步中...' : '同步仓库'}
                    </button>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Github className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总仓库数</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics?.totalRepositories.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总Stars</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics?.totalStars.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <GitFork className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总Forks</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics?.totalForks.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 分类分布饼图 */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">分类分布</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statistics?.categoryDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {(statistics?.categoryDistribution || []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 语言分布柱状图 */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">编程语言分布</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statistics?.languageDistribution.slice(0, 10) || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="language" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 活动统计 */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statistics?.activityStats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <p className="text-sm text-gray-500">{stat.period}</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stat.repositoriesAdded}
                            </p>
                            <p className="text-xs text-gray-400">新增仓库</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
