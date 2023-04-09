import { Construct } from "constructs";
import { StageConfig } from "../../constants";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface PsTeamsServiceApiGatewayProps {
    stageConfig: StageConfig;
    psTeamsServiceLambda: IFunction;
}

export class PsTeamsServiceApiGateway extends Construct {
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
        });

        const healthApiRoot = this.lambdaApi.root.addResource("health");
        healthApiRoot.addMethod("GET"); // GET /health

        const teamApiRoot = this.lambdaApi.root.addResource("team");
        const getTeamResource = teamApiRoot.addResource("{team_id}");
        getTeamResource.addMethod("GET"); // GET /team/{team_id}

        const teamsApiRoot = this.lambdaApi.root.addResource("teams");
        const getTeamsFormatResource = teamsApiRoot.addResource("{format}");
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
    }
}
