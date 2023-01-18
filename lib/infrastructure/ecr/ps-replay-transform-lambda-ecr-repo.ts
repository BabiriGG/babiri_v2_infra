import { Construct } from "constructs";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { PS_REPLAY_TRANSFORM_LAMBDA_ECR_REPO } from "../../constants/ecr-constants";

export interface PsReplayTransformLambdaEcrRepoProps {
    readonly stageName: string;
}

export class PsReplayTransformLambdaEcrRepo extends Construct {
    readonly ecrRepo: IRepository;
    constructor(
        scope: Construct,
        id: string,
        props: PsReplayTransformLambdaEcrRepoProps
    ) {
        super(scope, id);

        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsReplayTransformLambdaEcrRepo-${props.stageName}`,
            PS_REPLAY_TRANSFORM_LAMBDA_ECR_REPO
        );
    }
}
