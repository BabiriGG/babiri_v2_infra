import { Construct } from "constructs";
import { AlarmWidget, Dashboard, TextWidget } from "aws-cdk-lib/aws-cloudwatch";
import { PsTeamsServiceLambda } from "../lambda/ps-teams-service-lambda";
import { PsTeamsServiceAlarms } from "./ps-teams-service-alarms";
import { StageConfig } from "../../constants/stage-config";
import * as WidgetBuilder from "./widget-builder";

export interface PsTeamsServiceDashboardProps {
    readonly psTeamsServiceLambda: PsTeamsServiceLambda;
    readonly stageConfig: StageConfig;
}

export class PsTeamsServiceDashboard extends Construct {
    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsServiceDashboardProps
    ) {
        super(scope, id);

        const psTeamsServiceDashboard = new Dashboard(this, id, {
            dashboardName: `PsTeamsServiceDashboard-${props.stageConfig.stageName}`,
            start: "-P5D",
        });

        const psTeamsServiceAlarm = new PsTeamsServiceAlarms(
            this,
            `PsTeamsServiceAlarms-${props.stageConfig.stageName}`,
            {
                psTeamsServiceLambda: props.psTeamsServiceLambda.lambdaFunction,
                stageName: props.stageConfig.stageName,
            }
        );

        psTeamsServiceDashboard.addWidgets(
            WidgetBuilder.buildLambdaWidget(
                "PS Teams Service Lambda",
                props.psTeamsServiceLambda.lambdaFunction.functionName
            )
        );

        psTeamsServiceDashboard.addWidgets(
            new TextWidget({ markdown: "Lambda alarms", width: 24, height: 1 })
        );
        psTeamsServiceDashboard.addWidgets(
            new AlarmWidget({ alarm: psTeamsServiceAlarm.errorAlarm }),
            new AlarmWidget({ alarm: psTeamsServiceAlarm.throttleAlarm })
        );
    }
}
