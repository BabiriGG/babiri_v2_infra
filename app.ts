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
        betaStacks.push(psIngestionStack);
        betaStacks.push(
            this.setupPsTeamsServiceStack(
                BetaStageConfig,
                psIngestionStack.teamsTable
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
        prodStacks.push(psIngestionStack);
        prodStacks.push(
            this.setupPsTeamsServiceStack(
                ProdStageConfig,
                psIngestionStack.teamsTable
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
}

new StatsugiriInfrastructureApp().setupBeta().setupProd().synth();
