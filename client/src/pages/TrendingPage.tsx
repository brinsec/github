import React, { useState, useEffect } from 'react';
import { RiseOutlined, StarOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card, Row, Col, Button, Tabs, Spin, message, Tag, Statistic } from 'antd';

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


const TrendingPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [weeklyData, setWeeklyData] = useState<TrendingRepository[]>([]);
    const [monthlyData, setMonthlyData] = useState<TrendingRepository[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<TrendingRepository[]>([]);
    const [activeTab, setActiveTab] = useState('weekly');

    // 获取热门项目数据
    const fetchTrendingData = async (period: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/trending/${period}`);
            const result = await response.json();
            
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
                message.error(result.error || '获取数据失败');
            }
        } catch (error) {
            message.error('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    // 自动发现并star热门项目
    const autoDiscoverAndStar = async (period: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/trending/auto-discover/${period}`, {
                method: 'POST',
            });
            const result = await response.json();
            
            if (result.success) {
                message.success(result.message);
                // 刷新数据
                fetchTrendingData(period);
            } else {
                message.error(result.error || '自动发现失败');
            }
        } catch (error) {
            message.error('网络请求失败');
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
                message.success(`成功star仓库: ${repo.full_name}`);
            } else {
                message.error(result.error || 'Star失败');
            }
        } catch (error) {
            message.error('网络请求失败');
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

    const getPeriodIcon = (period: string) => {
        switch (period) {
            case 'weekly':
                return <ClockCircleOutlined />;
            case 'monthly':
                return <RiseOutlined />;
            case 'quarterly':
                return <TrophyOutlined />;
            default:
                return <RiseOutlined />;
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

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                style={{ marginBottom: '24px' }}
                items={[
                    {
                        key: 'weekly',
                        label: (
                            <span>
                                <ClockCircleOutlined />
                                一周热门
                            </span>
                        ),
                    },
                    {
                        key: 'monthly',
                        label: (
                            <span>
                                <RiseOutlined />
                                一月热门
                            </span>
                        ),
                    },
                    {
                        key: 'quarterly',
                        label: (
                            <span>
                                <TrophyOutlined />
                                一季热门
                            </span>
                        ),
                    },
                ]}
            />

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="发现项目数"
                            value={currentData.length}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总Star数"
                            value={currentData.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
                            prefix={<StarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="平均Star数"
                            value={currentData.length > 0 ? Math.round(currentData.reduce((sum, repo) => sum + repo.stargazers_count, 0) / currentData.length) : 0}
                            prefix={<StarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>
                        {getPeriodIcon(activeTab)} {getPeriodTitle(activeTab)}上升最快的项目
                    </h3>
                    <Button 
                        type="primary" 
                        icon={<StarOutlined />}
                        onClick={() => autoDiscoverAndStar(activeTab)}
                        loading={loading}
                    >
                        自动发现并Star
                    </Button>
                </div>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '16px' }}>正在发现热门项目...</p>
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {currentData.map((repo, index) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={repo.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%' }}
                                    actions={[
                                        <Button 
                                            type="link" 
                                            icon={<StarOutlined />}
                                            onClick={() => starRepository(repo)}
                                        >
                                            Star
                                        </Button>,
                                        <Button 
                                            type="link" 
                                            onClick={() => window.open(repo.html_url, '_blank')}
                                        >
                                            查看
                                        </Button>,
                                    ]}
                                >
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ 
                                                backgroundColor: '#1890ff', 
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
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        {repo.language && (
                                            <Tag color="blue" style={{ marginBottom: '4px' }}>
                                                {repo.language}
                                            </Tag>
                                        )}
                                        {repo.topics.slice(0, 3).map((topic, idx) => (
                                            <Tag key={idx} color="green" style={{ marginBottom: '4px' }}>
                                                {topic}
                                            </Tag>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <StarOutlined style={{ color: '#faad14', marginRight: '4px' }} />
                                            <span style={{ fontSize: '14px' }}>{repo.stargazers_count.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: '#999' }}>
                                                {new Date(repo.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {currentData.length === 0 && !loading && (
                <Card>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <RiseOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', color: '#999' }}>
                            暂无{getPeriodTitle(activeTab)}热门项目数据
                        </p>
                        <Button 
                            type="primary" 
                            onClick={() => fetchTrendingData(activeTab)}
                        >
                            刷新数据
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default TrendingPage;
