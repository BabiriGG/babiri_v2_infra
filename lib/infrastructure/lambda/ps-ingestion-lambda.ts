import { aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import { aws_ecr as ecr } from "aws-cdk-lib";
import { POINT_CONVERSION_COMPRESSED } from "constants";

export interface TwitterAccessCredentials {
    readonly twitterAccessToken: string;
    readonly twitterAccessTokenSecret: string;
    readonly twitterApiKey: string;
    readonly twitterApiKeySecret: string;
    readonly twitterDisplayName: string;
}

export interface PsIngestionLambdaProps {
    readonly ecrRepo: ecr.IRepository;
    readonly twitterAccessCredentials: TwitterAccessCredentials;
    readonly stageName: string;
}

export class PsIngestionLambda extends Construct {
    constructor(scope: Construct, id: string, props: PsIngestionLambdaProps) {
        super(scope, id);

        new lambda.DockerImageFunction(
            this,
            `PsIngestionLambda-${props.stageName}`,
            {
                functionName: `PsIngestionLambda-${props.stageName}`,
                description:
                    "Ingest and load data to DynamoDB and Twitter's OrderUpBot",
                code: lambda.DockerImageCode.fromEcr(props.ecrRepo),
                timeout: Duration.seconds(60),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_YEAR,
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
