import { Construct } from "constructs";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { LogLevel, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export interface PsIngestionStateMachineProps {
    readonly stageName: string;
    readonly replayExtractionLambda: IFunction;
    readonly transformExtractionLambda: IFunction;
    readonly ddbWriteLambda: IFunction;
}

export class PsIngestionStateMachine extends Construct {
    readonly stateMachine: StateMachine;
    constructor(
        scope: Construct,
        id: string,
        props: PsIngestionStateMachineProps
    ) {
        super(scope, id);
        const replayExtractionJob = new LambdaInvoke(
            this,
            `InvokeReplayExtraction-${props.stageName}`,
            {
                lambdaFunction: props.replayExtractionLambda,
            }
        );
        const replayTransformJob = new LambdaInvoke(
            this,
            `InvokeReplayTransformation-${props.stageName}`,
            {
                lambdaFunction: props.transformExtractionLambda,
            }
        );
        const ddbWriteJob = new LambdaInvoke(
            this,
            `InvokeDdbWrite-${props.stageName}`,
            {
                lambdaFunction: props.ddbWriteLambda,
            }
        );

        const logGroup = new LogGroup(
            this,
            `PsIngestionStateMachineLogGroup-${props.stageName}`
        );
        this.stateMachine = new StateMachine(
            this,
            `PsIngestionStateMachine-${props.stageName}`,
            {
                definition: replayExtractionJob
                    .next(replayTransformJob)
                    .next(ddbWriteJob),
                logs: {
                    destination: logGroup,
                    level: LogLevel.ALL,
                },
            }
        );
    }
}
