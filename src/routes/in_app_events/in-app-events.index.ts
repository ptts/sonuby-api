import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';

type InAppEvent = {
  type: 'event';
  url: string;
};

type InAppEventResponse = InAppEvent | { type: 'unknown' };

const eventIdToEventMap: Partial<Record<string, InAppEvent>> = {
  /**
   * Add events here
   */
} as const;

const inAppEventsRouter = createRouter();

inAppEventsRouter.get(
  '/v1/in_app_events/:eventId',
  firebaseAuthMiddleware,
  zValidator('param', z.object({ eventId: z.string() })),
  zValidator(
    'query',
    z.object({ platform: z.union([z.literal('ios'), z.literal('android')]) }),
  ),
  (c) => {
    const { eventId } = c.req.valid('param');
    const { platform: _platform } = c.req.valid('query');

    const event = eventIdToEventMap[eventId];
    if (event) {
      return c.json(event);
    }

    return c.json({ type: 'unknown' } satisfies InAppEventResponse);
  },
);

export { inAppEventsRouter };
