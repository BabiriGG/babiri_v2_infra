import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export interface PsIngestionTeamsBucketProps {
    readonly stageName: string;
}

export class PsIngestionTeamsBucket extends Construct {
    readonly bucket: Bucket;
    constructor(
        scope: Construct,
        id: string,
        props: PsIngestionTeamsBucketProps
    ) {
        super(scope, id);

        this.bucket = new Bucket(
            this,
            `PsIngestionTeamsBucket-${props.stageName}`,
            {
                bucketName:
                    `ps-ingestion-teams-bucket-${props.stageName}`.toLowerCase(),
                removalPolicy: RemovalPolicy.DESTROY,
                versioned: false,
            }
        );

        this.bucket.addLifecycleRule({
            expiration: Duration.days(7),
        });
    }
}
