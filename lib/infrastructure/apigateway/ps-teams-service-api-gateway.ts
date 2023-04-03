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

        const getHealthEndpoint = this.lambdaApi.root.addResource("health");
        getHealthEndpoint.addMethod("GET");
    }
}
