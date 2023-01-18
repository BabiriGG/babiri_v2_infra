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
    PS_TEAM_TWITTER_WRITER_LAMBDA_ECR_PROD_TAG,
} from "../../constants/ecr-constants";
import { TwitterAccessCredentials } from "../../constants/twitter-creds";

export interface PsTeamTwitterWriterLambdaProps {
    readonly ecrRepo: IRepository;
    readonly stageName: string;
    readonly twitterAccessCredentials: TwitterAccessCredentials;
}

export class PsTeamTwitterWriterLambda extends Construct {
    readonly lambdaFunction: IFunction;

    constructor(
        scope: Construct,
        id: string,
        props: PsTeamTwitterWriterLambdaProps
    ) {
        super(scope, id);

        this.lambdaFunction = new DockerImageFunction(
            this,
            `PsTeamTwitterWriterLambda-${props.stageName}`,
            {
                functionName: `PsTeamTwitterWriterLambda-${props.stageName}`,
                description: "Write team information to Twitter",
                code: DockerImageCode.fromEcr(props.ecrRepo, {
                    tagOrDigest:
                        props.stageName == PROD_STAGE
                            ? PS_TEAM_TWITTER_WRITER_LAMBDA_ECR_PROD_TAG
                            : DEFAULT_ECR_DEV_TAG,
                }),
                timeout: Duration.minutes(2),
                memorySize: 1024,
                logRetention: RetentionDays.ONE_WEEK,
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
