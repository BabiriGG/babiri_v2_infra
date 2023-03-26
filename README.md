# Statsugiri Infrastructure

Infrastructure for deploying the [Statsugiri](https://github.com/Statsugiri/Statsugiri) monorepo. Provisioned by [AWS CDK](https://aws.amazon.com/cdk/).

## Deployment

Some stacks may require certain resources to be provisioned before deploying (eg. `PsIngestionStack` should be deployed before `PsTeamsService`).

-   `npm run build` to compile package
-   `cdk synth` to view synthesized CloudFormation template
-   `cdk list` to list built stacks
-   `cdk deploy <STACK>` to deploy stack to assumed AWS account

## Pre-Flight Steps

### Assume AWS Account Role

Create an [Amazon Web Services](https://aws.amazon.com/) account. Run [`aws configure`](https://docs.aws.amazon.com/cli/latest/reference/configure/) and follow the prompts.

### Create ECR Repos

Elastic Container Registry (ECR) repositories must be created with an available image prior to deploying. For manual image pushes, please refer to your ECR console's push commands.

#### PS Ingestion Pipeline Repos

-   `ps-replay-extraction-lambda`
-   `ps-replay-transform-lambda`
-   `ps-teams-ddb-writer-lambda`

### Configure ECR Image Tags to Deploy

Specify the tag you wish to deploy in `Beta` and `Prod` in `constants/ecr-constants.ts`. The default development environment tag is `latest`.
