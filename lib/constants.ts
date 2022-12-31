export const BETA_STAGE = "Beta";
export const PROD_STAGE = "Prod";

export const PS_INGESTION_LAMBDA_ECR_REPO = "ps-ingestion-lambda";

export const ORDERUP_TWITTER_CREDS = "OrderUp-Twitter-Creds";
export const PROD_TWITTER_DISPLAY_NAME = "OrderUpTeamsBot";
export const DEV_TWITTER_DISPLAY_NAME = "TestOrderUpBot";

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
