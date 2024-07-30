# Overview

The Operator CLI is a command line tool for managing a validator instance on a Shardeum network. The Operator CLI tool also collects debug data from running Shardus app network.

## Getting Started with Local Development

Before running Shardus CLI, it's essential to set up the Shardeum server. Detailed instructions for this setup can be found in the [Shardeum README](https://github.com/shardeum/shardeum).

### Cloning and Preparing the CLI

Clone the Shardus CLI repository and navigate into the project directory:

```bash
git clone git@github.com:shardeum/validator-cli.git
cd validator-cli
```

The validator CLI typically requires a symlink to the Shardeum repo at a specific path. If you're running the CLI manually, ensure the symlink is set up correctly:

```bash
ln -s /path/to/shardeum/repo ../validator
ls ../validator                                # Should print the shardeum repo
```

### Installing Dependencies

Install the necessary dependencies and link the CLI for global accessibility:

```bash
npm ci && npm link
```

### Utilizing the Shardus CLI

You can customize network configuration in [default-network-config.ts](./src/config/default-network-config.ts) file. After configuring, make sure to compile again using `npm run compile`.

`default-network-config.ts` config for running a local network node:

```ts
export const defaultNetworkConfig = {
  server: {
    baseDir: '.',
    p2p: {
      existingArchivers: [
        {
          ip: '127.0.0.1',
          port: 4000,
          publicKey:
            '758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3',
        },
      ],
    },
    ip: {
      externalIp: '127.0.0.1',
      externalPort: 9050,
      internalIp: '127.0.0.1',
      internalPort: 10045,
    },
    reporting: {
      report: true,
      recipient: 'http://localhost:3000/api',
      interval: 2,
      console: false,
    },
  },
};
```

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