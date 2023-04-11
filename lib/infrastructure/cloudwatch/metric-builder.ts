import { Metric } from "aws-cdk-lib/aws-cloudwatch";

export function buildLambdaMetric(
    lambdaName: string,
    metricName: string,
    statistic: string = "Sum"
): Metric {
    return new Metric({
        namespace: "AWS/Lambda",
        metricName: metricName,
        dimensionsMap: {
            FunctionName: lambdaName,
            Resource: lambdaName,
        },
        statistic: statistic,
    });
}
