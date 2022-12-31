import * as cdk from "aws-cdk-lib";
import { StageConfig } from "../constants";
import { PsIngestionLambda } from "../infrastructure/lambda/ps-ingestion-lambda";
import {
    PS_INGESTION_LAMBDA_ECR_REPO,
    ORDERUP_TWITTER_CREDS,
    PROD_TWITTER_DISPLAY_NAME,
    DEV_TWITTER_DISPLAY_NAME,
} from "../constants";
import { aws_ecr as ecr } from "aws-cdk-lib";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export interface PsIngestionStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
}

export class PsIngestionStack extends cdk.Stack {
    private ecrRepo: IRepository;

    constructor(scope: cdk.App, id: string, props: PsIngestionStackProps) {
        super(scope, id, props);
        this.ecrRepo = ecr.Repository.fromRepositoryName(
            this,
            `PsIngestionLambdaEcrRepo-${props.stageConfig.stageName}`,
            PS_INGESTION_LAMBDA_ECR_REPO
        );

        // Acquire Twitter credentials from Secrets Manager
        const orderUpTwitterCreds = Secret.fromSecretNameV2(
            this,
            `OrderUpTwitterCreds-${props.stageConfig.stageName}`,
            ORDERUP_TWITTER_CREDS
        );
        const twitterAccessToken = orderUpTwitterCreds
            .secretValueFromJson("TWITTER_ACCESS_TOKEN")
            .unsafeUnwrap();
        const twitterAccessTokenSecret = orderUpTwitterCreds
            .secretValueFromJson("TWITTER_ACCESS_TOKEN_SECRET")
            .unsafeUnwrap();
        const twitterApiKey = orderUpTwitterCreds
            .secretValueFromJson("TWITTER_API_KEY")
            .unsafeUnwrap();
        const twitterApiKeySecret = orderUpTwitterCreds
            .secretValueFromJson("TWITTER_API_KEY_SECRET")
            .unsafeUnwrap();

        new PsIngestionLambda(
            this,
            `PsIngestionLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: this.ecrRepo,
                twitterAccessCredentials: {
                    twitterAccessToken: twitterAccessToken,
                    twitterAccessTokenSecret: twitterAccessTokenSecret,
                    twitterApiKey: twitterApiKey,
                    twitterApiKeySecret: twitterApiKeySecret,
                    twitterDisplayName: props.stageConfig.isProd
                        ? PROD_TWITTER_DISPLAY_NAME
                        : DEV_TWITTER_DISPLAY_NAME,
                },
                stageName: props.stageConfig.stageName,
            }
        );
    }
}
