import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3, Duration } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import * as path from "path";

export interface DataIngestionStackProps extends cdk.StackProps {
    stageName: string;
}

export class DataIngestionStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new lambda.DockerImageFunction(this, "MyFirstFunction", {
            functionName: "MyFirstFunction",
            description: "Ingestion entrypoint for Pokémon Showdown team data",
            code: lambda.DockerImageCode.fromImageAsset(
                path.join(__dirname, "docker-handler")
            ),
            timeout: Duration.seconds(60),
            memorySize: 1024,
            logRetention: RetentionDays.ONE_YEAR,
        });
    }
}
