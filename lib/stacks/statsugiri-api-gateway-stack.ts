import * as cdk from "aws-cdk-lib";
import { StageConfig } from "../constants/stage-config";
import {
    BasePathMapping,
    DomainName,
    EndpointType,
    LambdaRestApi,
    SecurityPolicy,
} from "aws-cdk-lib/aws-apigateway";
import {
    Certificate,
    CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { CnameRecord, HostedZone } from "aws-cdk-lib/aws-route53";
import { PROD_STAGE } from "../constants/stage-config";

export interface StatsugiriApiGatewayStackProps extends cdk.StackProps {
    stageConfig: StageConfig;
    domainName: string;
    // Services to connect to API Gateway
    psTeamsServiceApi: LambdaRestApi;
}

export class StatsugiriApiGatewayStack extends cdk.Stack {
    constructor(
        scope: cdk.App,
        id: string,
        props: StatsugiriApiGatewayStackProps
    ) {
        super(scope, id, props);

        const certificate = new Certificate(
            this,
            `StatsugiriCertificate-${props.stageConfig.stageName}`,
            {
                domainName: `*.${props.domainName}`,
                validation: CertificateValidation.fromDns(),
            }
        );

        const statsugiriApiDomain = new DomainName(
            this,
            `StatsugiriApiDomainName-${props.stageConfig.stageName}`,
            {
                domainName:
                    props.stageConfig.stageName == PROD_STAGE
                        ? `api.${props.domainName}`
                        : `api-dev.${props.domainName}`,
                certificate: certificate,
                securityPolicy: SecurityPolicy.TLS_1_2,
                endpointType: EndpointType.EDGE,
            }
        );

        const psTeamsServiceApiMapping = new BasePathMapping(
            this,
            `PsTeamsServiceApiMapping-${props.stageConfig.stageName}`,
            {
                domainName: statsugiriApiDomain,
                restApi: props.psTeamsServiceApi,
            }
        );

        const statsugiriHostedZone = new HostedZone(
            this,
            `StatsugiriHostedZone-${props.stageConfig.stageName}`,
            {
                zoneName: "statsugiri.gg",
            }
        );

        new CnameRecord(
            this,
            `StatsugiriDomainCnameRecord-${props.stageConfig.stageName}`,
            {
                recordName: "custom",
                zone: statsugiriHostedZone,
                domainName: statsugiriApiDomain.domainNameAliasDomainName,
            }
        );
    }
}
