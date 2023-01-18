export const ORDERUP_TWITTER_CREDS_SECRETS = "OrderUp-Twitter-Creds";
export const TWITTER_ACCESS_TOKEN_NAME = "TWITTER_ACCESS_TOKEN";
export const TWITTER_ACCESS_TOKEN_SECRET_NAME = "TWITTER_ACCESS_TOKEN_SECRET";
export const TWITTER_API_KEY_NAME = "TWITTER_API_KEY";
export const TWITTER_API_KEY_SECRET_NAME = "TWITTER_API_KEY_SECRET";
export const PROD_TWITTER_DISPLAY_NAME = "OrderUpTeamsBot";
export const DEV_TWITTER_DISPLAY_NAME = "TestOrderUpBot";

export interface TwitterAccessCredentials {
    readonly twitterAccessToken: string;
    readonly twitterAccessTokenSecret: string;
    readonly twitterApiKey: string;
    readonly twitterApiKeySecret: string;
    readonly twitterDisplayName: string;
}
