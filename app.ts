import * as cdk from "aws-cdk-lib";
import { BetaStageConfig, ProdStageConfig } from "./lib/constants";
import { StageConfig } from "./lib/constants";
import {
    PsIngestionStack,
    PsIngestionStackProps,
} from "./lib/stacks/ps-ingestion-stack";

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
        betaStacks.push(this.setupPsIngestionStack(BetaStageConfig));
    }

    /**
     * Creates a beta stage
     * @returns the created stage
     */
    private createProdStage() {
        let prodStacks = new Array<cdk.Stack>();
        prodStacks.push(this.setupPsIngestionStack(ProdStageConfig));
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
}

new StatsugiriInfrastructureApp().setupBeta().setupProd().synth();
