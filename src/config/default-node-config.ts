export const defaultNodeConfig = {
  autoRestart: true,
}

export type nodeConfigType = typeof defaultNodeConfig

export const nodeConfigSchema = {
  type: 'object',
  properties: {
    autoRestart: {
      type: 'boolean',
    },
  },
  required: ['autoRestart'],
}
