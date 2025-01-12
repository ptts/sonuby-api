import * as semver from 'semver';
import type { Entitlement, PromotionalOffer } from '../types';

const checkOfferWithinActivePeriod = (offer: PromotionalOffer): boolean => {
  const now = new Date();
  const validFrom = new Date(offer.validFrom);
  const validUntil = new Date(offer.validUntil);
  return now >= validFrom && now <= validUntil;
};

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

export const checkOfferEligibility = (
  offer: PromotionalOffer,
  { entitlement, appVersion }: { entitlement: Entitlement; appVersion: string },
) => {
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
