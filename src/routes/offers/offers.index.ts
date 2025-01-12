import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { checkOfferEligibility } from './helpers/check-offer-eligibility';
import { Entitlement, type PromotionalOffer } from './types';

/**
 * Current available offers
 */
const availableOffers: PromotionalOffer[] = [];

const offersRouter = createRouter();

offersRouter.get(
  '/v1/offers',
  firebaseAuthMiddleware,
  zValidator('json', z.object({ test: z.string() })),
  zValidator(
    'query',
    z.object({
      entitlement: Entitlement,
      app_version: z.string(),
    }),
  ),
  (c) => {
    const { entitlement, app_version: appVersion } = c.req.valid('query');

    const offers: PromotionalOffer[] = availableOffers.filter((offer) =>
      checkOfferEligibility(offer, {
        entitlement,
        appVersion,
      }),
    );

    return c.json({ offers });
  },
);

export { offersRouter };
