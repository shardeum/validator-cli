export type FailedAttempt = {
  ip: string
  count: number
}
export const defaultGuiConfig = {
  gui: {
    port: 8080,
    pass: '',
    failedAttempts: [{ ip: '', count: 0 }],
  },
}

export type guiConfigType = typeof defaultGuiConfig

export const guiConfigSchema = {
  type: 'object',
  properties: {
    gui: {
      type: 'object',
      properties: {
        port: {
          type: 'integer',
          minimum: 1024,
          maximum: 65535,
        },
        pass: {
          type: 'string',
        },
        failedAttempts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ip: { type: 'string' },
              count: { type: 'integer' },
            },
            required: ['ip', 'count'],
            additionalProperties: false,
          },
        },
      },
      required: ['port', 'pass', 'failedAttempts'], // Correct placement for 'required'
      additionalProperties: false,
    },
  },
  required: ['gui'],
  additionalProperties: false,
}
