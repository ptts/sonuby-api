import { pinoLogger } from 'hono-pino';
import { pino } from 'pino';
import type { AppEnv } from '../types';

export const pinoLoggerMiddleware = () => {
  const loggerInstance = pino({
    level: 'warn',
  });

  return pinoLogger({
    pino: loggerInstance,
    contextKey: 'logger' as const satisfies keyof AppEnv['Variables'],
    http: {
      referRequestIdKey:
        'requestId' as const satisfies keyof AppEnv['Variables'],
      responseTime: true,
    },
  });
};
