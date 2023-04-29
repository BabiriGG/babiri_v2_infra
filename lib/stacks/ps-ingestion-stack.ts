import * as cdk from "aws-cdk-lib";
import { RuleTargetInput } from "aws-cdk-lib/aws-events";
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { PsReplayExtractionLambda } from "../infrastructure/lambda/ps-replay-extraction-lambda";
import { PsIngestionEventBridge } from "../infrastructure/eventbridge/ps-ingestion-eventbridge";
import { PsIngestionAlarms } from "../infrastructure/cloudwatch/ps-ingestion-alarms";
import { PsIngestionReplaysBucket } from "../infrastructure/s3/ps-ingestion-replays-bucket";
import { PsIngestionTeamsBucket } from "../infrastructure/s3/ps-ingestion-teams-bucket";
import { StageConfig } from "../constants/stage-config";
import { VGC_FORMAT, OU_FORMAT } from "../constants/ps-constants";
import { STATSUGIRI_EMAIL } from "../constants/statsugiri-constants";
import { EmailSnsTopic } from "../infrastructure/sns/email-sns-topics";
import { PsReplayExtractionLambdaEcrRepo } from "../infrastructure/ecr/ps-replay-extraction-lambda-ecr-repo";
import { PsReplayTransformLambdaEcrRepo } from "../infrastructure/ecr/ps-replay-transform-lambda-ecr-repo";
import { PsReplayTransformLambda } from "../infrastructure/lambda/ps-replay-transform-lambda";
import { PsIngestionStateMachine } from "../infrastructure/stepfunctions/ps-ingestion-state-machine";
import {
    PolicyStatement,
    Effect,
    Role,
    ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { PsIngestionTeamsTable } from "../infrastructure/dynamodb/ps-ingestion-teams-table";
import { PsTeamsDdbWriterLambda } from "../infrastructure/lambda/ps-teams-ddb-writer-lambda";
import { PsTeamsDdbWriterLambdaEcrRepo } from "../infrastructure/ecr/ps-teams-ddb-writer-lambda-ecr-repo";

export interface PsIngestionStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
}

export class PsIngestionStack extends cdk.Stack {
    // Shared with PS Teams Service
    public readonly teamsTable: PsIngestionTeamsTable;

    constructor(scope: cdk.App, id: string, props: PsIngestionStackProps) {
        super(scope, id, props);

        this.teamsTable = new PsIngestionTeamsTable(
            this,
            `PsIngestionTeamsTable-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
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
        const ddbWriteEcrRepo = new PsTeamsDdbWriterLambdaEcrRepo(
            this,
            `DdbWriteEcrRepo-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const logsAllowStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["logs:*"],
            resources: ["*"],
        });

        const extractionLambdaRole = new Role(
            this,
            `ExtractionLambdaRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Replay Extraction Lambda",
            }
        );
        replaysBucket.bucket.grantWrite(extractionLambdaRole);
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
        replaysBucket.bucket.grantRead(transformLambdaRole);
        teamsBucket.bucket.grantWrite(transformLambdaRole);
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

        const ddbWriteLambdaRole = new Role(
            this,
            `DdbWriteLambdaRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Teams DynamoDB Writer Lambda",
            }
        );
        teamsBucket.bucket.grantRead(ddbWriteLambdaRole);
        this.teamsTable.table.grantWriteData(ddbWriteLambdaRole);
        ddbWriteLambdaRole.addToPolicy(logsAllowStatement);

        const ddbWriteLambda = new PsTeamsDdbWriterLambda(
            this,
            `PsTeamsDdbWriterLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: ddbWriteEcrRepo.ecrRepo,
                stageName: props.stageConfig.stageName,
                role: ddbWriteLambdaRole,
                tableName: this.teamsTable.table.tableName,
            }
        );

        const ingestionStateMachine = new PsIngestionStateMachine(
            this,
            `PsIngestionStateMachine-${props.stageConfig.stageName}`,
            {
                stageName: props.stageConfig.stageName,
                replayExtractionLambda: extractionLambda.lambdaFunction,
                transformExtractionLambda: transformLambda.lambdaFunction,
                ddbWriteLambda: ddbWriteLambda.lambdaFunction,
            }
        );

        const vgcIngestionEventBridge = new PsIngestionEventBridge(
            this,
            `VgcPsIngestionEventBridge-${props.stageConfig.stageName}`,
            {
                stageName: props.stageConfig.stageName,
                cronHour: "22",
                cronMinute: "0",
            }
        );

        const ouIngestionEventBridge = new PsIngestionEventBridge(
            this,
            `OuPsIngestionEventBridge-${props.stageConfig.stageName}`,
            {
                stageName: props.stageConfig.stageName,
                cronHour: "22",
                cronMinute: "15",
            }
        );

        // Send format object to the targeted Lambda
        vgcIngestionEventBridge.eventRule.addTarget(
            new SfnStateMachine(ingestionStateMachine.stateMachine, {
                input: RuleTargetInput.fromObject({ format: VGC_FORMAT }),
            })
        );

        ouIngestionEventBridge.eventRule.addTarget(
            new SfnStateMachine(ingestionStateMachine.stateMachine, {
                input: RuleTargetInput.fromObject({ format: OU_FORMAT }),
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
                serviceName: "PsIngestionService",
                email: STATSUGIRI_EMAIL,
                stageName: props.stageConfig.stageName,
            }
        );
        ingestionAlarm.alarm.addAlarmAction(new SnsAction(emailTopic.topic));
    }
}
