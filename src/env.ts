import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str({
    desc: 'The questdb connection string',
    example: 'http::addr=localhost:9000;username=admin;password=quest;',
  }),
  PINO_LOG_LEVEL: str({
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
  }),
  CHANNELS: str({
    desc: 'A comma-separated list of channels to observe chat messages from',
    example: 'xqc,staiy,dracon',
  }),
});
