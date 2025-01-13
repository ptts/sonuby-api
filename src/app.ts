import type { Context } from 'hono';
import { requestId } from 'hono/request-id';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { pinoLoggerMiddleware } from './middlewares/pino-logger';
import { couponRouter } from './routes/coupon/coupon.index';
import { credentialsRouter } from './routes/credentials/credentials.index';
import { feedbackRouter } from './routes/feedback/feedback.index';
import { indexRouter } from './routes/index.route';
import { offersRouter } from './routes/offers/offers.index';
import { signRouter } from './routes/sign/sign.index';
import { systemNotificationsRouter } from './routes/system-notifications/system-notifications.index';
import { createRouter } from './shared/helpers/create-router';
import { safeSendLogEventToSlack } from './shared/helpers/safe-send-log-event-to-slack';
import { UserError } from './shared/user-error';
import type { AppEnv } from './types';

const createApp = () => {
  const app = createRouter();

  /** Middlewares */
  app.use(requestId());
  app.use(pinoLoggerMiddleware());

  /** Global error handlers */
  app.notFound((c) => {
    const status = StatusCodes.NOT_FOUND;
    const errorMessage = getReasonPhrase(status);
    return c.json({ success: false, error: errorMessage, status }, { status });
  });

  app.onError(async (error, c) => {
    c.var.logger.error({
      userId: c.var.firebaseToken?.sub,
      reqId: c.var.requestId,
      url: c.req.url,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });

    if (error instanceof UserError) {
      if (error.loggingDetails) {
        c.var.logger.error({
          userId: c.var.firebaseToken?.sub,
          reqId: c.var.requestId,
          loggingDetails: error.loggingDetails,
        });

        await safeSendLogEventToSlack(error.loggingDetails, {
          slackWebhookUrl: c.env.SLACK_WEBHOOK_URL,
        });
      }

      const { status } = error;
      return c.json(
        {
          success: false,
          error: error.message || getReasonPhrase(status),
          status,
        },
        { status },
      );
    }

    const status = StatusCodes.INTERNAL_SERVER_ERROR;
    return c.json(
      { success: false, error: getReasonPhrase(status), status },
      { status },
    );
  });

  return app;
};

const app = createApp();
const routes = [
  couponRouter,
  credentialsRouter,
  feedbackRouter,
  indexRouter,
  offersRouter,
  signRouter,
  systemNotificationsRouter,
] as const;
for (const route of routes) {
  app.route('/', route);
}

export type AppContext = Context<AppEnv>;
export { app };
