import { Construct } from "constructs";
import { StageConfig } from "../../constants";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Deployment, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export interface PsTeamsServiceApiGatewayProps {
    stageConfig: StageConfig;
    psTeamsServiceLambda: IFunction;
}

export class PsTeamsServiceRestApi extends Construct {
    readonly lambdaApi: LambdaRestApi;

    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsServiceApiGatewayProps
    ) {
        super(scope, id);
        this.lambdaApi = new LambdaRestApi(this, id, {
            handler: props.psTeamsServiceLambda,
            proxy: false,
            deployOptions: {
                stageName: props.stageConfig.stageName,
            },
        });

        const healthApiResource = this.lambdaApi.root.addResource("health");
        healthApiResource.addMethod("GET"); // GET /health

        const teamApiResource = this.lambdaApi.root.addResource("team");
        const getTeamResource = teamApiResource.addResource("{team_id}");
        getTeamResource.addMethod("GET"); // GET /team/{team_id}

        const teamsApiRoot = this.lambdaApi.root.addResource("teams");
        const getTeamsFormatResource = teamsApiRoot.addResource("{format}");

        const getTeamsTodayResource =
            getTeamsFormatResource.addResource("today");
        getTeamsTodayResource.addMethod("GET");

        const getTeamsDateResource =
            getTeamsFormatResource.addResource("{date}");
        getTeamsDateResource.addMethod("GET", undefined, {
            requestParameters: {
                "method.request.querystring.pkmn": false,
                "method.request.querystring.pkmn2": false,
                "method.request.querystring.pkmn3": false,
                "method.request.querystring.pkmn4": false,
                "method.request.querystring.pkmn5": false,
                "method.request.querystring.pkmn6": false,
            },
        }); // GET /teams/{format}/{date}

        const deployment = new Deployment(
            this,
            `PsTeamsServiceApiDeployment-${props.stageConfig.stageName}`,
            { api: this.lambdaApi }
        );
    }
}
