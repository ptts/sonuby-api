import { pinoLogger } from 'hono-pino';
import { pino } from 'pino';
import type { AppEnv } from '../types';

export const pinoLoggerMiddleware = () => {
  const loggerInstance = pino({
    level: 'info',
  });

  return pinoLogger({
    pino: loggerInstance,
    contextKey: 'logger' as const satisfies keyof AppEnv['Variables'],
    http: {
      referRequestIdKey:
        'requestId' as const satisfies keyof AppEnv['Variables'],
      responseTime: true,
      onReqLevel: () => 'info',
      onResLevel: (c) => {
        if (c.res.status >= 500) {
          return 'error';
        }
        if (c.res.status >= 400) {
          return 'warn';
        }

        return 'info';
      },
      onReqBindings: (c) => ({
        req: {
          url: c.req.url,
          method: c.req.method,
        },
      }),
      onResBindings: (c) => ({
        status: c.res.status,
      }),
    },
  });
};
