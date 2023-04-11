import { GraphWidget } from "aws-cdk-lib/aws-cloudwatch";
import * as MetricBuilder from "./metric-builder";

export function buildLambdaWidget(
    title: string,
    lambdaName: string
): GraphWidget {
    return new GraphWidget({
        title: title,
        left: [
            MetricBuilder.buildLambdaMetric(lambdaName, "Duration", "Average"),
        ],
        right: [
            MetricBuilder.buildLambdaMetric(
                lambdaName,
                "ConcurrentExecutions",
                "Average"
            ),
            MetricBuilder.buildLambdaMetric(lambdaName, "Invocations"),
            MetricBuilder.buildLambdaMetric(lambdaName, "Errors"),
            MetricBuilder.buildLambdaMetric(lambdaName, "Throttles"),
        ],
    });
}
