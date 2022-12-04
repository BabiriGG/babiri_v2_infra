export const BETA_STAGE = "Beta";
export const PROD_STAGE = "Prod";

export interface StageConfig {
    region: string;
    stageName: string;
    isProd: boolean;
}

export const BetaStageConfig: StageConfig = {
    region: "us-east-1",
    stageName: BETA_STAGE,
    isProd: false,
};

export const ProdStageConfig: StageConfig = {
    region: "us-east-1",
    stageName: PROD_STAGE,
    isProd: true,
};
