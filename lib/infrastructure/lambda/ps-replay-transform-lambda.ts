import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import {
    DockerImageCode,
    DockerImageFunction,
    IFunction,
} from "aws-cdk-lib/aws-lambda";
import { PROD_STAGE } from "../../constants/stage-config";
import {
    DEFAULT_ECR_DEV_TAG,
    PS_REPLAY_TRANSFORM_LAMBDA_ECR_PROD_TAG,
} from "../../constants/ecr-constants";

export interface PsReplayTransformLambdaProps {
    readonly ecrRepo: IRepository;
    readonly stageName: string;
}

export class PsReplayTransformLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsReplayTransformLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsReplayTransformLambda-${props.stageName}`,
            {
                functionName: `PsReplayTransformLambda-${props.stageName}`,
                description: "Transform replays to team information",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_REPLAY_TRANSFORM_LAMBDA_ECR_PROD_TAG
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(2),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
            }
        );
    }
}
