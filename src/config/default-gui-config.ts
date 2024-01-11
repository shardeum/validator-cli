export const defaultGuiConfig = {
  gui: {
    port: 8080,
    pass: '',
    hashSalt: '',
  },
};

export type guiConfigType = typeof defaultGuiConfig;

export const guiConfigSchema = {
  type: "object",
  properties: {
    gui: {
      type: "object",
      properties: {
        port: {
          type: "integer",
          minimum: 1024,
          maximum: 65535,
        },
        pass: {
          type: "string"
        },
        hashSalt: {
          type: "string"
        },
      },
      required: ["port", "pass", "hashSalt"],
      additionalProperties: false,
    }
  },
  required: ["gui"],
  additionalProperties: false,
};
