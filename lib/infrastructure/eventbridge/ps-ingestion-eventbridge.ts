import { Construct } from "constructs";
import { Schedule, Rule } from "aws-cdk-lib/aws-events";

export interface PsIngestionEventBridgeProps {
    readonly stageName: string;
    readonly cronHour: string;
    readonly cronMinute: string;
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
                // 10 PM UTC everyday (3 PM PST / 6 PM EST)
                schedule: Schedule.cron({
                    minute: props.cronMinute,
                    hour: props.cronHour,
                }),
            }
        );
    }
}
