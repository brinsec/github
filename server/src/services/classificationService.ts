import { GitHubRepository, Category, RepositoryClassification, CategoryCriteria } from '../../../shared/types';
import { getAllRepositories, getAllCategories, saveRepositoryClassification, clearRepositoryClassifications } from '../database';

export class ClassificationService {
    
    classifyRepository(repository: GitHubRepository, categories: Category[]): RepositoryClassification[] {
        const classifications: RepositoryClassification[] = [];

        for (const category of categories) {
            const confidence = this.calculateConfidence(repository, category.criteria);
            const reasons = this.getClassificationReasons(repository, category.criteria);

            if (confidence > 0.3) { // 只保留置信度大于30%的分类
                classifications.push({
                    repositoryId: repository.id,
                    categoryId: category.id,
                    confidence,
                    reasons,
                });
            }
        }

        // 按置信度排序，只保留前3个分类
        return classifications
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
    }

    private calculateConfidence(repository: GitHubRepository, criteria: CategoryCriteria): number {
        let score = 0;
        let maxScore = 0;

        // 语言匹配 (权重: 40%)
        if (criteria.languages && criteria.languages.length > 0) {
            maxScore += 40;
            if (repository.language && criteria.languages.includes(repository.language)) {
                score += 40;
            }
        }

        // 关键词匹配 (权重: 30%)
        if (criteria.keywords && criteria.keywords.length > 0) {
            maxScore += 30;
            const description = repository.description?.toLowerCase() || '';
            const name = repository.name.toLowerCase();
            const fullName = repository.full_name.toLowerCase();
            
            let keywordMatches = 0;
            for (const keyword of criteria.keywords) {
                if (description.includes(keyword.toLowerCase()) || 
                    name.includes(keyword.toLowerCase()) || 
                    fullName.includes(keyword.toLowerCase())) {
                    keywordMatches++;
                }
            }
            
            if (keywordMatches > 0) {
                score += (keywordMatches / criteria.keywords.length) * 30;
            }
        }

        // Topics匹配 (权重: 25%)
        if (criteria.topics && criteria.topics.length > 0) {
            maxScore += 25;
            if (repository.topics && repository.topics.length > 0) {
                const matchingTopics = repository.topics.filter(topic => 
                    criteria.topics!.some(criteriaTopic => 
                        topic.toLowerCase().includes(criteriaTopic.toLowerCase()) ||
                        criteriaTopic.toLowerCase().includes(topic.toLowerCase())
                    )
                );
                
                if (matchingTopics.length > 0) {
                    score += (matchingTopics.length / Math.max(repository.topics.length, criteria.topics.length)) * 25;
                }
            }
        }

        // Stars数量范围 (权重: 5%)
        if (criteria.minStars !== undefined || criteria.maxStars !== undefined) {
            maxScore += 5;
            const stars = repository.stargazers_count;
            
            if (criteria.minStars !== undefined && criteria.maxStars !== undefined) {
                if (stars >= criteria.minStars && stars <= criteria.maxStars) {
                    score += 5;
                }
            } else if (criteria.minStars !== undefined) {
                if (stars >= criteria.minStars) {
                    score += 5;
                }
            } else if (criteria.maxStars !== undefined) {
                if (stars <= criteria.maxStars) {
                    score += 5;
                }
            }
        }

        return maxScore > 0 ? score / maxScore : 0;
    }

    private getClassificationReasons(repository: GitHubRepository, criteria: CategoryCriteria): string[] {
        const reasons: string[] = [];

        // 语言匹配原因
        if (criteria.languages && repository.language && criteria.languages.includes(repository.language)) {
            reasons.push(`主要语言: ${repository.language}`);
        }

        // 关键词匹配原因
        if (criteria.keywords && criteria.keywords.length > 0) {
            const description = repository.description?.toLowerCase() || '';
            const name = repository.name.toLowerCase();
            const fullName = repository.full_name.toLowerCase();
            
            const matchedKeywords = criteria.keywords.filter(keyword => 
                description.includes(keyword.toLowerCase()) || 
                name.includes(keyword.toLowerCase()) || 
                fullName.includes(keyword.toLowerCase())
            );

            if (matchedKeywords.length > 0) {
                reasons.push(`匹配关键词: ${matchedKeywords.join(', ')}`);
            }
        }

        // Topics匹配原因
        if (criteria.topics && repository.topics && repository.topics.length > 0) {
            const matchingTopics = repository.topics.filter(topic => 
                criteria.topics!.some(criteriaTopic => 
                    topic.toLowerCase().includes(criteriaTopic.toLowerCase()) ||
                    criteriaTopic.toLowerCase().includes(topic.toLowerCase())
                )
            );

            if (matchingTopics.length > 0) {
                reasons.push(`匹配主题: ${matchingTopics.join(', ')}`);
            }
        }

        // Stars数量原因
        if (criteria.minStars !== undefined || criteria.maxStars !== undefined) {
            const stars = repository.stargazers_count;
            if (criteria.minStars !== undefined && criteria.maxStars !== undefined) {
                if (stars >= criteria.minStars && stars <= criteria.maxStars) {
                    reasons.push(`Stars数量: ${stars} (在 ${criteria.minStars}-${criteria.maxStars} 范围内)`);
                }
            } else if (criteria.minStars !== undefined && stars >= criteria.minStars) {
                reasons.push(`Stars数量: ${stars} (≥ ${criteria.minStars})`);
            } else if (criteria.maxStars !== undefined && stars <= criteria.maxStars) {
                reasons.push(`Stars数量: ${stars} (≤ ${criteria.maxStars})`);
            }
        }

        return reasons;
    }

    async classifyAllRepositories(): Promise<void> {
        try {
            // 获取所有仓库和分类
            const repositories = await getAllRepositories();
            const categories = await getAllCategories();

            // 清空现有分类结果
            await clearRepositoryClassifications();

            let processed = 0;
            const total = repositories.length;

            for (const repository of repositories) {
                const classifications = this.classifyRepository(repository, categories);

                // 保存分类结果
                for (const classification of classifications) {
                    await saveRepositoryClassification(classification);
                }

                processed++;
                if (processed % 10 === 0) {
                    console.log(`📊 分类进度: ${processed}/${total}`);
                }
            }

            console.log(`✅ 完成所有仓库的分类，共处理 ${total} 个仓库`);
        } catch (error) {
            console.error('分类失败:', error);
            throw error;
        }
    }
}
