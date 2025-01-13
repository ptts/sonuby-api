import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { ClientEnvSchema, ClientPlatformSchema } from '../../shared/schemas';
import { UserError } from '../../shared/user-error';

const couponRouter = createRouter();

couponRouter.get('/v1/store/coupon/:coupon', firebaseAuthMiddleware, (c) => {
  const StorefrontId = {
    couponFiftyPercent: 'coupon_50_pc',
  } as const;
  type StorefrontId = (typeof StorefrontId)[keyof typeof StorefrontId];

  const allowedCouponsWithStorefront: Partial<Record<string, StorefrontId>> = {
    XMAS: StorefrontId.couponFiftyPercent,
  };

  const coupon = c.req.param('coupon');
  if (!coupon || !Object.keys(allowedCouponsWithStorefront).includes(coupon)) {
    throw new UserError({
      status: 400,
      message: 'Invalid coupon',
    });
  }

  const storefrontId = allowedCouponsWithStorefront[coupon];
  if (!storefrontId) {
    throw new UserError({ status: 400, message: 'Invalid coupon' });
  }

  return c.json({ storefrontId });
});

const V15Codes = {
  AUSTN808: 'AUSTN808',
  SUMMER33: 'SUMMER33',
} as const;

couponRouter.get(
  '/v1.5/store/coupon/:coupon',
  firebaseAuthMiddleware,
  zValidator('param', z.object({ coupon: z.string() })),
  zValidator(
    'query',
    z.object({
      platform: ClientPlatformSchema,
      client_env: ClientEnvSchema,
    }),
  ),
  (c) => {
    const { platform, client_env: clientEnv } = c.req.valid('query');
    const coupon = c.req.param('coupon');

    if (coupon === V15Codes.AUSTN808 && platform === 'android') {
      const subscriptionOfferId = 'enthusiast-monthly-austn808';
      const productGroupId = {
        production: 'sonuby_enthusiast_v1',
        staging: 'sonuby_staging_enthusiast_v1',
        beta: 'sonuby_beta_enthusiast_v1',
        development: 'sonuby_dev_enthusiast_v1',
        testing: 'sonuby_enthusiast_v1',
      }[clientEnv];

      return c.json({
        type: 'google_play_subscription_offer',
        productGroupId,
        productId: `${productGroupId}:monthly-autorenewing`,
        subscriptionOfferId,
        code: coupon,
      });
    }

    return c.json({ type: 'unknown_code', code: coupon });
  },
);

export { couponRouter };
