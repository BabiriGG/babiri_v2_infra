import { Construct } from "constructs";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { PS_REPLAY_EXTRACTION_LAMBDA_ECR_REPO } from "../../constants/ecr-constants";

export interface PsReplayExtractionLambdaEcrRepoProps {
    readonly stageName: string;
}

export class PsReplayExtractionLambdaEcrRepo extends Construct {
    readonly ecrRepo: IRepository;
    constructor(
        scope: Construct,
        id: string,
        props: PsReplayExtractionLambdaEcrRepoProps
    ) {
        super(scope, id);

        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsReplayExtractionLambdaEcrRepo-${props.stageName}`,
            PS_REPLAY_EXTRACTION_LAMBDA_ECR_REPO
        );
    }
}
