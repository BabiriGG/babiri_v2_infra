import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Alarm, ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface PsIngestionAlarmsProps {
    readonly psIngestionLamdba: IFunction;
    readonly stageName: string;
}

export class PsIngestionAlarms extends Construct {
    readonly alarm: Alarm;

    constructor(scope: Construct, id: string, props: PsIngestionAlarmsProps) {
        super(scope, id);
        const functionErrors = props.psIngestionLamdba.metricErrors({
            period: cdk.Duration.minutes(1),
        });

        this.alarm = new Alarm(
            this,
            `PsIngestionFunctionErrorAlarm-${props.stageName}`,
            {
                metric: functionErrors,
                threshold: 1,
                comparisonOperator:
                    ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 1,
                alarmDescription:
                    "Alarm if sum of errors greater than or equal to threshold (1) for 1 evaluation period",
            }
        );
    }
}
