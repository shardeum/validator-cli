# Overview

The Shardus CLI is a command line tool for managing a Shardeum validator instance used by the Shardeum Validator dashboard. The shardus CLI tool lets you create and manage local test networks running your app. It also collects debug data from a running Shardus app network.

## Getting Started with Local Development

Before running Shardus CLI, it's essential to set up the Shardeum server. Detailed instructions for this setup can be found in the [Shardeum README](https://github.com/shardeum/shardeum).

### Cloning and Preparing the CLI

Clone the Shardus CLI repository and navigate into the project directory:

```bash
git clone git@github.com:shardeum/validator-cli.git
cd validator-cli
```

### Installing Dependencies

Install the necessary dependencies and link the CLI for global accessibility:

```bash
npm ci && npm link
```

### Utilizing the Shardus CLI

You can customize network configuration in [default-network-config.ts](./src/config/default-network-config.ts) file. After confihuring, make sure to compile again using `npm run compile`.

#### Starting the CLI

To initiate the Shardus CLI, run:

```bash
operator-cli start
```

#### Checking CLI Status

```bash
operator-cli status
```

For a complete list of node commands, check the [node-commands.ts](./src/node-commands.ts) file.

For GUI-related commands, refer to the [gui-commands.ts](./src/gui-commands.ts) file.

## Contributing

Contributions are very welcome! Everyone interacting in our codebases, issue trackers, and any other form of communication, including chat rooms and mailing lists, is expected to follow our [code of conduct](./CODE_OF_CONDUCT.md) so we can all enjoy the effort we put into this project.

## Community

For help, discussion about code, or any other conversation that would benefit from being searchable:

[Discuss Shardeum on GitHub](https://github.com/shardeum/shardeum/discussions)

For chatting with others using Shardeum:

[Join the Shardeum Discord Server](https://discord.com/invite/shardeum)