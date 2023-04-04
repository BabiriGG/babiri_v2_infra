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

        const getHealthEndpoints = this.lambdaApi.root.addResource("health");
        getHealthEndpoints.addMethod("GET"); // GET /health

        const getTeamsEndpoints = this.lambdaApi.root.addResource("teams");
        const getTeamEndpoint = getTeamsEndpoints.addResource("{team_id}");
        getTeamEndpoint.addMethod("GET"); // GET /teams/{team_id}
    }
}
