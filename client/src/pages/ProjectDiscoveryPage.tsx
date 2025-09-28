import { useState, useEffect } from 'react';
import { SearchOutlined, StarOutlined, ForkOutlined, EyeOutlined, RiseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Row, Col, Button, Spin, message, Tag, Statistic, List, Avatar, Typography, Tabs } from 'antd';
import api from '../services/api';
import { mockApi } from '../services/mockApi';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface DiscoveredProject {
    id: string;
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
    pushed_at: string;
    size: number;
    default_branch: string;
    open_issues_count: number;
    watchers_count: number;
    archived: boolean;
    disabled: boolean;
    private: boolean;
    fork: boolean;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
    };
    discovered_at: string;
    discovery_source: 'trending' | 'search' | 'recommendation';
    discovery_period: 'weekly' | 'monthly' | 'quarterly';
    is_new: boolean;
    growth_rate: number;
    previous_stars?: number;
}

interface DiscoveryStats {
    totalDiscovered: number;
    newProjects: number;
    recentChanges: number;
    bySource: {
        trending: number;
        search: number;
        recommendation: number;
    };
    byPeriod: {
        weekly: number;
        monthly: number;
        quarterly: number;
    };
}

const ProjectDiscoveryPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<DiscoveredProject[]>([]);
    const [stats, setStats] = useState<DiscoveryStats | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    const fetchDiscoveryData = async () => {
        setLoading(true);
        try {
            try {
                // 使用统一API
                const [projectsResult, statsResult] = await Promise.all([
                    api.get('/discovery/projects'),
                    api.get('/discovery/stats')
                ]);
                
                if (projectsResult.data.success) {
                    setProjects(projectsResult.data.data);
                }
                if (statsResult.data.success) {
                    setStats(statsResult.data.data);
                }
                
                message.success('发现项目数据加载完成');
            } catch (apiError) {
                console.error('API失败，使用模拟数据:', apiError);
                // 使用模拟数据回退
                const mockProjects = await mockApi.getDiscoveredProjects();
                setProjects(mockProjects.data.data);
                
                // 模拟统计
                setStats({
                    totalDiscovered: 25,
                    newProjects: 5,
                    recentChanges: 12,
                    bySource: { trending: 15, search: 8, recommendation: 2 },
                    byPeriod: { weekly: 10, monthly: 12, quarterly: 3 }
                });
            }
        } catch (error) {
            console.error('获取发现数据失败:', error);
            message.error('获取发现数据失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    const startDiscovery = async () => {
        setLoading(true);
        try {
            try {
                const response = await api.post('/discovery/start');
                const result = response.data;
                
                if (result.success) {
                    message.success('开始自动发现新项目');
                    setTimeout(() => {
                        fetchDiscoveryData();
                    }, 2000);
                } else {
                    message.error(result.error || '启动发现失败');
                }
            } catch (apiError) {
                console.error('API启动失败，使用模拟数据:', apiError);
                message.success('启动自动发现新项目 (模拟模式)');
            }
        } catch (error) {
            console.error('启动发现失败:', error);
            message.error('启动发现失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscoveryData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            'JavaScript': '#f7df1e',
            'TypeScript': '#3178c6',
            'Python': '#3776ab',
            'Java': '#ed8b00',
            'Go': '#00add8',
            'Rust': '#dea584',
            'C++': '#00599c',
            'C#': '#239120',
            'PHP': '#777bb4',
            'Ruby': '#cc342d',
            'Swift': '#fa7343',
            'Kotlin': '#7f52ff',
            'Dart': '#0175c2',
            'Shell': '#89e051',
            'HTML': '#e34c26',
            'CSS': '#1572b6',
            'Vue': '#4fc08d',
            'React': '#61dafb',
        };
        return colors[language] || '#666';
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'trending':
                return <RiseOutlined className="text-orange-500" />;
            case 'search':
                return <SearchOutlined className="text-blue-500" />;
            case 'recommendation':
                return <StarOutlined className="text-green-500" />;
            default:
                return <ClockCircleOutlined className="text-gray-500" />;
        }
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'trending':
                return 'orange';
            case 'search':
                return 'blue';
            case 'recommendation':
                return 'green';
            default:
                return 'gray';
        }
    };

    const filteredProjects = projects.filter(project => {
        switch (activeTab) {
            case 'new':
                return project.is_new;
            case 'trending':
                return project.discovery_source === 'trending';
            case 'search':
                return project.discovery_source === 'search';
            case 'recommendation':
                return project.discovery_source === 'recommendation';
            default:
                return true;
        }
    });

    return (
        <div className="p-6">
            <div className="mb-8">
                <Title level={1} className="flex items-center gap-3 mb-2">
                    <SearchOutlined className="text-blue-500" />
                    项目发现中心
                </Title>
                <Paragraph className="text-gray-600 text-lg">
                    自动发现GitHub上的新项目和热门项目，追踪项目变化趋势
                </Paragraph>
            </div>

            {/* 统计信息 */}
            {stats && (
                <Row gutter={[16, 16]} className="mb-8">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="总发现项目"
                                value={stats.totalDiscovered}
                                prefix={<SearchOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="新项目"
                                value={stats.newProjects}
                                prefix={<StarOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                        <Statistic
                            title="最近变化"
                            value={stats.recentChanges}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="发现来源"
                                value={`${stats.bySource.trending + stats.bySource.search + stats.bySource.recommendation}`}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 操作按钮 */}
            <div className="mb-6 flex gap-4">
                <Button 
                    type="primary" 
                    size="large"
                    onClick={startDiscovery}
                    loading={loading}
                    icon={<SearchOutlined />}
                >
                    开始发现新项目
                </Button>
                <Button 
                    size="large"
                    onClick={fetchDiscoveryData}
                    loading={loading}
                    icon={<ClockCircleOutlined />}
                >
                    刷新数据
                </Button>
            </div>

            {/* 项目列表 */}
            <Card title="🔍 发现的项目" className="mb-6">
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    className="mb-4"
                >
                    <TabPane tab="全部项目" key="all" />
                    <TabPane tab="新项目" key="new" />
                    <TabPane tab="热门项目" key="trending" />
                    <TabPane tab="搜索结果" key="search" />
                    <TabPane tab="推荐项目" key="recommendation" />
                </Tabs>

                {loading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4">正在加载发现数据...</div>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        暂无发现的项目数据
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={filteredProjects}
                        renderItem={(project) => (
                            <List.Item
                                key={project.id}
                                className="border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-start gap-4 w-full">
                                    {/* 项目信息 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Title level={4} className="mb-0">
                                                <a 
                                                    href={project.html_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {project.full_name}
                                                </a>
                                            </Title>
                                            {project.is_new && (
                                                <Tag color="green" className="text-xs">
                                                    新项目
                                                </Tag>
                                            )}
                                            <Tag 
                                                color={getSourceColor(project.discovery_source)}
                                                className="text-xs"
                                            >
                                                {getSourceIcon(project.discovery_source)}
                                                <span className="ml-1">
                                                    {project.discovery_source === 'trending' ? '热门' : 
                                                     project.discovery_source === 'search' ? '搜索' : '推荐'}
                                                </span>
                                            </Tag>
                                        </div>

                                        <Paragraph 
                                            className="text-gray-600 mb-3"
                                            ellipsis={{ rows: 2 }}
                                        >
                                            {project.description}
                                        </Paragraph>

                                        {/* 统计信息 */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                            <div className="flex items-center gap-1">
                                                <StarOutlined />
                                                <span>{formatNumber(project.stargazers_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ForkOutlined />
                                                <span>{formatNumber(project.forks_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <EyeOutlined />
                                                <span>{formatNumber(project.watchers_count)}</span>
                                            </div>
                                            <div>
                                                Issues: {project.open_issues_count}
                                            </div>
                                            {project.growth_rate > 0 && (
                                                <div className="text-green-600">
                                                    增长率: {project.growth_rate}/天
                                                </div>
                                            )}
                                        </div>

                                        {/* 标签 */}
                                        {project.topics && project.topics.length > 0 && (
                                            <div className="mb-2">
                                                {project.topics.slice(0, 5).map((topic) => (
                                                    <Tag key={topic} className="mb-1">
                                                        {topic}
                                                    </Tag>
                                                ))}
                                                {project.topics.length > 5 && (
                                                    <Tag className="mb-1">
                                                        +{project.topics.length - 5}
                                                    </Tag>
                                                )}
                                            </div>
                                        )}

                                        {/* 语言标签 */}
                                        {project.language && (
                                            <Tag 
                                                color={getLanguageColor(project.language)}
                                                className="text-xs"
                                            >
                                                {project.language}
                                            </Tag>
                                        )}
                                    </div>

                                    {/* 项目头像 */}
                                    <div className="flex-shrink-0">
                                        <Avatar 
                                            size={64}
                                            src={`https://github.com/${project.full_name.split('/')[0]}.png`}
                                            className="border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default ProjectDiscoveryPage;
