import { Construct } from "constructs";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { PS_TEAMS_SERVICE_LAMBDA_ECR_REPO } from "../../constants/ecr-constants";

export interface PsTeamsServiceLambdaEcrRepoProps {
    readonly stageName: string;
}

export class PsTeamsServiceLambdaEcrRepo extends Construct {
    readonly ecrRepo: IRepository;
    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsServiceLambdaEcrRepoProps
    ) {
        super(scope, id);

        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsReplayExtractionLambdaEcrRepo-${props.stageName}`,
            PS_TEAMS_SERVICE_LAMBDA_ECR_REPO
        );
    }
}
