import type { ClientEntitlement } from '../../shared/schemas';

export type PromotionalOffer = {
  id: string;
  paywallId: string;
  validFrom: string;
  validUntil: string;
  visibleFor: ClientEntitlement[];
  minVersion: string;
};
