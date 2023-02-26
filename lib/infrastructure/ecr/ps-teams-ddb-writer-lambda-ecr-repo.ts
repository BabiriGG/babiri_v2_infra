import { Construct } from "constructs";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { PS_TEAMS_DDB_WRITER_LAMBDA_ECR_REPO } from "../../constants/ecr-constants";

export interface PsTeamsDdbWriterLambdaEcrRepoProps {
    readonly stageName: string;
}

export class PsTeamsDdbWriterLambdaEcrRepo extends Construct {
    readonly ecrRepo: IRepository;
    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsDdbWriterLambdaEcrRepoProps
    ) {
        super(scope, id);

        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsTeamsDdbWriterLambdaEcrRepo-${props.stageName}`,
            PS_TEAMS_DDB_WRITER_LAMBDA_ECR_REPO
        );
    }
}
