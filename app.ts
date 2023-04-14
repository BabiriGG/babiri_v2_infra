import * as cdk from "aws-cdk-lib";
import {
    StageConfig,
    BetaStageConfig,
    ProdStageConfig,
} from "./lib/constants/stage-config";
import { PsIngestionTeamsTable } from "./lib/infrastructure/dynamodb/ps-ingestion-teams-table";
import {
    PsIngestionStack,
    PsIngestionStackProps,
} from "./lib/stacks/ps-ingestion-stack";
import {
    PsTeamsServiceStack,
    PsTeamsServiceStackProps,
} from "./lib/stacks/ps-teams-service-stack";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import {
    StatsugiriApiGatewayStack,
    StatsugiriApiGatewayStackProps,
} from "./lib/stacks/statsugiri-api-gateway-stack";
import { STATSUGIRI_GG_DOMAIN } from "./lib/constants/statsugiri-constants";

export class StatsugiriInfrastructureApp extends cdk.App {
    public setupBeta() {
        const stage = this.createBetaStage();
        return this;
    }

    public setupProd() {
        const stage = this.createProdStage();
        return this;
    }

    /**
     * Creates a beta stage
     * @returns the created stage
     */
    private createBetaStage() {
        let betaStacks = new Array<cdk.Stack>();
        const psIngestionStack = this.setupPsIngestionStack(BetaStageConfig);
        const psTeamsServiceStack = this.setupPsTeamsServiceStack(
            BetaStageConfig,
            psIngestionStack.teamsTable
        );
        betaStacks.push(psIngestionStack);
        betaStacks.push(psTeamsServiceStack);

        console.log(psTeamsServiceStack.psTeamsServiceApi);

        betaStacks.push(
            this.setupStatsugiriApiGatewayStack(
                BetaStageConfig,
                STATSUGIRI_GG_DOMAIN,
                psTeamsServiceStack.psTeamsServiceApi.lambdaApi
            )
        );
    }

    /**
     * Creates a beta stage
     * @returns the created stage
     */
    private createProdStage() {
        let prodStacks = new Array<cdk.Stack>();
        const psIngestionStack = this.setupPsIngestionStack(ProdStageConfig);
        const psTeamsServiceStack = this.setupPsTeamsServiceStack(
            ProdStageConfig,
            psIngestionStack.teamsTable
        );
        prodStacks.push(psIngestionStack);
        prodStacks.push(psTeamsServiceStack);

        prodStacks.push(
            this.setupStatsugiriApiGatewayStack(
                ProdStageConfig,
                STATSUGIRI_GG_DOMAIN,
                psTeamsServiceStack.psTeamsServiceApi.lambdaApi
            )
        );
    }

    private setupPsIngestionStack(stageConfig: StageConfig) {
        const psIngestionStackProps: PsIngestionStackProps = {
            stageConfig: stageConfig,
        };

        return new PsIngestionStack(
            this,
            `PsIngestionStack-${stageConfig.stageName}`,
            psIngestionStackProps
        );
    }

    private setupPsTeamsServiceStack(
        stageConfig: StageConfig,
        teamsTable: PsIngestionTeamsTable
    ) {
        const psTeamsServiceStackProps: PsTeamsServiceStackProps = {
            stageConfig: stageConfig,
            teamsTable: teamsTable,
        };

        return new PsTeamsServiceStack(
            this,
            `PsTeamsServiceStack-${stageConfig.stageName}`,
            psTeamsServiceStackProps
        );
    }

    private setupStatsugiriApiGatewayStack(
        stageConfig: StageConfig,
        domainName: string,
        psTeamsServiceApi: LambdaRestApi
    ) {
        const statsugiriApiGatewayStackProps: StatsugiriApiGatewayStackProps = {
            stageConfig: stageConfig,
            domainName: domainName,
            psTeamsServiceApi: psTeamsServiceApi,
        };

        return new StatsugiriApiGatewayStack(
            this,
            `StatsugiriApiGatewayStack-${stageConfig.stageName}`,
            statsugiriApiGatewayStackProps
        );
    }
}

new StatsugiriInfrastructureApp().setupBeta().setupProd().synth();
