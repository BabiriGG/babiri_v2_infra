import { Construct } from "constructs";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export interface PsIngestionTeamsTableProps {
    readonly stageName: string;
}

export class PsIngestionTeamsTable extends Construct {
    readonly table: Table;
    constructor(
        scope: Construct,
        id: string,
        props: PsIngestionTeamsTableProps
    ) {
        super(scope, id);
        this.table = new Table(
            this,
            `PsIngestionTeamsTable-${props.stageName}`,
            {
                tableName: `PsIngestionTeamsTable-${props.stageName}`,
                partitionKey: { name: "team_id", type: AttributeType.STRING },
                sortKey: {
                    name: "format_snapshot_date_composite",
                    type: AttributeType.STRING,
                },
                billingMode: BillingMode.PAY_PER_REQUEST,
                removalPolicy: RemovalPolicy.DESTROY,
            }
        );
        this.table.addGlobalSecondaryIndex({
            indexName: "formatSnapshotDateCompositeIndex",
            partitionKey: {
                name: "format_snapshot_date_composite",
                type: AttributeType.STRING,
            },
            sortKey: {
                name: "rating",
                type: AttributeType.NUMBER,
            },
        });
    }
}
