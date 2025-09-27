import { GitHubRepository, Category, RepositoryClassification } from '../../../shared/types';
export declare class ClassificationService {
    classifyRepository(repository: GitHubRepository, categories: Category[]): RepositoryClassification[];
    private calculateConfidence;
    private getClassificationReasons;
    classifyAllRepositories(): Promise<void>;
}
//# sourceMappingURL=classificationService.d.ts.map