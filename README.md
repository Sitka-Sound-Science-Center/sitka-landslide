# Sitka Landslide Risk Forecasting

Currently this project consists only of a Next.js front-end. It is meant to be run directly on the host machine (not within a container or VM).

## Requirements

- [nvm](https://github.com/creationix/nvm) to manage Node versions on your machine
- [yvm](https://yvm.js.org/docs/overview) to manage Yarn versions for package management

_Note:_ Some Mac users have gotten silent failures when the scripts try to activate nvm. If the scripts just exit without doing their job, it might help to upgrade or downgrade nvm to a version that's working for someone else.

## Development

### Getting started

1. Make sure you have `nvm` and `yvm` installed (see links in [Requirements](#requirements))
1. Run `./scripts/setup`
1. Run `./scripts/server`. The dev server will be at http://localhost:3008.

Note that it is recommended to configure your editor to auto-format your code via Prettier on save.

#### Emergency test version of rainfall.json

The first thing that `scripts/server` does is get current data from the two weather APIs and write it to `frontend/data/rainfall.json` for the app to use.  If either of those APIs is down, that download will fail, and if you don't already have an old copy of `rainfall.json` locally, you won't be able to run the app.  To work around this infrequent but serious blocker without having to maintain a complete data fixture, we have the build include the `rainfall.json` file in the published assets.

So when you the APIs are down, you should still be able to get the most recent successfully-retrieved data file at https://sitkalandslide.org/data/rainfall.json.

## Components

- The front-end, a [Next.js](https://nextjs.org/docs) app. See [frontend](frontend).

## Ports

| Port                          | Service                                                   |
| ----------------------------- | --------------------------------------------------------- |
| [3008](http://localhost:3008) | [Next.js](https://nextjs.org/)-based frontend application |

## Scripts

### Scripts to Rule Them All (STRTA)

| Name        | Description                                  |
| ----------- | -------------------------------------------- |
| `setup`     | Get set up for development                   |
| `server`    | Run application dev server                   |
| `update`    | Update dependencies                          |
| `lint`      | Check for lint and formatting problems       |
| `cipublish` | Building and publish the docker image to ECR |

## Deployment

To run the deployment commands, you'll need an AWS access key pair for the Sitka AWS account. It should be configured as a profile named `sitka`.

### Infrastructure

You'll need the [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli) installed, with a version that satisfies the required version in `versions.tf`.
Since we currently have no tfvars file, there's nothing to download.

From the `deployment/terraform` directory, first initialize and plan:

```
export AWS_PROFILE=sitka
terraform init -backend-config="bucket=sitka-production-config-us-west-2"
terraform plan
```

Check the output to make sure it's going to do what you think it should, and no more. Then apply:

```
terraform apply
```

Check the output of that command to make sure it did what you expected.

### Code

The application code is published as a Docker container, which gets run periodically by a scheduled ECS task to update the static site.

To build and publish the code, make sure your local checkout is in the state you want to publish (on the right branch, up to date, and with no local modifications to tracked files) then run:

```
./scripts/cipublish
```

The newly published code will be used the next time the automatic site rebuild is triggered. To update the static site immediately, you can trigger a build by going to [the ECS console](https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/clusters/sitkaproduction/tasks) and clicking "Run new Task". You can use the parameters in the "Targets" tab of the scheduling rule on [EventBridge](https://us-west-2.console.aws.amazon.com/events/home?region=us-west-2#/rules) as a reference for setting the runtime parameters.
