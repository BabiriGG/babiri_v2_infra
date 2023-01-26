import * as cdk from "aws-cdk-lib";
import { Secret, ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { RuleTargetInput } from "aws-cdk-lib/aws-events";
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { PsReplayExtractionLambda } from "../infrastructure/lambda/ps-replay-extraction-lambda";
import { PsIngestionEventBridge } from "../infrastructure/eventbridge/ps-ingestion-eventbridge";
import { PsIngestionAlarms } from "../infrastructure/cloudwatch/ps-ingestion-alarms";
import { PsIngestionReplaysBucket } from "../infrastructure/s3/ps-ingestion-replays-bucket";
import { PsIngestionTeamsBucket } from "../infrastructure/s3/ps-ingestion-teams-bucket";
import {
    ORDERUP_TWITTER_CREDS_SECRETS,
    TWITTER_ACCESS_TOKEN_NAME,
    TWITTER_ACCESS_TOKEN_SECRET_NAME,
    TWITTER_API_KEY_NAME,
    TWITTER_API_KEY_SECRET_NAME,
    PROD_TWITTER_DISPLAY_NAME,
    DEV_TWITTER_DISPLAY_NAME,
} from "../constants/twitter-creds";
import { StageConfig } from "../constants/stage-config";
import { VGC_FORMAT } from "../constants/ps-constants";
import { STATSUGIRI_EMAIL } from "../constants/alarm-constants";
import { TwitterAccessCredentials } from "../constants/twitter-creds";
import { EmailSnsTopic } from "../infrastructure/sns/email-sns-topics";
import { PsReplayExtractionLambdaEcrRepo } from "../infrastructure/ecr/ps-replay-extraction-lambda-ecr-repo";
import { PsReplayTransformLambdaEcrRepo } from "../infrastructure/ecr/ps-replay-transform-lambda-ecr-repo";
import { PsTeamTwitterWriterLambdaEcrRepo } from "../infrastructure/ecr/ps-team-twitter-writer-lambda-ecr-repo";
import { PsReplayTransformLambda } from "../infrastructure/lambda/ps-replay-transform-lambda";
import { PsTeamTwitterWriterLambda } from "../infrastructure/lambda/ps-team-twitter-writer-lambda";
import { PsIngestionStateMachine } from "../infrastructure/stepfunctions/ps-ingestion-state-machine";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

export interface PsIngestionStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
}

export class PsIngestionStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: PsIngestionStackProps) {
        super(scope, id, props);

        const orderUpTwitterCreds = Secret.fromSecretNameV2(
            this,
            `OrderUpTwitterCreds-${props.stageConfig.stageName}`,
            `${ORDERUP_TWITTER_CREDS_SECRETS}-${props.stageConfig.stageName}`
        );

        const replaysBucket = new PsIngestionReplaysBucket(
            this,
            `PsIngestionReplayBucket-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const teamsBucket = new PsIngestionTeamsBucket(
            this,
            `PsIngestionTeamsBucket-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const extractionEcrRepo = new PsReplayExtractionLambdaEcrRepo(
            this,
            `ExtractionLambdaEcrRepo-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );
        const transformEcrRepo = new PsReplayTransformLambdaEcrRepo(
            this,
            `TransformLambdaEcrRepo-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );
        const twitterWriterEcrRepo = new PsTeamTwitterWriterLambdaEcrRepo(
            this,
            `TwitterWriterLambda-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const logsAllowStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["logs:*"],
            resources: ["*"],
        });

        const replaysBucketWriteStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["s3:*"],
            resources: [replaysBucket.bucket.bucketArn + "/*"],
        });

        const replaysBucketReadStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["s3:*"],
            resources: [replaysBucket.bucket.bucketArn + "/*"],
        });

        const teamsBucketWriteStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["s3:*"],
            resources: [teamsBucket.bucket.bucketArn + "/*"],
        });

        const teamsBucketReadStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["s3:*"],
            resources: [teamsBucket.bucket.bucketArn + "/*"],
        });

        const extractionLambdaRole = new Role(
            this,
            `ExtractionLambdaRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Replay Extraction Lambda",
            }
        );
        extractionLambdaRole.addToPolicy(replaysBucketWriteStatement);
        extractionLambdaRole.addToPolicy(logsAllowStatement);

        const extractionLambda = new PsReplayExtractionLambda(
            this,
            `PsReplayExtractionLambda-${props.stageConfig.stageName}`,
            {
                stageName: props.stageConfig.stageName,
                ecrRepo: extractionEcrRepo.ecrRepo,
                replaysBucketName: replaysBucket.bucket.bucketName,
                role: extractionLambdaRole,
            }
        );

        const transformLambdaRole = new Role(
            this,
            `TransformLambdaRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Replay Transform Lambda",
            }
        );
        transformLambdaRole.addToPolicy(replaysBucketReadStatement);
        transformLambdaRole.addToPolicy(teamsBucketWriteStatement);
        transformLambdaRole.addToPolicy(logsAllowStatement);

        const transformLambda = new PsReplayTransformLambda(
            this,
            `PsReplayTransformLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: transformEcrRepo.ecrRepo,
                stageName: props.stageConfig.stageName,
                teamsBucketName: teamsBucket.bucket.bucketName,
                role: transformLambdaRole,
            }
        );

        const twitterWriterLambdaRole = new Role(
            this,
            `PsTeamTwitterWriterLambdaRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Team Twitter Writer Lambda",
            }
        );
        twitterWriterLambdaRole.addToPolicy(teamsBucketReadStatement);
        twitterWriterLambdaRole.addToPolicy(logsAllowStatement);

        const twitterWriterLambda = new PsTeamTwitterWriterLambda(
            this,
            `PsTeamTwitterWriterLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: twitterWriterEcrRepo.ecrRepo,
                stageName: props.stageConfig.stageName,
                twitterAccessCredentials: this.getTwitterSecrets(
                    props.stageConfig.isProd,
                    orderUpTwitterCreds
                ),
                role: twitterWriterLambdaRole,
            }
        );

        const ingestionStateMachine = new PsIngestionStateMachine(
            this,
            `PsIngestionStateMachine-${props.stageConfig.stageName}`,
            {
                stageName: props.stageConfig.stageName,
                replayExtractionLambda: extractionLambda.lambdaFunction,
                transformExtractionLambda: transformLambda.lambdaFunction,
                twitterWriterLambda: twitterWriterLambda.lambdaFunction,
            }
        );

        const ingestionEventBridge = new PsIngestionEventBridge(
            this,
            `PsIngestionEventBridge-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        // Send format object to the targeted Lambda
        ingestionEventBridge.eventRule.addTarget(
            new SfnStateMachine(ingestionStateMachine.stateMachine, {
                input: RuleTargetInput.fromObject({ format: VGC_FORMAT }),
            })
        );

        const ingestionAlarm = new PsIngestionAlarms(
            this,
            `PsIngestionAlarms-${props.stageConfig.stageName}`,
            {
                psIngestionStateMachine: ingestionStateMachine.stateMachine,
                stageName: props.stageConfig.stageName,
            }
        );

        const emailTopic = new EmailSnsTopic(
            this,
            `PsIngestionEmailSns-${props.stageConfig.stageName}`,
            {
                serviceName: "PsIngestion",
                email: STATSUGIRI_EMAIL,
                stageName: props.stageConfig.stageName,
            }
        );
        ingestionAlarm.alarm.addAlarmAction(new SnsAction(emailTopic.topic));
    }

    private getTwitterSecrets(
        isProd: boolean,
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
            twitterDisplayName: isProd
                ? PROD_TWITTER_DISPLAY_NAME
                : DEV_TWITTER_DISPLAY_NAME,
        };
    }
}
