import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
    Alarm,
    AlarmRule,
    ComparisonOperator,
    CompositeAlarm,
    Statistic,
    TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface PsTeamsServiceAlarmsProps {
    readonly psTeamsServiceLambda: IFunction;
    readonly stageName: string;
}

export class PsTeamsServiceAlarms extends Construct {
    readonly errorAlarm: Alarm;
    readonly throttleAlarm: Alarm;
    readonly compositeAlarm: CompositeAlarm;

    constructor(
        scope: Construct,
        id: string,
        props: PsTeamsServiceAlarmsProps
    ) {
        super(scope, id);

        this.errorAlarm = new Alarm(
            this,
            `PsTeamsServiceLambdaErrorAlarm-${props.stageName}`,
            {
                metric: props.psTeamsServiceLambda.metricErrors({
                    period: cdk.Duration.minutes(1),
                    statistic: Statistic.AVERAGE,
                }),
                threshold: 10,
                evaluationPeriods: 1,
                datapointsToAlarm: 1,
                comparisonOperator:
                    ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                treatMissingData: TreatMissingData.NOT_BREACHING,
                alarmDescription:
                    "PS Teams Service Lambda is receiving errors.",
            }
        );

        this.throttleAlarm = new Alarm(
            this,
            `PsTeamsServiceLambdaThrottleAlarm-${props.stageName}`,
            {
                metric: props.psTeamsServiceLambda.metricThrottles({
                    period: cdk.Duration.minutes(5),
                    statistic: Statistic.AVERAGE,
                }),
                threshold: 5,
                evaluationPeriods: 3,
                datapointsToAlarm: 3,
                comparisonOperator:
                    ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                treatMissingData: TreatMissingData.NOT_BREACHING,
                alarmDescription: "PS Teams Service Lambda is throttling.",
            }
        );

        const compositeAlarm = new CompositeAlarm(
            this,
            `PsTeamsServiceLambdaCompositeAlarm-${props.stageName}`,
            {
                compositeAlarmName: `PsTeamsServiceLambdaCompositeAlarm-${props.stageName}`,
                alarmDescription: "PS Teams Service Lambda is in alarm!",
                alarmRule: AlarmRule.anyOf(this.errorAlarm, this.throttleAlarm),
                actionsEnabled: true,
            }
        );
    }
}
