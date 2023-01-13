export const defaultConfig = {
  server: {
    baseDir: '.',
    p2p: {
      existingArchivers: [
        {
          ip: 'localhost',
          port: 4000,
          publicKey:
            '758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3',
        },
      ],
    },
    ip: {
      externalIp: '127.0.0.1',
      externalPort: 9006,
      internalIp: '127.0.0.1',
      internalPort: 10006,
    },
    reporting: {
      report: true,
      recipient: 'http://localhost:3000/api',
      interval: 2,
      console: false,
    },
  },
};

export type configType = typeof defaultConfig;
