import * as cdk from "aws-cdk-lib";
import { BetaStageConfig, ProdStageConfig } from "./lib/constants";
import { StageConfig } from "./lib/constants";
import {
    DataIngestionStack,
    DataIngestionStackProps,
} from "./lib/stacks/data_ingestion_stack";

export class BabiriV2InfrastructureApp extends cdk.App {
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
        betaStacks.push(this.setupDataIngestionStack(BetaStageConfig));
    }

    /**
     * Creates a beta stage
     * @returns the created stage
     */
    private createProdStage() {
        let prodStacks = new Array<cdk.Stack>();
        prodStacks.push(this.setupDataIngestionStack(ProdStageConfig));
    }

    private setupDataIngestionStack(stageConfig: StageConfig) {
        const dataIngestionStackProps: DataIngestionStackProps = {
            stageName: stageConfig.stageName,
        };
        return new DataIngestionStack(
            this,
            `DataIngestionStack-${stageConfig.stageName}`,
            dataIngestionStackProps
        );
    }
}

new BabiriV2InfrastructureApp().setupBeta().setupProd().synth();
