import { Construct } from "constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export interface EmailSnsTopicProps {
    readonly serviceName: string;
    readonly email: string;
    readonly stageName: string;
}

export class EmailSnsTopic extends Construct {
    readonly topic: Topic;

    constructor(scope: Construct, id: string, props: EmailSnsTopicProps) {
        super(scope, id);

        this.topic = new Topic(
            scope,
            `${props.serviceName}EmailTopic-${props.stageName}`,
            {
                displayName: `${props.serviceName}EmailTopic-${props.stageName}`,
            }
        );
        this.topic.addSubscription(new EmailSubscription(props.email));
    }
}
