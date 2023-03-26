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
import {
    DEFAULT_ECR_DEV_TAG,
    PS_REPLAY_EXTRACTION_LAMBDA_ECR_PROD_TAG,
    NUM_USERS_TO_PULL_DEV,
    NUM_USERS_TO_PULL_PROD,
} from "../../constants/ecr-constants";

export interface PsReplayExtractionLambdaProps {
    readonly stageName: string;
    readonly ecrRepo: IRepository;
    readonly replaysBucketName: string;
    readonly role: Role;
}

export class PsReplayExtractionLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsReplayExtractionLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsReplayExtractionLambda-${props.stageName}`,
            {
                functionName: `PsReplayExtractionLambda-${props.stageName}`,
                description: "Extract replay information from Pokémon Showdown",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_REPLAY_EXTRACTION_LAMBDA_ECR_PROD_TAG
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(15),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
                role: props.role,
                environment: {
                    REPLAYS_BUCKET_NAME: props.replaysBucketName,
                    NUM_USERS_TO_PULL:
                        props.stageName == PROD_STAGE
                            ? NUM_USERS_TO_PULL_PROD
                            : NUM_USERS_TO_PULL_DEV,
                },
            }
        );
    }
}
