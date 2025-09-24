import { useState, useEffect } from 'react';
import { 
    Tag, 
    Plus, 
    Edit, 
    Trash2, 
    ChevronRight,
    BarChart3,
    Star,
} from 'lucide-react';
import { Category, ApiResponse } from '../../../shared/types';
import api from '../services/api';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<ApiResponse<Category[]>>('/categories');
            if (response.data.success && response.data.data) {
                setCategories(response.data.data);
                // 加载每个分类的统计信息
                loadCategoryStats(response.data.data);
            } else {
                setError(response.data.error || '获取分类列表失败');
            }
        } catch (err: any) {
            setError(err.message || '获取分类列表失败');
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryStats = async (categories: Category[]) => {
        const stats: Record<string, number> = {};
        for (const category of categories) {
            try {
                const response = await api.get<ApiResponse<any>>(`/categories/${category.id}`);
                if (response.data.success && response.data.data) {
                    stats[category.id] = response.data.data.totalCount;
                }
            } catch (err) {
                stats[category.id] = 0;
            }
        }
        setCategoryStats(stats);
    };

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
    };

    const handleBackToList = () => {
        setSelectedCategory(null);
    };

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

    if (selectedCategory) {
        return <CategoryDetail category={selectedCategory} onBack={handleBackToList} />;
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
                    <p className="mt-1 text-sm text-gray-500">管理和查看仓库分类</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    添加分类
                </button>
            </div>

            {/* 分类网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="card cursor-pointer hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${category.color}20` }}
                                >
                                    <Tag className="h-6 w-6" style={{ color: category.color }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {categoryStats[category.id] || 0} 个仓库
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {category.description}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <BarChart3 className="h-4 w-4" />
                                <span>自动分类</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 添加分类表单 */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">添加新分类</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    分类名称
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="例如：区块链开发"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    描述
                                </label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="描述这个分类的用途..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    颜色
                                </label>
                                <input
                                    type="color"
                                    className="w-full h-10 rounded border border-gray-300"
                                    defaultValue="#3B82F6"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="btn btn-secondary"
                                >
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    添加
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoryDetail({ category, onBack }: { category: Category; onBack: () => void }) {
    const [repositories, setRepositories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategoryDetail();
    }, [category.id]);

    const loadCategoryDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get<ApiResponse<any>>(`/categories/${category.id}`);
            if (response.data.success && response.data.data) {
                setRepositories(response.data.data.repositories);
            }
        } catch (err) {
            console.error('加载分类详情失败:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 返回按钮 */}
            <button
                onClick={onBack}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                返回分类列表
            </button>

            {/* 分类标题 */}
            <div className="flex items-center space-x-4">
                <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    <Tag className="h-8 w-8" style={{ color: category.color }} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                    <p className="text-gray-600">{category.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {repositories.length} 个仓库
                    </p>
                </div>
            </div>

            {/* 仓库列表 */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        <span className="ml-2 text-gray-600">加载中...</span>
                    </div>
                ) : repositories.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无仓库</h3>
                        <p className="mt-1 text-sm text-gray-500">该分类下还没有仓库</p>
                    </div>
                ) : (
                    repositories.map((repo) => (
                        <div key={repo.id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {repo.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{repo.full_name}</p>
                                    {repo.description && (
                                        <p className="text-gray-600 mt-2">{repo.description}</p>
                                    )}
                                    
                                    <div className="flex items-center space-x-6 mt-4">
                                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                                            <Star className="h-4 w-4" />
                                            <span>{repo.stargazers_count.toLocaleString()}</span>
                                        </div>
                                        {repo.language && (
                                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span>{repo.language}</span>
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            置信度: {(repo.confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>

                                    {repo.reasons && repo.reasons.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-2">分类原因:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {repo.reasons.map((reason: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                                    >
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
