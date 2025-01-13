import * as semver from 'semver';
import type { ClientEntitlement } from '../../../shared/schemas';
import { type PromotionalOffer } from '../types';

/**
 * @returns true if the app is within the offer's active period
 * (validFrom <= now <= validUntil), otherwise false
 */
const checkOfferWithinActivePeriod = (offer: PromotionalOffer): boolean => {
  const now = new Date();
  const validFrom = new Date(offer.validFrom);
  const validUntil = new Date(offer.validUntil);
  return now >= validFrom && now <= validUntil;
};

/**
 * @returns true if the client version is greater than or equal
 * to the minRequiredVersion, otherwise false
 */
const checkVersionSufficient = ({
  clientVersion,
  minRequiredVersion,
}: {
  clientVersion: string;
  minRequiredVersion: string;
}): boolean => {
  if (!semver.valid(clientVersion) || !semver.valid(minRequiredVersion)) {
    throw new Error('Invalid version format');
  }

  return semver.gte(clientVersion, minRequiredVersion);
};

/**
 *
 * @returns true if the client is eligible for the offer, otherwise false
 */
export const checkOfferEligibility = (
  offer: PromotionalOffer,
  client: { entitlement: ClientEntitlement; appVersion: string },
) => {
  const { entitlement, appVersion } = client;

  const isOfferActive = checkOfferWithinActivePeriod(offer);
  if (!isOfferActive) return false;

  const isEntitled = offer.visibleFor.includes(entitlement);
  if (!isEntitled) return false;

  const isVersionSufficient = checkVersionSufficient({
    clientVersion: appVersion,
    minRequiredVersion: offer.minVersion,
  });
  if (!isVersionSufficient) return false;

  return true;
};
