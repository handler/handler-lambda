export interface Env {
  debug: boolean;
  nodeEnv: string;
}

export const env: Env = {
  debug: process.env.DEBUG,
  nodeEnv: process.env.NODE_ENV || 'development',
};
