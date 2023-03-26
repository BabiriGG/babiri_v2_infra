import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import {
    DockerImageCode,
    DockerImageFunction,
    IFunction,
} from "aws-cdk-lib/aws-lambda";
import { Role } from "aws-cdk-lib/aws-iam";
import { PROD_STAGE } from "../../constants/stage-config";
import { DEFAULT_ECR_DEV_TAG } from "../../constants/ecr-constants";

export interface PsTeamsServiceLambdaProps {
    readonly stageName: string;
    readonly ecrRepo: IRepository;
    readonly role: Role;
    readonly teamsTableName: string;
}

export class PsTeamsServiceLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsServiceLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsTeamsServiceLambda-${props.stageName}`,
            {
                functionName: `PsTeamsServiceLambda-${props.stageName}`,
                description: "Retrieve PS teams from DynamoDB",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? "PLACEHOLDER"
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(1),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
                role: props.role,
                environment: {
                    TEAMS_TABLE_NAME: props.teamsTableName,
                },
            }
        );
    }
}
