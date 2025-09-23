import React, { useState, useEffect } from 'react';

interface TrendingRepository {
    id: number;
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
}

const TrendingPageSimple: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [weeklyData, setWeeklyData] = useState<TrendingRepository[]>([]);
    const [monthlyData, setMonthlyData] = useState<TrendingRepository[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<TrendingRepository[]>([]);
    const [activeTab, setActiveTab] = useState('weekly');

    // 获取热门项目数据
    const fetchTrendingData = async (period: string) => {
        setLoading(true);
        try {
            console.log(`获取 ${period} 热门项目数据...`);
            const response = await fetch(`http://localhost:3001/api/trending/${period}`);
            const result = await response.json();
            
            console.log(`${period} API响应:`, result);
            
            if (result.success) {
                switch (period) {
                    case 'weekly':
                        setWeeklyData(result.data);
                        break;
                    case 'monthly':
                        setMonthlyData(result.data);
                        break;
                    case 'quarterly':
                        setQuarterlyData(result.data);
                        break;
                }
            } else {
                alert(result.error || '获取数据失败');
            }
        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    // 自动发现并star热门项目
    const autoDiscoverAndStar = async (period: string) => {
        setLoading(true);
        try {
            console.log(`自动发现并star ${period} 热门项目...`);
            const response = await fetch(`http://localhost:3001/api/trending/auto-discover/${period}`, {
                method: 'POST',
            });
            const result = await response.json();
            
            console.log(`自动发现结果:`, result);
            
            if (result.success) {
                alert(result.message);
                // 刷新数据
                fetchTrendingData(period);
            } else {
                alert(result.error || '自动发现失败');
            }
        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    // 手动star仓库
    const starRepository = async (repo: TrendingRepository) => {
        try {
            const [owner, repoName] = repo.full_name.split('/');
            const response = await fetch(`http://localhost:3001/api/star/${owner}/${repoName}`, {
                method: 'POST',
            });
            const result = await response.json();
            
            if (result.success) {
                alert(`成功star仓库: ${repo.full_name}`);
            } else {
                alert(result.error || 'Star失败');
            }
        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络请求失败');
        }
    };

    useEffect(() => {
        fetchTrendingData(activeTab);
    }, [activeTab]);

    const getCurrentData = () => {
        switch (activeTab) {
            case 'weekly':
                return weeklyData;
            case 'monthly':
                return monthlyData;
            case 'quarterly':
                return quarterlyData;
            default:
                return [];
        }
    };

    const getPeriodTitle = (period: string) => {
        switch (period) {
            case 'weekly':
                return '一周内';
            case 'monthly':
                return '一个月内';
            case 'quarterly':
                return '一个季度内';
            default:
                return '';
        }
    };

    const currentData = getCurrentData();

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                    📈 热门项目发现
                </h1>
                <p style={{ fontSize: '16px', color: '#666' }}>
                    自动发现GitHub上最热门的项目，一键star并自动分类
                </p>
            </div>

            {/* 标签页切换 */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                <button
                    onClick={() => setActiveTab('weekly')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'weekly' ? '#1890ff' : 'transparent',
                        color: activeTab === 'weekly' ? 'white' : '#666',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'weekly' ? '2px solid #1890ff' : '2px solid transparent',
                    }}
                >
                    🕐 一周热门
                </button>
                <button
                    onClick={() => setActiveTab('monthly')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'monthly' ? '#1890ff' : 'transparent',
                        color: activeTab === 'monthly' ? 'white' : '#666',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'monthly' ? '2px solid #1890ff' : '2px solid transparent',
                    }}
                >
                    📈 一月热门
                </button>
                <button
                    onClick={() => setActiveTab('quarterly')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'quarterly' ? '#1890ff' : 'transparent',
                        color: activeTab === 'quarterly' ? 'white' : '#666',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'quarterly' ? '2px solid #1890ff' : '2px solid transparent',
                    }}
                >
                    🏆 一季热门
                </button>
            </div>

            {/* 统计信息 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>发现项目数</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {currentData.length}
                    </p>
                </div>
                <div style={{ flex: 1, padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>总Star数</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {currentData.reduce((sum, repo) => sum + repo.stargazers_count, 0).toLocaleString()}
                    </p>
                </div>
                <div style={{ flex: 1, padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>平均Star数</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                        {currentData.length > 0 ? Math.round(currentData.reduce((sum, repo) => sum + repo.stargazers_count, 0) / currentData.length).toLocaleString() : 0}
                    </p>
                </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => autoDiscoverAndStar(activeTab)}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        background: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        marginRight: '12px',
                    }}
                >
                    {loading ? '处理中...' : '⭐ 自动发现并Star'}
                </button>
                <button
                    onClick={() => fetchTrendingData(activeTab)}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                    }}
                >
                    {loading ? '加载中...' : '🔄 刷新数据'}
                </button>
            </div>

            {/* 项目列表 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {currentData.map((repo, index) => (
                    <div
                        key={repo.id}
                        style={{
                            padding: '16px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            background: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{
                                background: '#1890ff',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginRight: '8px'
                            }}>
                                {index + 1}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '16px' }}>{repo.name}</h4>
                        </div>
                        
                        <p style={{
                            color: '#666',
                            fontSize: '14px',
                            margin: '0 0 12px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {repo.description || '暂无描述'}
                        </p>

                        <div style={{ marginBottom: '12px' }}>
                            {repo.language && (
                                <span style={{
                                    background: '#e6f7ff',
                                    color: '#1890ff',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    marginRight: '4px'
                                }}>
                                    {repo.language}
                                </span>
                            )}
                            {repo.topics.slice(0, 3).map((topic, idx) => (
                                <span key={idx} style={{
                                    background: '#f6ffed',
                                    color: '#52c41a',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    marginRight: '4px'
                                }}>
                                    {topic}
                                </span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#faad14', marginRight: '4px' }}>⭐</span>
                                <span style={{ fontSize: '14px' }}>{repo.stargazers_count.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#52c41a', marginRight: '4px' }}>🍴</span>
                                <span style={{ fontSize: '14px' }}>{repo.forks_count.toLocaleString()}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#999' }}>
                                {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => starRepository(repo)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#faad14',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                ⭐ Star
                            </button>
                            <button
                                onClick={() => window.open(repo.html_url, '_blank')}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                🔗 查看
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {currentData.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '16px', color: '#999' }}>
                        暂无{getPeriodTitle(activeTab)}热门项目数据
                    </p>
                    <button
                        onClick={() => fetchTrendingData(activeTab)}
                        style={{
                            padding: '12px 24px',
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        刷新数据
                    </button>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>正在加载热门项目...</p>
                </div>
            )}
        </div>
    );
};

export default TrendingPageSimple;
