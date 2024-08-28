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

export type networkConfigType = typeof defaultNetworkConfig;

export const networkConfigSchema = {
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        baseDir: {
          type: 'string',
        },
        p2p: {
          type: 'object',
          properties: {
            existingArchivers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ip: {
                    type: 'string',
                  },
                  port: {
                    type: 'integer',
                    minimum: 1024,
                    maximum: 65535,
                  },
                  publicKey: {
                    type: 'string',
                  },
                },
                required: ['ip', 'port', 'publicKey'],
              },
            },
          },
          required: ['existingArchivers'],
        },
        ip: {
          type: 'object',
          properties: {
            externalIp: {
              type: 'string',
            },
            externalPort: {
              type: 'integer',
              minimum: 1024,
              maximum: 65535,
            },
            internalIp: {
              type: 'string',
            },
            internalPort: {
              type: 'integer',
              minimum: 1024,
              maximum: 65535,
            },
          },
          required: [
            'externalIp',
            'externalPort',
            'internalIp',
            'internalPort',
          ],
        },
        reporting: {
          type: 'object',
          properties: {
            report: {
              type: 'boolean',
            },
            recipient: {
              type: 'string',
            },
            interval: {
              type: 'integer',
              minimum: 1,
            },
            console: {
              type: 'boolean',
            },
          },
          required: ['report', 'recipient', 'interval', 'console'],
        },
      },
      required: ['baseDir', 'p2p', 'ip', 'reporting'],
    },
  },
  required: ['server'],
};

export type nodeProgressType = {
  nodeInfo: {
    id: string;
    publicKey: string;
    curvePublicKay: string;
    externalIP: string;
    internalIP: string;
    externalPort: number;
    internalPort: number;
    status: string;
  };
  lastRotationIndex: {
    idx: number;
    total: number;
  };
  activeNodes: number;
  lastActiveTime: number;
  totalActiveTime: number;
};
