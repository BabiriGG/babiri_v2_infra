import * as cdk from "aws-cdk-lib";
import { StageConfig } from "../constants";
import { PsTeamsServiceLambda } from "../infrastructure/lambda/ps-teams-service-lambda";
import {
    PolicyStatement,
    Effect,
    Role,
    ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { PsTeamsServiceLambdaEcrRepo } from "../infrastructure/ecr/ps-teams-service-lambda-ecr-repo";
import { PsIngestionTeamsTable } from "../infrastructure/dynamodb/ps-ingestion-teams-table";
import { PsTeamsServiceApiGateway } from "../infrastructure/apigateway/ps-teams-service-api-gateway";
import { PsTeamsServiceAlarms } from "../infrastructure/cloudwatch/ps-teams-service-alarms";
import { PsTeamsServiceDashboard } from "../infrastructure/cloudwatch/ps-teams-service-dashboard";

export interface PsTeamsServiceStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
    teamsTable: PsIngestionTeamsTable;
}

export class PsTeamsServiceStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: PsTeamsServiceStackProps) {
        super(scope, id, props);

        const psTeamsServiceEcrRepo = new PsTeamsServiceLambdaEcrRepo(
            this,
            `PsTeamsServiceEcrRepo-${props.stageConfig.stageName}`,
            { stageName: props.stageConfig.stageName }
        );

        const logsAllowStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["logs:*"],
            resources: ["*"],
        });

        const psTeamsServiceRole = new Role(
            this,
            `PsTeamsServiceRole-${props.stageConfig.stageName}`,
            {
                assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
                description: "Role for PS Teams Service Lambda",
            }
        );
        psTeamsServiceRole.addToPolicy(logsAllowStatement);
        props.teamsTable.table.grantReadData(psTeamsServiceRole);

        const psTeamsServiceLambda = new PsTeamsServiceLambda(
            this,
            `PsTeamsServiceLambda-${props.stageConfig.stageName}`,
            {
                ecrRepo: psTeamsServiceEcrRepo.ecrRepo,
                stageName: props.stageConfig.stageName,
                role: psTeamsServiceRole,
                teamsTableName: props.teamsTable.table.tableName,
            }
        );

        const apiGateway = new PsTeamsServiceApiGateway(
            this,
            `PsTeamsServiceApiGateway-${props.stageConfig.stageName}`,
            {
                stageConfig: props.stageConfig,
                psTeamsServiceLambda: psTeamsServiceLambda.lambdaFunction,
            }
        );

        const psTeamsServiceDashboard = new PsTeamsServiceDashboard(
            this,
            `PsTeamsServiceDashboard-${props.stageConfig.stageName}`,
            {
                psTeamsServiceLambda: psTeamsServiceLambda,
                stageConfig: props.stageConfig,
            }
        );
    }
}
