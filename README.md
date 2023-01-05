# Statsugiri Infrastructure

Infrastructure for deploying the [Statsugiri](https://github.com/StatsugiriGG/Statsugiri) monorepo. Provisioned by [AWS CDK](https://aws.amazon.com/cdk/).

## Testing

### Pre-Flight Steps

#### Assume AWS Account Role

Create an [Amazon Web Services](https://aws.amazon.com/) account. Run [`aws configure`](https://docs.aws.amazon.com/cli/latest/reference/configure/) and follow the prompts.

#### Create ECR Repos

Elastic Container Registry (ECR) repositories must be created with an available image prior to deploying. For manual image pushes, please refer to your ECR console's push commands.

| Project               | ECR Repo Name         |
| --------------------- | --------------------- |
| `ps_ingestion_lambda` | `ps-ingestion-lambda` |

#### Configure ECR Image Tags to Deploy

Specify the tag you wish to deploy in `Beta` and `Prod` in `constants/ecr-constants.ts`. The default `Beta` tag is `latest`.

#### Create Secrets Manager Store

Push sensitive credentials (eg. Twitter Access Tokens) to Secrets Manager. `<STAGE>` can be either `Prod` or `Beta`.

| Secret Name                     | Secret Value                  |
| ------------------------------- | ----------------------------- |
| `OrderUp-Twitter-Creds-<STAGE>` | `TWITTER_ACCESS_TOKEN`        |
|                                 | `TWITTER_ACCESS_TOKEN_SECRET` |
|                                 | `TWITTER_API_KEY`             |
|                                 | `TWITTER_API_KEY_SECRET`      |

### Deployment

-   `npm run build` to compile package
-   `cdk synth` to view synthesized CloudFormation template
-   `cdk list` to list built stacks
-   `cdk deploy <STACK>` to deploy stack to assumed AWS account
