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
                // 8 PM UTC everyday (12 PM PST / 3 PM EST)
                schedule: Schedule.cron({
                    minute: "0",
                    hour: "20",
                }),
            }
        );
    }
}
