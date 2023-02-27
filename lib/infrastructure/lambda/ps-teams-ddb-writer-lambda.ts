import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Role } from "aws-cdk-lib/aws-iam";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import {
    DockerImageCode,
    DockerImageFunction,
    IFunction,
} from "aws-cdk-lib/aws-lambda";
import { PROD_STAGE } from "../../constants/stage-config";
import {
    DEFAULT_ECR_DEV_TAG,
    PS_TEAMS_DDB_WRITER_LAMBDA_ECR_PROD_TAG,
    PS_TEAMS_DDB_WRITER_LAMBDA_ECR_REPO,
} from "../../constants/ecr-constants";

export interface PsTeamsDdbWriterLambdaProps {
    readonly ecrRepo: IRepository;
    readonly stageName: string;
    readonly role: Role;
    readonly tableName: string;
}

export class PsTeamsDdbWriterLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsDdbWriterLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsTeamsDdbWriterLambda-${props.stageName}`,
            {
                functionName: `PsTeamsDdbWriterLambda-${props.stageName}`,
                description: "Write team records to DynamoDB",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_TEAMS_DDB_WRITER_LAMBDA_ECR_PROD_TAG
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(5),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
                role: props.role,
                environment: {
                    TABLE_NAME: props.tableName,
                },
            }
        );
    }
}
