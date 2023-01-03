import * as cdk from "aws-cdk-lib";
import { Repository, IRepository } from "aws-cdk-lib/aws-ecr";
import { Secret, ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { RuleTargetInput } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import {
    PsIngestionLambda,
    TwitterAccessCredentials,
} from "../infrastructure/lambda/ps-ingestion-lambda";
import { PsIngestionEventBridge } from "../infrastructure/eventbridge/ps-ingestion-eventbridge";
import { PsIngestionAlarms } from "../infrastructure/cloudwatch/ps-ingestion-alarms";
import {
    StageConfig,
    VGC_FORMAT,
    PS_INGESTION_LAMBDA_ECR_REPO,
    STATSUGIRI_EMAIL,
    ORDERUP_TWITTER_CREDS_SECRETS,
    TWITTER_ACCESS_TOKEN_NAME,
    TWITTER_ACCESS_TOKEN_SECRET_NAME,
    TWITTER_API_KEY_NAME,
    TWITTER_API_KEY_SECRET_NAME,
    PROD_TWITTER_DISPLAY_NAME,
    DEV_TWITTER_DISPLAY_NAME,
} from "../constants";
import { EmailSnsTopic } from "../infrastructure/sns/email-sns-topics";

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
            `${ORDERUP_TWITTER_CREDS_SECRETS}-${props.stageConfig.stageName}`
        );

        const eventBridge = new PsIngestionEventBridge(
            this,
            `PsIngestionEventBridge-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const ingestionLambda = new PsIngestionLambda(
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

        // Send format object to the targeted Lambda
        eventBridge.eventRule.addTarget(
            new LambdaFunction(ingestionLambda.lambdaFunction, {
                event: RuleTargetInput.fromObject({ format: VGC_FORMAT }),
            })
        );

        const ingestionAlarm = new PsIngestionAlarms(
            this,
            `PsIngestionAlarms-${props.stageConfig.stageName}`,
            {
                psIngestionLamdba: ingestionLambda.lambdaFunction,
                stageName: props.stageConfig.stageName,
            }
        );
        const emailTopic = new EmailSnsTopic(
            this,
            `PsIngestionEmailTopic-${props.stageConfig.stageName}`,
            {
                serviceName: "PsIngestion",
                email: STATSUGIRI_EMAIL,
                stageName: props.stageConfig.stageName,
            }
        );
        ingestionAlarm.alarm.addAlarmAction(new SnsAction(emailTopic.topic));
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
