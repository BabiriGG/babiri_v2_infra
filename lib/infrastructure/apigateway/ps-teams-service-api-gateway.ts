import { Construct } from "constructs";
import { StageConfig } from "../../constants";
import {
    BasePathMapping,
    Deployment,
    DomainName,
    EndpointType,
    LambdaRestApi,
    SecurityPolicy,
} from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, CnameRecord, HostedZone } from "aws-cdk-lib/aws-route53";

export interface PsTeamsServiceApiGatewayProps {
    stageConfig: StageConfig;
    psTeamsServiceLambda: IFunction;
    certificate: Certificate;
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
            deployOptions: {
                stageName: props.stageConfig.stageName,
            },
        });

        const domain = new DomainName(
            this,
            `PsTeamsServiceDomainName-${props.stageConfig.stageName}`,
            {
                domainName: "api.statsugiri.gg",
                certificate: props.certificate,
                securityPolicy: SecurityPolicy.TLS_1_2,
                endpointType: EndpointType.EDGE,
            }
        );
        new BasePathMapping(
            this,
            `PsTeamsServiceBaseMapping-${props.stageConfig.stageName}`,
            {
                domainName: domain,
                restApi: this.lambdaApi,
            }
        );

        // TODO: Move this somewhere shared potentially
        const hostedZone = new HostedZone(
            this,
            `PsTeamsServiceHostedZone-${props.stageConfig.stageName}`,
            {
                zoneName: "statsugiri.gg",
            }
        );

        new CnameRecord(this, `PsTeamsService-${props.stageConfig.stageName}`, {
            recordName: "custom",
            zone: hostedZone,
            domainName: domain.domainNameAliasDomainName,
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

        const deployment = new Deployment(
            this,
            `PsTeamsServiceApiDeployment-${props.stageConfig.stageName}`,
            { api: this.lambdaApi }
        );
    }
}
