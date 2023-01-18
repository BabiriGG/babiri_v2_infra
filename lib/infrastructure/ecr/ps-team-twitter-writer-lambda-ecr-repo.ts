import { Construct } from "constructs";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { PS_TEAM_TWITTER_WRITER_LAMBDA_ECR_REPO } from "../../constants/ecr-constants";

export interface PsTeamTwitterWriterLambdaEcrRepoProps {
    readonly stageName: string;
}

export class PsTeamTwitterWriterLambdaEcrRepo extends Construct {
    readonly ecrRepo: IRepository;
    constructor(
        scope: Construct,
        id: string,
        props: PsTeamTwitterWriterLambdaEcrRepoProps
    ) {
        super(scope, id);

        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsTeamTwitterWriterLambda-${props.stageName}`,
            PS_TEAM_TWITTER_WRITER_LAMBDA_ECR_REPO
        );
    }
}
