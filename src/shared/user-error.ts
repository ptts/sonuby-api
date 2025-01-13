import type { ContentfulStatusCode } from 'hono/utils/http-status';

export type LogEvent = {
  title: string;
  value: unknown;
};

export class UserError extends Error {
  status: ContentfulStatusCode;
  loggingDetails?: LogEvent;
  cause?: unknown;

  constructor(opts: {
    status: ContentfulStatusCode;
    message?: string;
    loggingDetails?: LogEvent;
    cause?: unknown;
  }) {
    super(opts.message, { cause: opts.cause });

    this.cause = opts.cause;
    this.status = opts.status;
    this.loggingDetails = opts.loggingDetails;
  }
}
