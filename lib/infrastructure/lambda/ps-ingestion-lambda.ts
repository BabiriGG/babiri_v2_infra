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
    PS_INGESTION_LAMBDA_ECR_PROD_TAG,
} from "../../constants/ecr-constants";

export interface TwitterAccessCredentials {
    readonly twitterAccessToken: string;
    readonly twitterAccessTokenSecret: string;
    readonly twitterApiKey: string;
    readonly twitterApiKeySecret: string;
    readonly twitterDisplayName: string;
}

export interface PsIngestionLambdaProps {
    readonly ecrRepo: IRepository;
    readonly twitterAccessCredentials: TwitterAccessCredentials;
    readonly stageName: string;
}

export class PsIngestionLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(scope: Construct, id: string, props: PsIngestionLambdaProps) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsIngestionLambda-${props.stageName}`,
            {
                functionName: `PsIngestionLambda-${props.stageName}`,
                description: "Ingest and load data to DynamoDB and OrderUpBot",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_INGESTION_LAMBDA_ECR_PROD_TAG
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(12),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_MONTH,
                environment: {
                    TWITTER_API_KEY:
                        props.twitterAccessCredentials.twitterApiKey,
                    TWITTER_API_KEY_SECRET:
                        props.twitterAccessCredentials.twitterApiKeySecret,
                    TWITTER_ACCESS_TOKEN:
                        props.twitterAccessCredentials.twitterAccessToken,
                    TWITTER_ACCESS_TOKEN_SECRET:
                        props.twitterAccessCredentials.twitterAccessTokenSecret,
                    TWITTER_DISPLAY_NAME:
                        props.twitterAccessCredentials.twitterDisplayName,
                },
            }
        );
    }
}
