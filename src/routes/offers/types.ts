import { z } from 'zod';

export const Entitlement = z.enum(['free', 'enthusiast']);
export type Entitlement = z.infer<typeof Entitlement>;
export type PromotionalOffer = {
  id: string;
  paywallId: string;
  validFrom: string;
  validUntil: string;
  visibleFor: Entitlement[];
  minVersion: string;
};
