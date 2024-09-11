# Shardeum Validator CLI

## Overview

The Shardeum Validator CLI is a command-line interface tool designed for managing nodes on the Shardeum network. It provides essential functionality for node management and collects debug data from running the network, making it an imporant part of the Shardeum network toolkit.

## Prerequisites

Before diving into the Validator CLI, ensure you have the following:

- Node.js (v.18.16.1 recommended)
- npm (usually comes with Node.js)
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone git@github.com:shardeum/validator-cli.git
cd validator-cli
```

### 2. Set Up Symlink (Local Network Only)

When running a local network, the Validator CLI requires a symlink to the locally running Shardeum repository. 
Create the symlink by running this command in the cli directory:

```bash
ln -s /path/to/shardeum/repo ../validator
ls ../validator  # Verify the symlink
```

Replace `/path/to/shardeum/repo` with the actual path to your local Shardeum repository.

### 3. Install Dependencies

Install the necessary dependencies and link the CLI to the local network:

```bash
npm ci && npm link
```

## Configuration

#### Local Network Configuration

For a local network setup, update the configuration in the `src/config/default-network-config.ts` file :

```typescript
export const defaultNetworkConfig = {
  server: {
    baseDir: '.',
    p2p: {
      existingArchivers: [
        {
          ip: '127.0.0.1',
          port: 4000,
          publicKey: '758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3',
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

#### Live Network Configuration

For connecting to a live network, update the `defaultNetworkConfig` object with the details of live archivers. For example:

```typescript
export const defaultNetworkConfig = {
  server: {
    // ... other settings remain the same
    p2p: {
      existingArchivers: [
        {
          ip: '198.58.110.213',
          port: 4000,
          publicKey: 'd34b80a5a6f9638b7c75d6eb6e59d35d9a3e103f1877827eebbe973b8281f794',
        },
        // Add more live archivers as needed
      ],
    },
    // ... rest of the configuration remain the same
  },
};
```

Remember to replace the example IP, port, and public key with actual values for the version of the network you're connecting to.

After making changes, recompile the CLI:

```bash
npm run compile
```

## Usage

### Basic Commands

1. Start the CLI:
   ```bash
   operator-cli start
   ```

2. Check CLI status:
   ```bash
   operator-cli status
   ```

3. Set GUI password:
   ```bash
   operator-cli gui set password <your-password>
   ```

### Advanced Usage

For a comprehensive list of available commands:

- Node-related commands: Refer to `src/node-commands.ts`
- GUI-related commands: Check `src/gui-commands.ts`

## Troubleshooting

If you encounter issues:

1. Ensure all prerequisites are correctly installed.
2. Verify the symlink to the Shardeum repository is correct.
3. Check for any error messages in the CLI output.
4. Consult the Shardeum community resources for support.

## Contributing

We welcome contributions to the Shardeum Validator CLI! Please adhere to our [code of conduct](./CODE_OF_CONDUCT.md) when participating in our community. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Community and Support

- For discussions and searchable conversations:
  [Shardeum GitHub Discussions](https://github.com/shardeum/shardeum/discussions)

- For real-time chat and community interaction:
  [Shardeum Discord Server](https://discord.com/invite/shardeum)

## License

[LICENSE](./LICENSE)
