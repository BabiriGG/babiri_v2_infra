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
    }
}
