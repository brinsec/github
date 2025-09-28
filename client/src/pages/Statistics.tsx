import { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Download,
    RefreshCw,
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Statistics as StatsType, ApiResponse } from '../../../shared/types';
import api from '../services/api';
import { mockApi } from '../services/mockApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

export default function Statistics() {
    const [statistics, setStatistics] = useState<StatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            
            try {
                // 首先尝试真实API
                const response = await api.get<ApiResponse<StatsType>>('/statistics');
                if (response.data.success && response.data.data) {
                    setStatistics(response.data.data);
                    return;
                }
            } catch (apiError) {
                console.error('API请求失败，回退到模拟数据:', apiError);
            }
            
            // 回退到模拟数据
            try {
                const mockResponse = await mockApi.getStatistics();
                if (mockResponse.data.success && mockResponse.data.data) {
                    setStatistics(mockResponse.data.data);
                    console.log('✅ 已加载模拟统计数据');
                } else {
                    throw new Error('模拟数据加载失败');
                }
            } catch (mockError) {
                console.error('模拟数据加载失败:', mockError);
                setError('无法连接到服务器，模拟数据加载失败');
            }
        } catch (err: any) {
            console.error('获取统计信息完全失败:', err);
            setError('系统暂时不可用');
        } finally {
            setLoading(false);
        }
    };

    const exportData = () => {
        if (!statistics) return;
        
        const dataStr = JSON.stringify(statistics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'github-statistics.json';
        link.click();
        URL.revokeObjectURL(url);
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
                <div className="text-sm text-red-700">{error}</div>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无数据</h3>
                <p className="mt-1 text-sm text-gray-500">请先同步一些仓库数据</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
                    <p className="mt-1 text-sm text-gray-500">详细的仓库统计数据和分析</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="input"
                    >
                        <option value="7d">最近7天</option>
                        <option value="30d">最近30天</option>
                        <option value="90d">最近90天</option>
                    </select>
                    <button
                        onClick={exportData}
                        className="btn btn-secondary flex items-center"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        导出数据
                    </button>
                    <button
                        onClick={loadStatistics}
                        className="btn btn-primary flex items-center"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        刷新
                    </button>
                </div>
            </div>

            {/* 概览统计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总仓库数</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics.totalRepositories.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总Stars</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics.totalStars.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">总Forks</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics.totalForks.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">活跃分类</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {statistics.categoryDistribution.filter(c => c.count > 0).length}
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
                                    data={statistics.categoryDistribution.filter(c => c.count > 0)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {statistics.categoryDistribution.filter(c => c.count > 0).map((_, index) => (
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">编程语言Top 10</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statistics.languageDistribution.slice(0, 10)}>
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

            {/* 详细统计表格 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 分类详细统计 */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">分类详细统计</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        分类名称
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        仓库数量
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        占比
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statistics.categoryDistribution.map((category) => (
                                    <tr key={category.categoryId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {category.categoryName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.percentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 语言详细统计 */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">语言详细统计</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        编程语言
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        仓库数量
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        占比
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statistics.languageDistribution.slice(0, 10).map((language) => (
                                    <tr key={language.language}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {language.language}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {language.count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {language.percentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 活动趋势 */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">活动趋势</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={statistics.activityStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="repositoriesAdded" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                name="新增仓库"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
