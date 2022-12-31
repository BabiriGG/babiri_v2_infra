import * as cdk from "aws-cdk-lib";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { Secret, ISecret } from "aws-cdk-lib/aws-secretsmanager";
import {
    PsIngestionLambda,
    TwitterAccessCredentials,
} from "../infrastructure/lambda/ps-ingestion-lambda";
import {
    StageConfig,
    PS_INGESTION_LAMBDA_ECR_REPO,
    ORDERUP_TWITTER_CREDS,
    TWITTER_ACCESS_TOKEN_NAME,
    TWITTER_ACCESS_TOKEN_SECRET_NAME,
    TWITTER_API_KEY_NAME,
    TWITTER_API_KEY_SECRET_NAME,
    PROD_TWITTER_DISPLAY_NAME,
    DEV_TWITTER_DISPLAY_NAME,
} from "../constants";

export interface PsIngestionStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
}

export class PsIngestionStack extends cdk.Stack {
    private ecrRepo: IRepository;

    constructor(scope: cdk.App, id: string, props: PsIngestionStackProps) {
        super(scope, id, props);
        this.ecrRepo = Repository.fromRepositoryName(
            this,
            `PsIngestionLambdaEcrRepo-${props.stageConfig.stageName}`,
            PS_INGESTION_LAMBDA_ECR_REPO
        );

        const orderUpTwitterCreds = Secret.fromSecretNameV2(
            this,
            `OrderUpTwitterCreds-${props.stageConfig.stageName}`,
            ORDERUP_TWITTER_CREDS
        );

        new PsIngestionLambda(
            this,
            `PsIngestionLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: this.ecrRepo,
                twitterAccessCredentials: this.getTwitterSecrets(
                    props,
                    orderUpTwitterCreds
                ),
                stageName: props.stageConfig.stageName,
            }
        );
    }

    private getTwitterSecrets(
        props: PsIngestionStackProps,
        orderUpTwitterCreds: ISecret
    ): TwitterAccessCredentials {
        const twitterAccessToken = orderUpTwitterCreds
            .secretValueFromJson(TWITTER_ACCESS_TOKEN_NAME)
            .unsafeUnwrap();
        const twitterAccessTokenSecret = orderUpTwitterCreds
            .secretValueFromJson(TWITTER_ACCESS_TOKEN_SECRET_NAME)
            .unsafeUnwrap();
        const twitterApiKey = orderUpTwitterCreds
            .secretValueFromJson(TWITTER_API_KEY_NAME)
            .unsafeUnwrap();
        const twitterApiKeySecret = orderUpTwitterCreds
            .secretValueFromJson(TWITTER_API_KEY_SECRET_NAME)
            .unsafeUnwrap();
        return {
            twitterAccessToken: twitterAccessToken,
            twitterAccessTokenSecret: twitterAccessTokenSecret,
            twitterApiKey: twitterApiKey,
            twitterApiKeySecret: twitterApiKeySecret,
            twitterDisplayName: props.stageConfig.isProd
                ? PROD_TWITTER_DISPLAY_NAME
                : DEV_TWITTER_DISPLAY_NAME,
        };
    }
}
