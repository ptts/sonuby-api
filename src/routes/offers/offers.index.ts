import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { ClientEntitlementSchema } from '../../shared/schemas';
import { checkOfferEligibility } from './helpers/check-offer-eligibility';
import { type PromotionalOffer } from './types';

const availableOffers: PromotionalOffer[] = [
  /**
   * Current available offers
   */
];

const offersRouter = createRouter();

offersRouter.get(
  '/v1/offers',
  firebaseAuthMiddleware,
  zValidator(
    'query',
    z.object({
      entitlement: ClientEntitlementSchema,
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
