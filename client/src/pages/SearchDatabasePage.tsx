import { useState, useEffect } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { 
    Calendar, 
    Clock, 
    TrendingUp, 
    Search,
    Filter
} from 'lucide-react';
import api from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

interface SearchRecord {
    id: string;
    searchDate: string;
    searchQuery: string;
    results: any[];
    stats: {
        totalFound: number;
        newlyDiscovered: number;
        averageStars: number;
        topLanguages: Array<{ name: string; count: number }>;
    };
}

interface AggregatedData {
    period: 'daily' | 'monthly' | 'yearly';
    periodValue: string;
    aggregatedStats: {
        totalSearches: number;
        totalProjectsFound: number;
        totalNewProjects: number;
        averageProjectsPerDay: number;
        topLanguages: Array<{ name: string; totalCount: number; averageStars: number }>;
        growthTrend: Array<{
            period: string;
            projects: number;
            newProjects: number;
            stars: number;
        }>;
    };
}

const SearchDatabasePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'daily' | 'monthly' | 'yearly' | 'range'>('daily');
    const [currentPeriod, setCurrentPeriod] = useState<string>('');
    const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);
    const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    useEffect(() => {
        fetchData();
    }, [timeFilter, currentPeriod]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (timeFilter === 'daily' && currentPeriod) {
                // 获取某日的数据
                const response = await api.get(`/search/daily/${currentPeriod}`);
                if (response.data.success) {
                    setSearchRecords(response.data.data);
                }
            } else if (timeFilter === 'monthly' && currentPeriod) {
                // 获取某月的数据
                const [recordsResponse, aggregateResponse] = await Promise.all([
                    api.get(`/search/monthly/${currentPeriod}`),
                    api.get(`/search/aggregate/monthly/${currentPeriod}`)
                ]);
                
                if (recordsResponse.data.success) {
                    setSearchRecords(recordsResponse.data.data);
                }
                if (aggregateResponse.data.success && aggregateResponse.data.data) {
                    setAggregatedData(aggregateResponse.data.data);
                }
            } else if (timeFilter === 'yearly' && currentPeriod) {
                // 获取某年的数据
                const [recordsResponse, aggregateResponse] = await Promise.all([
                    api.get(`/search/yearly/${currentPeriod}`),
                    api.get(`/search/aggregate/yearly/${currentPeriod}`)
                ]);
                
                if (recordsResponse.data.success) {
                    setSearchRecords(recordsResponse.data.data);
                }
                if (aggregateResponse.data.success && aggregateResponse.data.data) {
                    setAggregatedData(aggregateResponse.data.data);
                }
            } else if (timeFilter === 'range' && dateRange.start && dateRange.end) {
                // 获取日期范围内的数据
                const response = await api.get(`/search/range/${dateRange.start}/${dateRange.end}`);
                if (response.data.success) {
                    setSearchRecords(response.data.data);
                }
            } else {
                // 获取最近的数据
                const response = await api.get('/search/records');
                if (response.data.success) {
                    setSearchRecords(response.data.data);
                }
            }
        } catch (error) {
            console.error('获取搜索数据失败:', error);
            setSearchRecords([]);
            setAggregatedData(null);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentPeriod = () => {
        const now = new Date();
        switch (timeFilter) {
            case 'daily':
                return now.toISOString().split('T')[0]; // YYYY-MM-DD
            case 'monthly':
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            case 'yearly':
                return String(now.getFullYear());
            default:
                return '';
        }
    };

    useEffect(() => {
        if (!currentPeriod) {
            setCurrentPeriod(getCurrentPeriod());
        }
    }, [timeFilter]);

    const formatPeriodValue = (period: string, filter: string) => {
        switch (filter) {
            case 'daily':
                return new Date(period).toLocaleDateString();
            case 'monthly':
                return `${period.split('-')[1]}月 ${period.split('-')[0]}年`;
            case 'yearly':
                return `${period}年`;
            default:
                return period;
        }
    };

    const getTimeFilterOptions = () => {
        return [
            { value: 'daily', label: '每日' },
            { value: 'monthly', label: '每月' },
            { value: 'yearly', label: '每年' },
            { value: 'range', label: '自定义范围' }
        ] as const;
    };

    const getChartData = () => {
        if (searchRecords.length === 0) return [];

        return searchRecords.map(record => ({
            date: record.searchDate,
            projects: record.stats.totalFound,
            newProjects: record.stats.newlyDiscovered,
            averageStars: record.stats.averageStars
        }));
    };

    const getLanguageData = () => {
        if (!aggregatedData) return [];
        
        return aggregatedData.aggregatedStats.topLanguages
            .slice(0, 10)
            .map(lang => ({
                name: lang.name,
                count: lang.totalCount,
                stars: lang.averageStars
            }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 头部 */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Search className="h-7 w-7 mr-3 text-blue-600" />
                                搜索数据库
                            </h1>
                            
                            <div className="flex items-center space-x-4">
                                <select 
                                    value={timeFilter} 
                                    onChange={e => setTimeFilter(e.target.value as 'daily' | 'monthly' | 'yearly' | 'range')}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {getTimeFilterOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                
                                {timeFilter === 'range' ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="border border-gray-300 rounded-md px-3 py-2"
                                        />
                                        <span>至</span>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                ) : timeFilter !== 'daily' ? (
                                    <input
                                        type={timeFilter === 'yearly' ? 'text' : timeFilter === 'monthly' ? 'month' : 'date'}
                                        value={currentPeriod}
                                        onChange={e => setCurrentPeriod(e.target.value)}
                                        placeholder={timeFilter === 'yearly' ? 'YYYY' : timeFilter === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD'}
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : null}
                                
                                <button 
                                    onClick={fetchData}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    刷新
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white shadow rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">加载搜索数据中...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 搜索记录总览 */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {formatPeriodValue(currentPeriod, timeFilter)} 搜索结果数据
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">搜索记录总数</p>
                                            <p className="text-2xl font-bold text-gray-900">{searchRecords.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Search className="h-8 w-8 text-green-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">发现项目总数</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {searchRecords.reduce((sum, record) => sum + record.stats.totalFound, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-8 w-8 text-yellow-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">新发现项目</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {searchRecords.reduce((sum, record) => sum + record.stats.newlyDiscovered, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="h-8 w-8 text-purple-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">平均 Stars</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {searchRecords.length > 0 
                                                    ? Math.round(searchRecords.reduce((sum, record) => sum + record.stats.averageStars, 0) / searchRecords.length)
                                                    : 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {aggregatedData && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">聚合统计</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">{aggregatedData.aggregatedStats.totalSearches}</p>
                                        <p className="text-sm text-gray-600">搜索次数</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">{aggregatedData.aggregatedStats.totalProjectsFound}</p>
                                        <p className="text-sm text-gray-600">发现项目</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">{aggregatedData.aggregatedStats.totalNewProjects}</p>
                                        <p className="text-sm text-gray-600">新项目</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">{aggregatedData.aggregatedStats.averageProjectsPerDay.toFixed(1)}</p>
                                        <p className="text-sm text-gray-600">日均项目</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {aggregatedData.aggregatedStats.topLanguages.length}
                                        </p>
                                        <p className="text-sm text-gray-600">主要语言</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 图表区域 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 项目发现趋势 */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">项目发现趋势</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={2} />
                                            <Line type="monotone" dataKey="newProjects" stroke="#10B981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 编程语言分布 */}
                            {getLanguageData().length > 0 && (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">编程语言分布</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getLanguageData()}
                                                    dataKey="count"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {getLanguageData().map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 详细搜索记录列表 */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">详细搜索记录</h3>
                            </div>
                            <div className="p-6">
                                {searchRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {searchRecords.map(record => (
                                            <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{record.searchQuery}</h4>
                                                    <span className="text-sm text-gray-600">{record.searchDate}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">找到项目:</span>
                                                        <span className="ml-2 font-medium">{record.stats.totalFound}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">新发现:</span>
                                                        <span className="ml-2 font-medium">{record.stats.newlyDiscovered}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">平均Stars:</span>
                                                        <span className="ml-2 font-medium">{record.stats.averageStars.toFixed(1)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">热门语言:</span>
                                                        <span className="ml-2 font-medium">
                                                            {record.stats.topLanguages.slice(0, 2).map(lang => lang.name).join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无搜索记录</h3>
                                        <p className="text-gray-600">请选择时间范围来查看搜索结果数据</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchDatabasePage;
