import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export interface PsIngestionReplaysBucketProps {
    readonly stageName: string;
}

export class PsIngestionReplaysBucket extends Construct {
    readonly bucket: Bucket;
    constructor(
        scope: Construct,
        id: string,
        props: PsIngestionReplaysBucketProps
    ) {
        super(scope, id);

        this.bucket = new Bucket(
            this,
            `PsIngestionReplaysBucket-${props.stageName}`,
            {
                bucketName:
                    `ps-ingestion-replays-bucket-${props.stageName}`.toLowerCase(),
                removalPolicy: RemovalPolicy.DESTROY,
                versioned: false,
            }
        );

        this.bucket.addLifecycleRule({
            expiration: Duration.days(7),
        });
    }
}
