import { Construct } from "constructs";
import { Schedule, Rule } from "aws-cdk-lib/aws-events";

export interface PsIngestionEventBridgeProps {
    readonly stageName: string;
}

export class PsIngestionEventBridge extends Construct {
    readonly eventRule: Rule;
    constructor(
        scope: Construct,
        id: string,
        props: PsIngestionEventBridgeProps
    ) {
        super(scope, id);

        this.eventRule = new Rule(
            this,
            `PsIngestionEventBridge-${props.stageName}`,
            {
                // Cron Expressions only available in UTC
                // 10 AM UTC everyday
                schedule: Schedule.cron({
                    minute: "0",
                    hour: "10",
                }),
            }
        );
    }
}
