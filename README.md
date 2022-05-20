# Sitka Landslide Risk Forecasting

Currently this project consists only of a Next.js front-end. It is meant to be run directly on the host machine (not within a container or VM).

## Requirements

- [nvm](https://github.com/creationix/nvm) to manage Node versions on your machine
- [yvm](https://yvm.js.org/docs/overview) to manage Yarn versions for package management

## Development

### Getting started

1. Make sure you have `nvm` and `yvm` installed (see links in [Requirements](#requirements))
1. Run `./scripts/setup`
1. Run `./scripts/server`. The dev server will be at http://localhost:3008.

Note that it is recommended to configure your editor to auto-format your code via Prettier on save.

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

We have no terraform tfvars to download so it's just:

```
$ cd deployment/terraform
$ terraform plan
check output for sanity
$ terraform apply
check output for sanity
```
